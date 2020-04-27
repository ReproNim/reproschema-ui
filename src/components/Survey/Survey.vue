<template>
  <div class="hello">
    <div v-if="!listShow.length">
      <h1 >Loading...</h1>
      <Loader />
    </div>
    <div v-else>
      <div v-if="complete && autoAdvance">
        <div v-if="isVis">
          <p v-if="currentActivityIndex === 0">
            Great, you are eligible for the voice study! Hit "Next" to learn about the study, risks,
            and benefits of joining.</p>
          <p v-else-if="currentActivityIndex === 1">
            Thanks for walking through the consent. You have agreed to the study, let’s get started.
          </p>
          <p v-else-if="currentActivityIndex !== 9">
            Please review your responses, then click "Next" below:</p>
          <!--<div class="mt-3 mb-3">Please review your responses, then click "Next" below:</div>-->
          <b-button v-if="nextActivity[activityUrl]" @click="nextActivity1">Next</b-button>
        </div>
        <div v-else>
          <p>Thank you for participating. Not eligible at this time!</p>
        </div>
      </div>
      <br>
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
            v-on:setScores="setScore"
            :responses="responses"
            :selected_language="selected_language"
            :clientIp="ipAddress"
            :showPassOptions="findPassOptions"
            :reprotermsUrl="reprotermsUrl"
          />
        </transition>
      </div>
    </transition-group>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  .item {
    min-height: 200px;
  }

  .list-item {
    display: inline-block;
    margin-right: 10px;
  }
  .list-enter-active, .list-leave-active {
    transition: all 1s;
  }
  .list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
    opacity: 0;
    transform: translateY(-10px);
  }
  .preamble-text{
    text-align:left;
  }
</style>

<script>
import Vue from 'vue';
import jsonld from 'jsonld/dist/jsonld.min';
import _ from 'lodash';
import SurveyItem from '../SurveyItem/';
import Loader from '../Loader/';

// const jsonld = require('jsonld');

Vue.component('survey-item', SurveyItem);
const safeEval = require('safe-eval');

// const reproterms = 'https://raw.githubusercontent.com/ReproNim/reproschema/master/terms/';

