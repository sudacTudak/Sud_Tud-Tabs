export default class Tabs {
    constructor(selector, options) {
        let defaultOptions = {
            isChanged: () => {}
        }
        this.options = Object.assign(defaultOptions, options);
        this.selector = selector;
        this.tabs = document.querySelector(`[data-tabs="${selector}"]`);
        if (!this.tabs) {return};
        this.tabsList = this.tabs.querySelector('.nav-tabs');
        this.tabsButtons = this.tabsList.querySelectorAll('.nav-tabs__btn');
        this.tabsPanels = this.tabs.querySelectorAll('.tabs__panel');

        this.check();
        this.init();
        this.events();
    }

    check() {
        if (document.querySelectorAll(`[data-tabs="${this.selector}"]`).length > 1) {return}
        
        if (this.tabsButtons.length !== this.tabsPanels.length) {return}
    }

    init() {
        this.tabsList.setAttribute('role', 'tablist');

        this.tabsButtons.forEach((elem, i) => {
            const btnCategory = elem.dataset.tabsCategory;

            elem.setAttribute('role', 'tab');
            elem.setAttribute('tabindex', '-1');
            elem.classList.remove('nav-tabs__btn--active');
            btnCategory ? elem.setAttribute('id', `${this.selector}_${btnCategory}`) : elem.setAttribute('id', `${this.selector}_${i+1}`);
        });

        this.tabsPanels.forEach((elem, i) => {
            elem.setAttribute('role', 'tabpanel');
            elem.setAttribute('tabindex', '-1');
            elem.setAttribute('aria-labelledby', this.tabsButtons[i].id);
            elem.classList.remove('tabs__panel--active');
        });

        this.tabsButtons[0].classList.add('nav-tabs__btn--active');
        this.tabsButtons[0].removeAttribute('tabindex');
        this.tabsButtons[0].setAttribute('aria-selected', 'true');
        this.tabsPanels[0].classList.add('tabs__panel--active');
    }

    events() {
        this.tabsButtons.forEach((elem, i) => {
            elem.addEventListener('click', (e) => {
                let currentTab = this.tabsList.querySelector('[aria-selected]');

                if (e.currentTarget !== currentTab) {
                    this.switch(e.currentTarget, currentTab);
                }
            })

            elem.addEventListener('keydown', (e) => {
                let index = Array.prototype.indexOf.call(this.tabsButtons, e.currentTarget);
                let dir = null;

                switch (e.code) {
                    case 'ArrowLeft':
                        dir = index - 1;
                        break;
                    case 'ArrowRight':
                        dir = index + 1;
                        break;
                    case 'ArrowDown':
                        dir = 'down'
                        break;
                    default:
                        dir = null;
                        break;
                }
                if (dir === null) {return};
                dir === 'down' ? this.tabsPanels[i].focus() : this.tabsButtons[dir] ? this.switch(this.tabsButtons[dir], e.currentTarget) : undefined;
            })
        })
    }

    switch(newTab, oldTab = this.tabsButtons[0]) {
        oldTab.classList.remove('nav-tabs__btn--active');
        oldTab.removeAttribute('aria-selected');
        oldTab.setAttribute('tabindex', '-1');
        
        newTab.focus();
        newTab.removeAttribute('tabindex');
        newTab.classList.add('nav-tabs__btn--active');
        newTab.setAttribute('aria-selected', 'true');

        let newIndex = Array.prototype.indexOf.call(this.tabsButtons, newTab);
        let oldIndex = Array.prototype.indexOf.call(this.tabsButtons, oldTab);

        this.tabsPanels[oldIndex].classList.remove('tabs__panel--active');
        this.tabsPanels[newIndex].classList.add('tabs__panel--active');

        this.options.isChanged(this);
    }
}