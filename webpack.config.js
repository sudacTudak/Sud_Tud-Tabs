//<ADD PLUGINS>

const path = require('path');
const fs = require('fs')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const CSSMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const CssMqpackerPlugin = require("css-mqpacker-webpack-plugin");


//</ADD PLUGINS>


//<SYSTEM VARS>


const mode = process.env.NODE_ENV;

const devMode = (mode === 'development')
const prodMode = !devMode

//</SYSTEM VARS>


//<SELF VARS>

const PATHS = {
	src: path.resolve(__dirname, 'src'),
	dist: path.resolve(__dirname, 'dist'),
}

const PAGES_DIR = `${PATHS.src}/pug/pages/`
const PAGES = fs.readdirSync(PAGES_DIR).filter(filename => filename.endsWith('.pug'))

//</SELF VARS>


//<RENDERING FUNCTIONS>

const optimization = () => {
	const config = {
		splitChunks: {
			chunks: 'all'
		}
	}

	if (prodMode) {
		config.minimize = true
		config.minimizer = [
			new CSSMinimizerWebpackPlugin(),
			new TerserWebpackPlugin(),
			new CssMqpackerPlugin(),
		]
	} else {
		config.runtimeChunk = 'single' 
	}

	return config
}


const getFilename = (extension) => devMode? `[name].${extension}`: `[name].[contenthash].${extension}`


const renderPlugins = () => {
	const plugins = [
		...PAGES.map(page => new HTMLWebpackPlugin({
			template: `${PAGES_DIR}/${page}`,
			filename: `./${page.replace(/\.pug/, '.html')}`,
			minify: {
				collapseWhitespace: prodMode
			}
		})),

		new CopyWebpackPlugin({
			patterns: [
				{
					from: path.resolve(__dirname, 'src/favicon.ico'),
					to: path.resolve(__dirname, 'dist')
				},
			]
		}),

		new MiniCssExtractPlugin({
			filename: getFilename('css')
		}),
	]

	if (prodMode) {
		plugins.push(new BundleAnalyzerPlugin())
	} 

	return plugins
}

//</RENDERING FUNCTIONS>


//<CONFIG>

module.exports = {
	mode,
	target: devMode ? "web": "browserslist",
	entry: {
		main: ['@babel/polyfill' ,`./src/js/index.js`],
	},
	output: {
		filename: getFilename('js'),
		path: PATHS.dist,
		publicPath: `auto`,
		assetModuleFilename: 'images/[hash][ext][query]',
		clean: true,
	},
	resolve: {
		extensions: ['.js', '.json'],
		alias: {
			'@jsLibs': `${PATHS.src}/js/libs`,
			'@src': PATHS.src,
			'@img': `${PATHS.src}/images`,
			'@icons': `@img/icons`
		}
	},
	optimization: optimization(),
	devtool: devMode? 'source-map' : false,
	devServer: {
		historyApiFallback: true,
		static: {
			directory: PATHS.dist,
			publicPath: `auto`,
		},
		compress: true,
		open: true,
		hot: devMode,
		port: 8080,
	},
	plugins: renderPlugins(),
	module: {
		rules: [
			{
				test: /\.pug$/,
				loader: "pug-loader"
			},
			{
				test: /\.html$/,
				loader: "html-loader"
			},
			{
				test: /\.(sa|sc|c)ss$/,
				use: [
					devMode ? "style-loader" : MiniCssExtractPlugin.loader,
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [
									[
										'postcss-preset-env',
										{
											
										},
									]
								]
							},
						},
					},
					'sass-loader'
				]
			},
			{
				test: /\.(png|jpe?g|gif|webp|ico)$/i,
				type: devMode? 'asset/resource' : 'asset',
			},
			{
				test: /\.(ttf|woff2?|eot|otf|svg)$/i,
				type: 'asset/inline'
			},
			{
				test: /\.xml$/,
				use: ['xml-loader']
			},
			{
				test: /\.csv$/,
				use: ['csv-loader']
			},
			{
				test: /\.m?js$/,
				exclude: /node_modules/,
				use: [
					{
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
						plugins: ["@babel/plugin-proposal-class-properties"]
					}
					}
				]
			}
		]
	}
}

//</CONFIG>