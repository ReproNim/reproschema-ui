<template>
  <div class="docked-layout">
    <MainNav title="Sign" :back-to-sign="true" :show-help="false" :show-steps="false"/>
    <section>
      <ConsentContent style="max-width: 40rem; display: block; margin: 0 auto"/>
    </section>
  </div>
</template>


<script>
import ConsentContent from '../web/ConsentContent.vue'
import MainNav from './MainNav.vue'
import NavFooter from './NavFooter.vue'
import Store from '../store'

export default {
  name: 'StudyConsentReview',
  components: { ConsentContent, MainNav, NavFooter }
}
</script>

