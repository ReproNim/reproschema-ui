<template>
  <div>
    <div v-if="!listShow.length">
      <h1 >Loading...</h1>
      <!-- <Loader /> -->
    </div>
    <div v-else>
      <!-- <b-progress :value="progress" :max="100" class="mb-3"></b-progress> -->
      <div v-if="preambleText" class="preamble-text mb-2">
        <strong> {{ preambleText }} ({{currentIndex + 1}} / {{context.length}})</strong>
      </div>
    </div>
      <survey-item
        :key="currentItem['@id']"
        :item="currentItem" :index="currentIndex"
        :init="responses[currentItem['@id']]"
        v-on:skip="nextQuestion(currentIndex, 1, 0)"
        v-on:dontKnow="nextQuestion(currentIndex, 0, 1)"
        v-on:next="nextQuestion(currentIndex, 0)"
        v-on:setData="setResponse"
        :responses="responses"
        :selected_language="selected_language"
        :score="score"
        :showPassOptions="showPassOptions"
      />


    <div class="text-right mt-3" v-if="showPassOptions !== null ">
      <b-button variant="default"
                @click="restart">Restart</b-button>
      <b-button variant="default" v-if="showPassOptions['dontKnow']"
                @click="dontKnow">Don't Know</b-button>
      <b-button variant="default" v-if="showPassOptions['skip']"
                @click="skip">Skip</b-button>
    </div>
  </div>
</template>

<script>
import jsonld from 'jsonld/dist/jsonld.min';
import _ from 'lodash';
import Loader from '../Loader/';

const safeEval = require('safe-eval');

const reproterms = 'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/terms/';

export default {
  name: 'MultiPart',
  props: {
    srcUrl: {
      type: String,
    },
    progress: {
      type: Number,
    },
    responses: {
      type: Object,
    },
    selected_language: {
      type: String,
      default: 'en',
    },
    showPassOptions: {
      type: Object,
    },
  },
  data() {
    return {
      activity: {},
      listShow: [],
      parsedJSONLD: {},
      visibility: {},
      score: 0,
      currentIndex: 0,
    };
  },
  components: {
    Loader,
  },
  mounted() {
    if (this.srcUrl) {
      // eslint-disable-next-line
      this.getData();
    }
  },
  methods: {
    getData() {
      // this.$store.dispatch('getActivityData');
      jsonld.expand(this.srcUrl).then((resp) => {
        this.activity = resp[0];
        this.listShow = [0];
        this.$nextTick(() => {
          const answered = _.filter(this.context, c =>
            Object.keys(this.responses).indexOf(c['@id']) > -1);
          if (!answered.length) {
            this.listShow = [0];
          } else {
            this.listShow = _.map(new Array(answered.length + 1), (c, i) => i);
          }
          this.visibility = this.getVisibility(this.responses);
        });
      });
    },
    getVisibility(responses) {
      const responseMapper = this.responseMapper(responses);
      if (!_.isEmpty(this.activity[`${reproterms}visibility`])) {
        const visibilityMapper = {};
        _.map(this.activity[`${reproterms}visibility`], (a) => {
          let val = a['@value'];
          if (_.isString(a['@value'])) {
            val = this.evaluateString(a['@value'], responseMapper);
          }
          if (responseMapper[a['@index']]) {
            visibilityMapper[responseMapper[a['@index']].ref] = val;
          }
          // visibilityMapper[responseMapper[a['@index']].ref] = val;
        });
        return visibilityMapper;
      }
      return {};
    },
    responseMapper(responses) {
      const keys = _.map(this.order, c => c['@id']); // Object.keys(this.responses);

      // a variable map is defined! great
      if (this.activity[`${reproterms}variableMap`]) {
        const vmap = this.activity[`${reproterms}variableMap`][0]['@list'];
        const keyArr = _.map(vmap, (v) => {
          const key = v[`${reproterms}isAbout`][0]['@id'];
          const qId = v[`${reproterms}variableName`][0]['@value'];
          const val = responses[key];
          return { key, val, qId };
        });
        const outMapper = {};
        _.map(keyArr, (a) => {
          outMapper[a.qId] = { val: a.val, ref: a.key };
        });
        return outMapper;
      }

      // TODO: delete the code below once the schema is set!
      // we keep this for compatibility until everything is fixed.
      const keyArr = _.map(keys, (key) => {
        const val = responses[key];
        const filenameParts = key.split('/');
        const filename = filenameParts[filenameParts.length - 1];
        const qId = filename.split('.jsonld')[0];
        return { key, val, qId };
      });

      const outMapper = {};
      _.map(keyArr, (a) => {
        outMapper[a.qId] = { val: a.val, ref: a.key };
      });

      return outMapper;
    },
    evaluateString(string, responseMapper) {
      const keys = Object.keys(responseMapper);
      let output = string;
      _.map(keys, (k) => {
        // grab the value of the key from responseMapper
        let val = responseMapper[k].val;
        if (val !== 'skipped' && val !== 'dontknow') {
          if (_.isString(val)) {
            val = `'${val}'`; // put the string in quotes
          }
          output = output.replace(k, val);
        } else {
          output = output.replace(k, 0);
        }
      });
      return safeEval(output);
    },
    restart() {
      this.currentIndex = 0;
      this.listShow = [0];
      this.$emit('clearResponses');
    },
    skip(val) {
      this.$emit('skip', val);
    },
    dontKnow() {
      this.$emit('dontKnow');
    },
    updateProgress() {
      const totalQ = this.context.length;
      // TODO: add back branching logic to this.
      // if (!_.isEmpty(this.visibility)) {
      //   totalQ = _.filter(this.visibility).length;
      // }
      const progress = ((Object.keys(this.responses).length) / totalQ) * 100;
      this.$emit('updateProgress', progress);
      if (progress === 100) {
        this.$emit('valueChanged', this.responses);
      }
    },
    setResponse(value, index) {
      this.$emit('saveResponse', this.context[index]['@id'], value);
      const currResponses = { ...this.responses };
      currResponses[this.context[index]['@id']] = value;
      // TODO: add back branching logic
      // this.visibility = this.getVisibility(currResponses);

      // TODO: add back scoring logic to this component.
      // if (!_.isEmpty(this.activity[reproterms+'scoringLogic'])) {
      //   this.evaluateScoringLogic();
      // }
      this.updateProgress();
      this.$forceUpdate();
    },
    nextQuestion(idx, skip, dontKnow) {
      if (skip) {
        this.setResponse('skipped', idx);
      }
      if (dontKnow) {
        this.setResponse('dontKnow', idx);
      }

      if (this.currentIndex < this.context.length - 1) {
        this.currentIndex = Object.keys(this.responses).length;
      }
    },
  },
  watch: {
    srcUrl() {
      if (this.srcUrl) {
        this.getData();
      }
    },
  },
  computed: {
    currentItem() {
      return this.context[this.currentIndex];
    },
    order() {
      return this.activity[`${reproterms}order`][0]['@list'];
    },
    context() {
      if (this.activity[`${reproterms}order`]) {
        const keys = this.activity[`${reproterms}order`][0]['@list'];
        return keys;
      }
      return [{}];
    },
    preambleText() {
      if (this.activity[`${reproterms}preamble`]) {
        const activePreamble = _.filter(this.activity[`${reproterms}preamble`],
          p => p['@language'] === this.selected_language);
        return activePreamble[0]['@value'];
      }
      return '';
    },
  },
};
</script>

