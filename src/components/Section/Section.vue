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
            :showPassOptions="showPassOptions"
            :reprotermsUrl="reprotermsUrl"
          />
        </transition>
      </div>
    </transition-group>


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
import Vue from 'vue';
import jsonld from 'jsonld/dist/jsonld.min';
import VuejsDialog from 'vuejs-dialog';
import 'vuejs-dialog/dist/vuejs-dialog.min.css';
import _ from 'lodash';
import Loader from '../Loader/';

Vue.use(VuejsDialog);

const safeEval = require('safe-eval');

// const reproterms = 'https://raw.githubusercontent.com/ReproNim/reproschema/master/terms/';

export default {
  name: 'Section',
  props: {
    reprotermsUrl: {
      type: String,
    },
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
      scores: {},
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
      this.t0 = performance.now();
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
      if (!_.isEmpty(this.activity['http://schema.repronim.org/addProperties'])) {
        const visibilityMapper = {};
        _.map(this.activity['http://schema.repronim.org/addProperties'], (a) => {
          let val = true; // true by default if not mentioned
          if (a[`${this.reprotermsUrl}isVis`]) {
            val = a[`${this.reprotermsUrl}isVis`][0]['@value'];
          }
          if (_.isString(val)) {
            val = this.evaluateString(val, responseMapper);
          }
          if (responseMapper[a[`${this.reprotermsUrl}variableName`][0]['@value']]) {
            visibilityMapper[responseMapper[a[`${this.reprotermsUrl}variableName`][0]['@value']].ref] = val;
          }
        });
        // console.log(142, 'in section', visibilityMapper);
        return visibilityMapper;
      }
      return {};
    },
    responseMapper(responses) {
      // a variable map is defined! great
      const vmap = this.activity['http://schema.repronim.org/addProperties'];
      const keyArr = _.map(vmap, (v) => {
        const key = v[`${this.reprotermsUrl}isAbout`][0]['@id'];
        const qId = v[`${this.reprotermsUrl}variableName`][0]['@value'];
        const val = responses[key];
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
          output = output.replace(new RegExp(`\\b${k}\\b`), val);
        } else {
          output = output.replace(new RegExp(`\\b${k}\\b`), 0);
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
      let totalQ = this.context.length;
      console.log(191, this.context.length);
      // TODO: add back branching logic to this.
      if (!_.isEmpty(this.visibility)) {
        totalQ = _.filter(this.visibility).length;
        console.log()
      }
      const progress = ((Object.keys(this.responses).length) / totalQ) * 100;
      console.log(196, totalQ, progress);
      this.$emit('updateProgress', progress);
      if (progress === 100) {
        this.$emit('valueChanged', this.responses);
      }
    },
    setResponse(val, index) {
      // const t1 = performance.now();
      // console.log(202, 'end of a section-question', index, 'is', t1);
      // const respData = { startedAt: this.t0 / 1000,
      //   recordedAt: t1 / 1000,
      //   value: val };
      // console.log(207, 'section resp obj', respData);
      this.$emit('saveResponse', this.context[index]['@id'], val);
      const currResponses = { ...this.responses };
      // console.log(204, 'cur resp', currResponses, this.context[index]['@id'], val);
      currResponses[this.context[index]['@id']] = val;
      // TODO: add back branching logic
      this.visibility = this.getVisibility(currResponses);

      // TODO: add back scoring logic to this component.
      if (!_.isEmpty(this.activity['http://schema.repronim.org/compute'])) {
        _.map(this.getScoring(this.responses), (score, key) => {
          if (!_.isNaN(score)) {
            this.scores[key] = score;
          }
        });
        if (!_.isEmpty(this.scores)) {
          this.$emit('saveScores', this.srcUrl, this.scores);
        }
      }
      this.updateProgress();
      this.$forceUpdate();
    },
    getScoring(responses) {
      // console.log(225, 'responses', responses);
      const responseMapper = this.responseMapper(responses);
      // console.log(227, 'response mapper', responseMapper);
      if (!_.isEmpty(this.activity['http://schema.repronim.org/compute'])) {
        const scoreMapper = {};
        _.map(this.activity['http://schema.repronim.org/compute'], (a) => {
          // console.log(231, 'logic a', a);
          let scoreFormula = a[`${this.reprotermsUrl}jsExpression`][0]['@value'];
          const scoreVariableName = a[`${this.reprotermsUrl}variableName`][0]['@value'];
          if (_.isString(scoreFormula)) {
            scoreFormula = this.evaluateString(scoreFormula, responseMapper);
            // console.log(235, 'a.val', val);
          }
          if (responseMapper[scoreVariableName]) {
            scoreMapper[responseMapper[scoreVariableName].ref] = scoreFormula;
          }
        });
        return scoreMapper;
      }
      return {};
    },
    nextQuestion(idx, skip, dontKnow) {
      if (idx === 8 && this.responses[this.context[idx]['@id']] > 0) {
        // Trigger notification for non-zero suicidal ideation
        const notification = ' <i> If this is how you feel, think about getting help. </i><br> ' +
            'There are people who can help 24/7 <br>' +
            'Text the Crisis Text Line at 741741 <br>' +
            'Or<br>' +
            'Call the National Suicide Prevention Lifeline at 1-800-273-8255';
        const options = {
          html: true,
        };
        this.$dialog.alert(notification, options);
      }
      if (skip) {
        this.setResponse('skipped', idx);
      }
      if (dontKnow) {
        this.setResponse('dontKnow', idx);
      }

      this.$forceUpdate();
      if (idx <= this.listShow.length - 1) {
        const nextQuestionIdx = _.max(this.listShow) + 1;
        this.listShow.push(nextQuestionIdx);
        // update the listShow with the next index in case this one we added isn't visible
        for (let i = nextQuestionIdx; i < this.context.length; i += 1) {
          const nextItem = this.order();
          const id = nextItem[i]['@id'];
          let isVisible = this.visibility[id];
          if (isVisible === undefined) {
            isVisible = true;
          }
          if (!isVisible) {
            this.listShow.push(i + 1);
          } else {
            break;
          }
        }

        if (this.$store) {
          this.$store.dispatch('updateListShow', this.listShow);
        }
      }
    },
    order() {
      return this.activity[`${this.reprotermsUrl}order`][0]['@list'];
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
    shouldShow() {
      return _.map(this.contextReverse, (o, index) => {
        const criteria1 = this.listShow.indexOf(this.contextReverse.length - index - 1) >= 0;
        let criteria2 = true;
        if (!_.isEmpty(this.visibility)) {
          criteria2 = this.visibility[o['@id']];
        }
        return criteria1 && criteria2;
      });
    },
    context() {
      if (this.activity[`${this.reprotermsUrl}order`]) {
        const keys = this.activity[`${this.reprotermsUrl}order`][0]['@list'];
        return keys;
      }
      return [{}];
    },
    contextReverse() {
      /* eslint-disable */
        if(this.context.length >0) {
          return this.context.slice().reverse();
        }
        return {};
      },
      preambleText() {
        if (this.activity[`${this.reprotermsUrl}preamble`]) {
          const activePreamble = _.filter(this.activity[`${this.reprotermsUrl}preamble`],
            p => p['@language'] === this.selected_language);
          return activePreamble[0]['@value'];
        }
        return '';
      },
      findPassOptions() {
        if (this.activity[this.reprotermsUrl+'allow']) {
          let isSkip = false;
          let isDontKnow = false;
          _.map(this.activity[`${this.reprotermsUrl}allow`][0]['@list'], s => {
            if (s['@id'] === `${this.reprotermsUrl}refused_to_answer`) {
              isSkip = true;
            } else if (s['@id'] === `${this.reprotermsUrl}dont_know_answer`) {
              isDontKnow = true;
            }
          });
          return {
            'skip': isSkip,
            'dontKnow': isDontKnow
          };
        }
        else return null;
      }
    },
  };
</script>

