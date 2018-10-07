import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import Centered from '@/components/Centered';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
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
