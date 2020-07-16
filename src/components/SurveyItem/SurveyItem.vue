<template>
  <b-card class="text-center question mx-auto w-100" :border-variant="variant" :style="style"
          :no-body="ui === 'multipart' || ui === 'section'">
    <!-- https://codepen.io/vikttor_/pen/jeqoPN?page=1& -->
    <div class="contextItem align-self-center center w-100">
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
                       :reprotermsUrl="reprotermsUrl"
                       :ipAddress="clientIp"
                       :showPassOptions="showPassOptions"
                       v-on:skip="sendSkip"
                       v-on:dontKnow="sendDontKnow"
                       v-on:next="sendNext"
                       v-on:valueChanged="sendData"
        />

        <div class="loader" v-else-if="status !== 'ready'">
          <Loader />
        </div>
        <multipart v-else-if="ui === 'multipart'"
                   :progress="mp_progress"
                   :responses="mp_responses"
                   :srcUrl="item['@id']"
                   :showPassOptions="showPassOptions"
                   :selected_language="selected_language"
                   :reprotermsUrl="reprotermsUrl"
                   :ipAddress="clientIp"
                   v-on:skip="sendSkip"
                   v-on:dontKnow="sendDontKnow"
                   v-on:next="sendNext"
                   v-on:valueChanged="sendDataAndGoNext"
                   v-on:saveResponse="setMPResponse"
                   v-on:saveScores="setScore"
                   v-on:updateProgress="setMPProgress"
                   v-on:clearResponses="clearMPResponses"
        />
        <subactivity v-else-if="ui === 'section'"
                     :progress="mp_progress"
                     :responses="mp_responses"
                     :srcUrl="item['@id']"
                     :showPassOptions="showPassOptions"
                     :selected_language="selected_language"
                     :reprotermsUrl="reprotermsUrl"
                     :ipAddress="clientIp"
                     v-on:skip="sendSkip"
                     v-on:dontKnow="sendDontKnow"
                     v-on:next="sendNext"
                     v-on:valueChanged="sendDataAndGoNext"
                     v-on:saveResponse="setMPResponse"
                     v-on:saveScores="setScore"
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

// const reproterms = 'https://raw.githubusercontent.com/ReproNim/reproschema/master/terms/';


