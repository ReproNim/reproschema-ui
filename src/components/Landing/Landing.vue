<template>
  <div class="docked-layout">
    <section v-if="selectedContent" id="smooth-scroller"
             class="smooth-scroller" style="padding-top: 0">
      <vue-markdown :source="selectedContent.content"></vue-markdown>
    </section>
    <Loader v-else/>
    <p class="button-para">
      <button class="join-button" @click="doNext">{{ startButton }}</button>
    </p>
  </div>
</template>

<script>
import _ from 'lodash';
import VueMarkdown from 'vue-markdown';
import Loader from '../Loader';
import config from '../../config';

export default {
  name: 'Landing',
  props: {
    startButton: {
      type: String,
    },
    selected_language: {
      type: String,
    },
    contents: {
      type: Object,
    },
  },
  components: {
    VueMarkdown,
    Loader,
  },
  data() {
    return {
      content: {},
      consent: config.consent,
    };
  },
  computed: {
    reprotermsUrl() {
      return this.$store.getters.getTermsUrl;
    },
    selectedContent() {
      const landingC = _.filter(this.$store.state.landing, c => c['@language'] === this.selected_language);
      if (_.isEmpty(landingC)) {
        return (this.$store.state.landing)[0]; // return default language content
      }
      return landingC[0];
    },
  },
  methods: {
    doBack() {
      if (this.step > 1) {
        this.step -= 1;
      }
    },
    doNext() {
      if (this.consent) {
        // console.log(50, this.consent);
        // integrate docusign here
      }
      this.$router.push('/activities/0');
    },
  },
};
</script>

<style scoped>
  button {
    border: none;
  }

  .button-para {
    margin-left: 1rem;
    margin-top: 2rem;
  }

  section:nth-child(odd) {
    width: 100%;
    background-color: rgba(238, 238, 238, 0.3);
  }
  .join-button {
    background-color: #F5B33C;
    color: #1A1C29!important;
    border-radius: 100px;
    border: none;
    display: inline-block;
    margin: .2rem 0;
    padding: .4rem 1.6rem;
    text-decoration: none;
    font-weight: bold;
  }

  /* DOCKED LAYOUT (header annd footer at top and bottom of viewport,
  center elements each scroll) */
  .docked-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
  }
  .docked-layout > section {
    flex: 1;
    overflow-y: auto;
    position: relative;
  }
  .docked-layout > section.smooth-scroller {
    -webkit-overflow-scrolling: touch;
  }
</style>
