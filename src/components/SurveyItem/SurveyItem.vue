<template>
  <b-card class="text-center question mx-auto" :border-variant="variant">
    <!-- https://codepen.io/vikttor_/pen/jeqoPN?page=1& -->
    <div class="contextItem align-self-center center">
      <transition name="fade" mode="out-in">
        <InputSelector v-if="status === 'ready' && ui !== 'multipart' && ui !== 'section'"
                       :inputType="ui"
                       :readOnly="widgetType"
                       :title="title"
                       :preamble="itemPreamble"
                       :valueConstraints="valueConstraints"
                       :init="init"
                       :responses="responses"
                       :selected_language="selected_language"
                       :showPassOptions="showPassOptions"
                       v-on:skip="sendSkip"
                       v-on:dontKnow="sendDontKnow"
                       v-on:next="sendNext"
                       v-on:valueChanged="sendData"
        />

        <div class="loader" v-else-if="status !== 'ready'">
          <!-- <b-progress :value="50"
          :max="100" animated variant="secondary" class="mb-3 align-middle">
          </b-progress>
          <span class="align-middle mt-3 text-muted">loading</span> -->
          <Loader />
        </div>
        <multipart v-else-if="ui === 'multipart'"
                   :progress="mp_progress"
                   :responses="mp_responses"
                   :srcUrl="item['@id']"
                   :showPassOptions="showPassOptions"
                   v-on:skip="sendSkip"
                   v-on:dontKnow="sendDontKnow"
                   v-on:next="sendNext"
                   v-on:valueChanged="sendDataAndGoNext"
                   v-on:saveResponse="setMPResponse"
                   v-on:updateProgress="setMPProgress"
                   v-on:clearResponses="clearMPResponses"
        />
        <subactivity v-else-if="ui === 'section'"
                   :progress="mp_progress"
                   :responses="mp_responses"
                   :srcUrl="item['@id']"
                   :showPassOptions="showPassOptions"
                   v-on:skip="sendSkip"
                   v-on:dontKnow="sendDontKnow"
                   v-on:next="sendNext"
                   v-on:valueChanged="sendDataAndGoNext"
                   v-on:saveResponse="setMPResponse"
                   v-on:updateProgress="setMPProgress"
                   v-on:clearResponses="clearMPResponses"
        />
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
import InputSelector from '../InputSelector/';
import Loader from '../Loader/';
import MultiPart from '../MultiPart';
import Section from '../Section';

export default {
  name: 'SurveyItem',
  props: {
    item: {
      type: Object,
    },
    index: {
      type: Number,
    },
    init: {

    },
    responses: {
      type: Object,
    },
    score: {
      type: Number,
    },
    selected_language: {
      type: String,
    },
    showPassOptions: {
      type: Object,
    },
  },
  components: {
    InputSelector,
    multipart: MultiPart,
    subactivity: Section,
    Loader,
  },
  data() {
    return {
      data: [],
      valueC: [],
      status: 'loading',
      mp_responses: {},
      mp_progress: 0,
      variant: null,
      requireVal: false,
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
    widgetType() {
      if (this.data['https://schema.repronim.org/readOnly']) {
        return this.data['https://schema.repronim.org/readOnly'][0]['@value'];
      }
      return false;
    },
    title() {
      if (this.data['http://schema.org/question']) {
        const activeQuestion = _.filter(this.data['http://schema.org/question'], q => q['@language'] === this.selected_language);
        return activeQuestion[0]['@value'];
      }
      return null;
    },
    itemPreamble() {
      if (this.data['http://schema.repronim.org/preamble']) {
        const activePreamble = _.filter(this.data['http://schema.repronim.org/preamble'], q => q['@language'] === this.selected_language);
        return activePreamble[0]['@value'];
      }
      return null;
    },
    valueConstraints() {
      if (this.data['https://schema.repronim.org/valueconstraints']) {
        // eslint-disable-next-line
          return this.valueC;
      }
      /* eslint-enable */
      return { requiredValue: false };
    },
    findPassOptions() {
      if (this.data['https://schema.repronim.org/valueconstraints']) {
        // when valueConstraints is a remote object
        if (Object.keys(this.data['https://schema.repronim.org/valueconstraints'][0]).indexOf('@id') > -1) {
          this.getRequiredVal();
          return this.requireVal;
        }
        // when valueConstraints in embedded in item object itself
        if (this.data['https://schema.repronim.org/valueconstraints'][0]) {
          // make sure the requiredValue key is defined
          if (this.data['https://schema.repronim.org/valueconstraints'][0]['http://schema.repronim.org/requiredValue']) {
            return this.data['https://schema.repronim.org/valueconstraints'][0]['http://schema.repronim.org/requiredValue'][0]['@value'];
          }
        }
      }
      return false;
    },
  },
  methods: {
    getRequiredVal() {
      jsonld.expand(this.data['https://schema.repronim.org/valueconstraints'][0]['@id'])
        .then((rsp) => {
          this.requireVal = rsp[0]['http://schema.repronim.org/requiredValue'][0]['@value'];
          // console.log(143, this.requireVal);
        });
    },
    getData() {
      jsonld.expand(this.item['@id'], {
        onDownloadProgress() {
          // TODO: for some reason pEvent has total defined as 0.
          // so a progress bar won't work here.
        },
      }).then((resp) => {
        if (resp.length) {
          this.data = resp[0];
          if (this.data['https://schema.repronim.org/valueconstraints']) {
            if (Object.keys(this.data['https://schema.repronim.org/valueconstraints'][0]).indexOf('@id') > -1) {
              jsonld.expand(this.data['https://schema.repronim.org/valueconstraints'][0]['@id']).then((rsp) => {
                this.valueC = rsp[0];
              });
            } else {
              this.valueC = this.data['https://schema.repronim.org/valueconstraints'][0];
            }
          } else {
            // console.log(this.data);
            // throw Error('This is not a properly formatted jsonld schema');
            // console.info('there are no value constraints');
            this.valueC = {
              '@value': null,
            };
          }
          this.status = 'ready';
        }
      });
    },
    sendSkip(doSkip) {
      // send that the component got skipped to the parent
      if (doSkip) {
        this.variant = 'warning';
      }
      this.$emit('skip');
    },
    sendDontKnow() {
      // send the dont know answer to the parent
      this.variant = 'info';
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
    sendDataAndGoNext(val) {
      console.log('sending data and going next', val);
      this.variant = null;
      /* eslint-enable */
      this.$emit('setData', val, this.index);
      this.sendNext();
    },
    setMPResponse(index, value) {
      // console.log('setting response of multipart item', index, value);
      this.mp_responses[index] = value;
    },
    clearMPResponses() {
      this.mp_responses = {};
      this.mp_progress = 0;
      this.$emit('setData', {}, this.index);
    },
    setMPProgress(progress) {
      this.mp_progress = progress;
    },
  },
  mounted() {
    this.getData();
    if (this.init) {
      if (this.init === 'skipped') {
        this.variant = 'warning';
      } else if (this.init === 'dontKnow') {
        this.variant = 'info';
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
