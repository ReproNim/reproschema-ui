<template>
  <b-card class="text-center question mx-auto" :border-variant="variant">
    <!-- https://codepen.io/vikttor_/pen/jeqoPN?page=1& -->
    <div class="contextItem align-self-center center">
      <transition name="fade" mode="out-in">
        <InputSelector v-if="status === 'ready'"
         :inputType="ui"
         :title="title"
         :valueConstraints="valueConstraints"
         :init="init"
         :responses="responses"
         :selected_language="selected_language"
         v-on:skip="sendSkip"
         v-on:dontKnow="sendDontKnow"
         v-on:next="sendNext"
         v-on:valueChanged="sendData"
         />
        <div class="loader" v-else>
          <!-- <b-progress :value="50"
          :max="100" animated variant="secondary" class="mb-3 align-middle">
          </b-progress>
          <span class="align-middle mt-3 text-muted">loading</span> -->
          <Loader />
        </div>
      </transition>
    </div>
  </b-card>
</template>

<style scoped>

  .question {
    /* max-width: 500px; */
  }

  .loader {
    padding-top: 75px;
    padding-bottom: 50px;
  }

  /* .card-body {
    min-height: 270px;
    box-sizing: border-box;
    position: relative;
  } */

  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }

  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }

</style>

<script>
// import axios from 'axios';
import jsonld from 'jsonld/dist/jsonld.min';
import _ from 'lodash';
import InputSelector from './InputSelector';
import Loader from './Loader';


export default {
  name: 'contextItem',
  props: ['item', 'index', 'init', 'responses', 'score', 'selected_language'],
  components: {
    InputSelector,
    Loader,
  },
  data() {
    return {
      data: [],
      valueC: [],
      status: 'loading',
      progress: 0,
      variant: null,
    };
  },
  computed: {
    ui() {
      /* eslint-disable */
      if (this.data['https://schema.repronim.org/inputType']) {
        return this.data['https://schema.repronim.org/inputType'][0]['@value'];
      }
      return 'N/A';
      /* eslint-enable */
    },
    title() {
      const activeQuestion = _.filter(this.data['http://schema.org/question'], q => q['@language'] === this.selected_language);
      return activeQuestion[0]['@value'];
    },
    valueConstraints() {
      if (this.data['https://schema.repronim.org/valueconstraints']) {
        // eslint-disable-next-line
        return this.valueC;
      }
      /* eslint-enable */
      return { requiredValue: false };
    },
  },
  methods: {
    getData() {
      jsonld.expand(this.item['@id'], {
        onDownloadProgress() {
          // TODO: for some reason pEvent has total defined as 0.
          // so a progress bar won't work here.
        },
      }).then((resp) => {
        this.data = resp[0];
        if (Object.keys(this.data['https://schema.repronim.org/valueconstraints'][0]).indexOf('@id') > -1) {
          jsonld.expand(this.data['https://schema.repronim.org/valueconstraints'][0]['@id']).then((rsp) => {
            this.valueC = rsp[0];
          });
        } else {
          this.valueC = this.data['https://schema.repronim.org/valueconstraints'][0];
        }
        this.status = 'ready';
      });
    },
    sendSkip(doSkip) {
      // send that the component got skipped to the parent
      if (doSkip) {
        this.variant = 'warning';
      }
      this.$emit('skip');
    },
    sendDontKnow(doDontKnow) {
      // send the dont know answer to the parent
      if (doDontKnow) {
        this.variant = 'warning';
      }
      this.$emit('dontKnow');
    },
    sendNext() {
      this.$emit('next');
    },
    sendData(val) {
      this.variant = null;
      /* eslint-enable */
      this.$emit('setData', val, this.index);
    },
  },
  mounted() {
    this.getData();
    if (this.init) {
      if (this.init.skipped) {
        this.variant = 'warning';
      }
    }
  },
  watch: {
    item: {
      handler() {
        this.getData();
      },
      deep: true,
    },
  },
};
</script>
