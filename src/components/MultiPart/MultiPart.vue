<template>
  <div>
    <div v-if="!listShow.length">
      <h1 >Loading...</h1>
      <!-- <Loader /> -->
    </div>
    <div v-else>
      <transition name="list" tag="div" mode="in-out">
        <div v-if="progress === 100" class="mt-3 mb-3">
          Thanks!
        </div>
      </transition>
      <b-progress :value="progress" :max="100" class="mb-3"></b-progress>
      <div v-if="preambleText" class="preamble-text">
        <strong> {{ preambleText }} </strong>
      </div>
    </div>

    <transition-group name="list" tag="div" mode="in-out">
      <div v-for="(content, index) in contextReverse" :key="content['@id']+index" class="mt-3 mb-3">
        <transition name="list" :key="'t'+content['@id']">
          <survey-item
            :key="'c' + content['@id']"
            v-if="shouldShow[index]"
            :item="content" :index="contextReverse.length - index - 1"
            :init="responses[content['@id']]"
            v-on:skip="nextQuestion(contextReverse.length - index - 1, 1, 0)"
            v-on:dontKnow="nextQuestion(contextReverse.length - index - 1, 0, 1)"
            v-on:next="nextQuestion(contextReverse.length - index - 1, 0)"
            v-on:setData="setResponse"
            :responses="responses"
            :selected_language="selected_language"
            :score="score"
          />
        </transition>
      </div>
    </transition-group>

    <div class="text-right">
      <b-button variant="default">Skip</b-button>
      <b-button variant="default">Don't Know</b-button>
    </div>
  </div>
</template>

<script>
import jsonld from 'jsonld/dist/jsonld.min';
import _ from 'lodash';
import Loader from '../Loader/';

const safeEval = require('safe-eval');

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
    evaluateString(string, responseMapper) {
      const keys = Object.keys(responseMapper);
      let output = string;
      _.map(keys, (k) => {
        // grab the value of the key from responseMapper
        const val = responseMapper[k].val;
        output = output.replace(k, val);
      });
      // console.log(output, safeEval(output));
      return safeEval(output);
    },
    responseMapper(responses) {
      const keys = _.map(this.order, c => c['@id']); // Object.keys(this.responses);
      const keyArr = _.map(keys, (key) => {
        const val = responses[key];
        const folders = key.split('/');
        const N = folders.length - 1;
        const qId = folders[N]; // (key.split(/\/items\//)[1]).split(/.jsonld/)[0];
        return { key, val, qId };
      });
      const outMapper = {};
      _.map(keyArr, (a) => {
        outMapper[a.qId] = { val: a.val, ref: a.key };
      });
      return outMapper;
    },
    getVisibility(responses) {
      const responseMapper = this.responseMapper(responses);
      if (!_.isEmpty(this.activity['https://schema.repronim.org/visibility'])) {
        const visibilityMapper = {};
        _.map(this.activity['https://schema.repronim.org/visibility'], (a) => {
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
    updateProgress() {
      let totalQ = this.context.length;
      if (!_.isEmpty(this.visibility)) {
        totalQ = _.filter(this.visibility).length;
      }
      const progress = ((Object.keys(this.responses).length) / totalQ) * 100;
      this.$emit('updateProgress', progress);
    },
    setResponse(value, index) {
      this.$emit('saveResponse', this.context[index]['@id'], value);
      const currResponses = { ...this.responses };
      currResponses[this.context[index]['@id']] = value;
      this.visibility = this.getVisibility(currResponses);
      if (!_.isEmpty(this.activity['https://schema.repronim.org/scoringLogic'])) {
        this.evaluateScoringLogic();
      }
      this.updateProgress();
    },
    nextQuestion(idx, skip, dontKnow) {
      if (this.currentIndex < this.context.length) {
        this.currentIndex += 1;
      }
      this.currentIndex += 1;
      if (skip) {
        this.$emit('saveResponse', this.context[idx]['@id'], 'skipped');
      }
      if (dontKnow) {
        this.$emit('saveResponse', this.context[idx]['@id'], 'dontKnow');
      }
      this.$forceUpdate();
      if (idx === this.listShow.length - 1) {
        this.listShow.push(_.max(this.listShow) + 1);
      }
    },
  },
  watch: {
    listContentRev() {
      this.$forceUpdate();
    },
    listShow() {
      this.updateProgress();
    },
    srcUrl() {
      if (this.srcUrl) {
        this.getData();
      }
    },
  },
  computed: {
    order() {
      return this.activity['https://schema.repronim.org/order'][0]['@list'];
    },
    shouldShow() {
      return _.map(this.contextReverse, (o, index) => {
        const criteria1 = this.listShow.indexOf(this.contextReverse.length - index - 1) >= 0;
        let criteria2 = true;
        if (!_.isEmpty(this.visibility)) {
          criteria2 = this.visibility[o['@id']];
        }
        const criteria3 = index === this.currentIndex;
        console.log(index, this.currentIndex, criteria1, criteria2, criteria3);
        return criteria2 && criteria3;
      });
    },
    context() {
      if (this.activity['https://schema.repronim.org/order']) {
        const keys = this.activity['https://schema.repronim.org/order'][0]['@list'];
        return keys;
      }
      return [{}];
    },
    contextReverse() {
      if (this.context.length > 0) {
        return this.context.slice().reverse();
      }
      return {};
    },
    preambleText() {
      if (this.activity['http://schema.repronim.org/preamble']) {
        const activePreamble = _.filter(this.activity['http://schema.repronim.org/preamble'], p => p['@language'] === this.selected_language);
        return activePreamble[0]['@value'];
      }
      return '';
    },
  },
};
</script>

