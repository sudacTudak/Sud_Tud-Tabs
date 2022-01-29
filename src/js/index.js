import '../scss/index.scss'
import Tabs from './libs/Tabs'
if (module.hot) {
    module.hot.accept()
}

const tab1 = new Tabs('tab', {
})

const tabs2 = new Tabs('tabs2', {});

tab1.switch(document.querySelector('[data-tabs-category="third"]'))