export default {
  name: 'Survey',
  props: ['reprotermsUrl', 'srcUrl', 'responses', 'selected_language', 'progress', 'autoAdvance', 'actVisibility', 'nextActivity', 'ipAddress'],
  data() {
    return {
      activity: {},
      listShow: [],
      parsedJSONLD: {},
      visibility: {},
      scores: {},
      isSkip: false,
      isDontKnow: false,
      isVis: false,
    };
  },
  components: {
    Loader,
  },
  methods: {
    getData() {
      jsonld.expand(this.srcUrl).then((resp) => {
        this.activity = resp[0];
        this.listShow = [0];
        this.$nextTick(() => {
          // set listShow if there are responses for items in the context
          const answered = _.filter(this.context, c =>
            Object.keys(this.responses).indexOf(c['@id']) > -1);
          if (!answered.length) {
            this.listShow = [0];
            // eslint-disable-next-line
              // console.log(92, this.listShow);
          } else {
            this.listShow = _.map(new Array(answered.length + 1), (c, i) => i);
            // eslint-disable-next-line
              // console.log(95, this.listShow);
          }
          this.visibility = this.getVisibility(this.responses);
        });
      });
    },
    getScoring(responses) {
      // console.log(225, 'responses', responses);
      const responseMapper = this.responseMapper(responses);
      // console.log(227, 'response mapper', responseMapper);
      if (!_.isEmpty(this.activity[`${this.reprotermsUrl}scoringLogic`])) {
        const scoreMapper = {};
        _.map(this.activity[`${this.reprotermsUrl}scoringLogic`], (a) => {
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
      if (idx === 8 && (this.context[idx]['@id']).split('items/')[1] === 'phq9_9') {
        // console.log('idx and resp contxt id', idx, this.context);
        if (this.responses[this.context[idx]['@id']] > 0) {
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
      }
      if (skip) {
        this.$emit('saveResponse', this.context[idx]['@id'], 'skipped');
        this.setResponse('skipped', idx);
        // if (!_.isEmpty(this.activity[this.reprotermsUrl+'scoringLogic'])) {
        //   this.evaluateScoringLogic();
        // }
      }
      if (dontKnow) {
        this.$emit('saveResponse', this.context[idx]['@id'], 'dontKnow');
        this.setResponse('dontknow', idx);
        // if (!_.isEmpty(this.activity[this.reprotermsUrl+'scoringLogic'])) {
        //   this.evaluateScoringLogic();
        // }
      }
      this.$forceUpdate();
      if (idx === this.listShow.length - 1) {
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
    computeNewShow(listShow) {
      return _.map(this.contextReverse, (o, index) => {
        const criteria1 = listShow.indexOf(this.contextReverse.length - index - 1) >= 0;
        let criteria2 = true;
        if (!_.isEmpty(this.visibility)) {
          criteria2 = this.visibility[o['@id']];
        }
        return criteria1 && criteria2;
      });
    },
    setResponse(val, index) {
      const itemUrl = this.context[index]['@id'];
      const t1 = performance.now();
      const respData = {
        lang: this.selected_language,
        time_start: this.t0 / 1000,
        time_response: t1 / 1000 };
      respData[itemUrl] = val;
      const valueAndDataExport = [val, respData];
      this.$emit('saveResponse', this.context[index]['@id'], valueAndDataExport);
      this.t0 = t1;
      const currResponses = { ...this.responses };
      if (val instanceof Object) {
        currResponses[this.context[index]['@id']] = respData.value;
      } else {
        currResponses[this.context[index]['@id']] = val;
      }
      this.visibility = this.getVisibility(currResponses);
      // if (!_.isEmpty(this.activity[`${this.reprotermsUrl}scoringLogic`])) {
      //   // TODO: if you uncomment the scoring logic evaluation, things break w/ multipart.
      //   this.evaluateScoringLogic();
      // }
      if (!_.isEmpty(this.activity[`${this.reprotermsUrl}scoringLogic`])) {
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
    },
    setScore(scoreObj, index) {
      this.$emit('saveScores', this.context[index]['@id'], scoreObj);
    },
    restart() {
      this.$emit('clearResponses');
      this.listShow = [0];
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
    responseMapper(responses) {
      const keys = _.map(this.order(), c => c['@id']); // Object.keys(this.responses);
      // a variable map is defined! great
      if (this.activity[`${this.reprotermsUrl}variableMap`]) {
        const vmap = this.activity[`${this.reprotermsUrl}variableMap`];
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
    getVisibility(responses) {
      const responseMapper = this.responseMapper(responses);
      if (!_.isEmpty(this.activity[`${this.reprotermsUrl}visibility`])) {
        const visibilityMapper = {};
        _.map(this.activity[`${this.reprotermsUrl}visibility`], (a) => {
          let val = a[`${this.reprotermsUrl}isVis`][0]['@value'];
          if (_.isString(val)) {
            val = this.evaluateString(val, responseMapper);
          }
          if (responseMapper[a[`${this.reprotermsUrl}variableName`][0]['@value']]) {
            visibilityMapper[responseMapper[a[`${this.reprotermsUrl}variableName`][0]['@value']].ref] = val;
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
    order() {
      if (this.activity[`${this.reprotermsUrl}shuffle`][0]['@value']) { // when shuffle is true
        const orderList = this.activity[`${this.reprotermsUrl}order`][0]['@list'];
        const listToShuffle = orderList.slice(1, orderList.length - 3);
        const newList = _.shuffle(listToShuffle);
        newList.unshift(orderList[0]);
        newList.push(orderList[orderList.length - 3],
          orderList[orderList.length - 2], orderList[orderList.length - 1]);
        return newList;
      } return this.activity[`${this.reprotermsUrl}order`][0]['@list'];
    },
    nextActivity1() {
      const currentIndex = parseInt(this.$store.state.activityIndex);
      const nextIndex = currentIndex + 1;
      if (this.actVisibility[nextIndex]) {
        this.$router.push(`/activities/${nextIndex}`);
      }
    },
  },
  watch: {
    $route() {
      this.getData();
      if (this.readyForActivity) {
        if (this.$store) {
          this.$store.dispatch('getActivityData');
        }
      }
    },
    actVisibility: {
      deep: true,
      handler(newVal) {
        // newVal.shift();
        this.isVis = _.some(newVal);
      },
    },
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
    readyForActivity() {
      if (this.readyForActivity) {
        if (this.$store) {
          this.$store.dispatch('getActivityData');
        }
      }
    },
    storeContext() {
      if (this.$store) {
        this.$store.dispatch('setActivityList', this.storeContext);
      }
    },
  },
  computed: {
    complete() {
      return this.progress === 100;
    },
    storeContext() {
      if (this.$store) {
        const state = this.$store.state;
        if (state.activities.length && state.activityIndex != null) {
          if (state.activities[state.activityIndex].activity) {
            const currentActivity = state.activities[state.activityIndex].activity;
            const actList = currentActivity[`${this.reprotermsUrl}order`][0]['@list'];
            return actList;
          }
        }
      }
      return [{}];
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
      /* eslint-disable */
        if (this.activity[this.reprotermsUrl+'order']) {
          const keys = this.order();

          // if (!_.isEmpty(this.visibility)) {
          //   return _.filter(keys, k => this.visibility[k['@id']]);
          // }
          return keys;
        }
        /* eslint-enable */
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
          const activePreamble = _.filter(this.activity[`${this.reprotermsUrl}preamble`], p => p['@language'] === this.selected_language);
          if (!Array.isArray(activePreamble) || !activePreamble.length) {
            // array does not exist, is not an array, or is empty
            // ⇒ do not attempt to process array
            return this.activity[`${this.reprotermsUrl}preamble`][0]['@value'];
          }
          else {
            return activePreamble[0]['@value'];
          }
        }
        return '';
      },
      /**
       * we need to keep an eye on the store.
       */
    readyForActivity() {
        if (this.$store) {
          return this.$store.getters.readyForActivity;
        }
      },
    findPassOptions() {
        if (this.activity[this.reprotermsUrl+'allow']) {
          let isSkip = false;
          let isDontKnow = false;
          _.map(this.activity[this.reprotermsUrl+'allow'][0]['@list'], s => {
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
      },
    activityUrl() {
        return this.srcUrl;
      },
    currentActivityIndex() {
        return parseInt(this.$store.state.activityIndex);
      },
  },
  mounted() {
      if (this.srcUrl) {
        // eslint-disable-next-line
        // console.log(46, this.srcUrl);
        this.getData();
      }
      this.t0 = performance.now();
    },
  };
</script>
