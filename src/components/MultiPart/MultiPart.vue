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
          // this.visibility = this.getVisibility(this.responses);
        });
      });
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
      // if (!_.isEmpty(this.activity['https://schema.repronim.org/scoringLogic'])) {
      //   this.evaluateScoringLogic();
      // }
      this.updateProgress();
    },
    nextQuestion(idx, skip, dontKnow) {
      if (this.currentIndex < this.context.length - 1) {
        this.currentIndex = Object.keys(this.responses).length;
      }
      if (skip) {
        this.$emit('saveResponse', this.context[idx]['@id'], 'skipped');
      }
      if (dontKnow) {
        this.$emit('saveResponse', this.context[idx]['@id'], 'dontKnow');
      }
      this.updateProgress();
      this.$forceUpdate();
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
      return this.activity['https://schema.repronim.org/order'][0]['@list'];
    },
    context() {
      if (this.activity['https://schema.repronim.org/order']) {
        const keys = this.activity['https://schema.repronim.org/order'][0]['@list'];
        return keys;
      }
      return [{}];
    },
    preambleText() {
      if (this.activity['http://schema.repronim.org/preamble']) {
        const activePreamble = _.filter(this.activity['http://schema.repronim.org/preamble'],
          p => p['@language'] === this.selected_language);
        return activePreamble[0]['@value'];
      }
      return '';
    },
  },
};
</script>

