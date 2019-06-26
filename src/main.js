// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store/store';

Vue.config.productionTip = false;

Vue.mixin({
  beforeCreate() {
    const options = this.$options;
    if (options.store) {
      this.$store = options.store;
    } else if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store;
    }
  },
});

Vue.directive('freeze', {
  inserted(el) {
    el.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (e.target.nodeName === 'A' || e.target.nodeName === 'BUTTON') {
        e.target.click();
      }
    });
  },
});

const SCREENS_W_BGS = ['/study/intro', '/study/overview', '/study/retake-quiz',
  '/study/ineligible', '/study/done'];

router.beforeEach((to, from, next) => {
  document.documentElement.classList.toggle('consent', SCREENS_W_BGS.some(segment => to.path === segment));
  next();
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>',
});
