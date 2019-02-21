import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Survey/';
import Landing from '@/components/Landing/';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Landing',
      component: Landing,
    },
    {
      path: '/activities/:id',
      name: 'Home',
      component: Home,
    },
  ],
});