export default {
  name: 'SurveyItem',
  props: {
    reprotermsUrl: {
      type: String,
    },
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
    selected_language: {
      type: String,
    },
    clientIp: {
      type: String,
    },
    showPassOptions: {
      type: Object,
    },
    surveyStart: {
      type: Number,
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
    style() {
      if (this.ui === 'section' || this.ui === 'multipart') {
        return {
          'border-color': 'white',
          '-webkit-box-flex': 1,
          flex: '1 1 auto',
        };
      }
      return {
        width: '100%',
      };
    },
    bodyStyle() {
      if (this.ui === 'section' || this.ui === 'multipart') {
        return {
          padding: 0,
        };
      }
      return {};
    },
    ui() {
      /* eslint-disable */
        if (this.data[`${this.reprotermsUrl}inputType`]) {
          return this.data[`${this.reprotermsUrl}inputType`][0]['@value'];
        }
        return 'N/A';
        /* eslint-enable */
    },
    widgetType() {
      if (this.data[`${this.reprotermsUrl}readOnly`]) {
        return this.data[`${this.reprotermsUrl}readOnly`][0]['@value'];
      }
      return false;
    },
    title() {
      if (this.data['http://schema.org/question']) {
        const activeQuestion = _.filter(this.data['http://schema.org/question'], q => q['@language'] === this.selected_language);
        if (!Array.isArray(activeQuestion) || !activeQuestion.length) {
          // array does not exist, is not an array, or empty - when selected_language string absent
          // ⇒ return value in default language
          const answeredLanguage = this.data['http://schema.org/question'][0]['@language'];
          this.$store.dispatch('setAnsweredLanguage', answeredLanguage); // set default language present
          return this.data['http://schema.org/question'][0]['@value'];
        }
        this.$store.dispatch('setAnsweredLanguage', activeQuestion[0]['@language']); // set selected_language
        return activeQuestion[0]['@value'];
      }
      return null;
    },
    itemPreamble() {
      if (this.data[`${this.reprotermsUrl}preamble`]) {
        const activePreamble = _.filter(this.data[`${this.reprotermsUrl}preamble`], q => q['@language'] === this.selected_language);
        return activePreamble[0]['@value'];
      }
      return null;
    },
    valueConstraints() {
      if (this.data[`${this.reprotermsUrl}responseOptions`]) {
        // eslint-disable-next-line
        // console.log(216, this.data[`${this.reprotermsUrl}responseOptions`]);
        return this.valueC;
      }
      /* eslint-enable */
      return { requiredValue: false };
    },
    findPassOptions() {
      if (this.data[`${this.reprotermsUrl}responseOptions`]) {
        // when responseOptions is a remote object
        if (Object.keys(this.data[`${this.reprotermsUrl}responseOptions`][0]).indexOf('@id') > -1) {
          this.getRequiredVal();
          return this.requireVal;
        }
        // when responseOptions in embedded in item object itself
        if (this.data[`${this.reprotermsUrl}responseOptions`][0]) {
          // make sure the requiredValue key is defined
          // todo: requiredValue has moved to activity level, so change the code here
          if (this.data[`${this.reprotermsUrl}responseOptions`][0][`${this.reprotermsUrl}requiredValue`]) {
            return this.data[`${this.reprotermsUrl}responseOptions`][0][`${this.reprotermsUrl}requiredValue`][0]['@value'];
          }
        }
      }
      return false;
    },
  },
  methods: {
    getRequiredVal() { // todo: this needs to change. requiredValue is in activity level now
      jsonld.expand(this.data[`${this.reprotermsUrl}responseOptions`][0]['@id'])
        .then((rsp) => {
          // console.log(237, rsp);
          this.requireVal = rsp[0][`${this.reprotermsUrl}requiredValue`][0]['@value'];
          // eslint-disable-next-line no-unused-vars
        }).catch((e) => {
          // console.log(240, 'constraint error', e);
          jsonld.expand(`${this.data[`${this.reprotermsUrl}responseOptions`][0]['@id']}.jsonld`).then((resp) => {
            // console.log(250, resp);
            this.requireVal = resp[0][`${this.reprotermsUrl}requiredValue`][0]['@value'];
            // eslint-disable-next-line no-unused-vars
          }).catch((e1) => {
            // console.log(252, e1);
          });
        });
    },
    getValueConstraintsData(url) {
      jsonld.expand(url).then((rsp) => {
        this.valueC = rsp[0];
        // eslint-disable-next-line no-unused-vars
      }).catch((e) => {
        // console.log(254, e);
        jsonld.expand(`${url}.jsonld`).then((rsp) => {
          this.valueC = rsp[0];
          // eslint-disable-next-line no-unused-vars
        }).catch((e2) => {
          // console.log(267, e2);
        });
      });
    },
    processActivityData(resp) {
      // console.log(247, resp);
      if (resp.length) {
        this.data = resp[0];
        if (this.data[`${this.reprotermsUrl}responseOptions`]) {
          if (Object.keys(this.data[`${this.reprotermsUrl}responseOptions`][0]).indexOf('@id') > -1) {
            // console.log(260, this.data[`${this.reprotermsUrl}responseOptions`][0]['@id']);
            this.getValueConstraintsData(this.data[`${this.reprotermsUrl}responseOptions`][0]['@id']);
          } else {
            this.valueC = this.data[`${this.reprotermsUrl}responseOptions`][0];
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
    },
    getData() {
      // console.log(242, this.item['@id']);
      jsonld.expand(this.item['@id'], {
        onDownloadProgress() {
          // TODO: for some reason pEvent has total defined as 0.
          // so a progress bar won't work here.
        },
      }).then((resp) => {
        this.processActivityData(resp);
        // eslint-disable-next-line no-unused-vars
      }).catch((e) => {
        // console.log(270, e);
        jsonld.expand(`${this.item['@id']}.jsonld`).then((resp) => {
          // console.log(272, 'success', resp);
          this.processActivityData(resp);
          // eslint-disable-next-line no-unused-vars
        }).catch((e1) => {
          // console.log(this.item['@id'], e1);
        });
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
      // console.log('sending data and going next', val);
      this.variant = null;
      /* eslint-enable */
      this.$emit('setData', val, this.index);
      this.sendNext();
    },
    setScore(key, scoreObj) {
      this.$emit('setScores', scoreObj, this.index);
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
