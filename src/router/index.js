import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Survey/';
import Landing from '@/components/Landing/';
import BridgeImage from '@/components/study/BridgeImage';
import StudyDashboard from '@/components/StudyDashboard';

/* I love Vue router. Lazy loading the onboarding screens is this simple. */
const StudyIntroduction = () => import(/* webpackChunkName: "study" */ '@/components/study/Introduction');
// const StudyOverview = () => import(/* webpackChunkName: "study" */
// '@/components/study/Overview');
// const StudyEligibility = () => import(/* webpackChunkName: "study" */
// '@/components/study/Eligibility');
const StudyConsent = () => import(/* webpackChunkName: "study" */ '@/components/study/Consent');
const StudyQuiz = () => import(/* webpackChunkName: "study" */ '@/components/study/Quiz');
// const StudySign = () => import(/* webpackChunkName: "study" */ '@/components/study/Sign');
// const StudyRegistration = () =>
// import(/* webpackChunkName: "study" */ '@/components/study/Registration');

Vue.use(Router);
Vue.component('BridgeImage', BridgeImage);

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
      path: '/study/intro',
      component: StudyIntroduction,
    },
    {
      path: '/study/overview',
      component: StudyDashboard,
    },
    {
      path: '/study/consent',
      meta: { step: 0 },
      component: StudyConsent,
    },
    {
      path: '/study/quiz',
      meta: { step: 1 },
      component: StudyQuiz,
    },
    // { path: '/study/sign', meta: { step: 3 }, component: StudySign },
    // { path: '/study/registration', meta: { step: 4 }, component: StudyRegistration },
  ],
});
