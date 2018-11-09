import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import Landing from '@/components/Landing';
import Centered from '@/components/Centered';

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
    {
      path: '/centered',
      name: 'Centered',
      component: Centered,
    },
  ],
});
