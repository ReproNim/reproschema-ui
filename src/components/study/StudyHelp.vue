<template>
  <div class="docked-layout">
    <MainNav title="Back" :show-back="true"/>
    <section class="smooth-scroller">
      <FaqContent/>
    </section>
  </div>
</template>

<script>
import MainNav from './MainNav.vue';
import Footer from '../web/Footer.vue';
import FaqContent from '../web/FaqContent.vue';

export default {
  name: 'StudyHelp',
  components: { MainNav, Footer, FaqContent }
}
</script>
