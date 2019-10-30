import Vue from 'vue';
import BridgeImage from '@/components/BridgeImage';
import Router from 'vue-router';
import Home from '@/components/Survey/';
import Landing from '@/components/Landing/';
import StudyIntroduction from '@/components/StudyIntroduction/';
import config from '../config';

Vue.use(Router);
Vue.component('BridgeImage', BridgeImage);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Landing',
      component: Landing,
      props: {
        contentSrc: config.contentSrc,
      },
    },
    {
      path: '/study/intro',
      name: StudyIntroduction,
      component: StudyIntroduction,
    },
    {
      path: '/activities/:id',
      name: 'Home',
      component: Home,
    },
  ],
});
