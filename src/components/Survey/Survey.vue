<template>
  <div class="hello">
    <div v-if="!listShow.length">
      <h1 >{{ $t('loader')}}...</h1>
      <Loader />
    </div>
    <div v-else>
      <div class="text-center" v-if="complete && autoAdvance">
        <div v-if="isVis">
          <p v-if="currentActivityIndex < listShow.length">
            {{ $t('review-and-next')}}</p>
          <!--<div class="mt-3 mb-3">Please review your responses, then click "Next" below:</div>-->
          <b-button v-if="nextActivity[activityUrl]" @click="nextActivity1">{{ $t('next-button')}}</b-button>
        </div>
        <div v-else>
          <p>Thank you for participating. Not eligible at this time!</p>
        </div>
      </div>
      <br>
      <b-progress :value="progress" :max="100" class="mb-3"></b-progress>
      <div v-if="preambleText" class="preamble-text">
        <strong v-html="preambleText">{{ preambleText }}</strong>
      </div>
    </div>

    <transition-group name="list" tag="div" mode="in-out">
      <div v-for="(content, index) in contextReverse" :key="content['@id']+'f'+ index" class="mt-3 mb-3">
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
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import SurveyItem from '../SurveyItem/';
import Loader from '../Loader/';

// const jsonld = require('jsonld');

Vue.component('survey-item', SurveyItem);
const safeEval = require('safe-eval');

// const reproterms = 'https://raw.githubusercontent.com/ReproNim/reproschema/master/terms/';

export default {
  name: 'Survey',
  props: ['reprotermsUrl', 'srcUrl', 'responses', 'selected_language', 'progress', 'autoAdvance', 'actVisibility', 'nextActivity', 'ipAddress', 'participantID'],
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
        // const l = this.initializeListShow();
        // this.listShow = [0];
        this.$nextTick(() => {
          // set listShow if there are responses for items in the context
          const answered = _.filter(this.context, c =>
            Object.keys(this.responses).indexOf(c['@id']) > -1);
          if (!answered.length) {
            this.listShow = [this.initializeListShow()];
          } else {
            this.listShow = _.map(new Array(answered.length + 1), (c, i) => i);
            // eslint-disable-next-line
          }
          this.visibility = this.getVisibility(this.responses);
        });
      });
    },
    initializeListShow() {
      let i = 0;
      for (i = 0; i < this.context.length; i += 1) {
        const eachItem = (this.context)[i];
        // return _.map(this.context, (o, index) => {
        const matchedObject = _.filter(this.activity['http://schema.repronim.org/addProperties'], a => a['http://schema.repronim.org/isAbout'][0]['@id'] === eachItem['@id']);
        let val = true; // true by default if not mentioned
        if (matchedObject[0]['http://schema.repronim.org/isVis']) {
          val = matchedObject[0]['http://schema.repronim.org/isVis'][0]['@value'];
        }
        if (val === true) { // first visible item
          break;
        }
      }
      return i;
      // });
    },
    getScoring(responses) {
      const responseMapper = this.responseMapper(responses);
      if (!_.isEmpty(this.activity['http://schema.repronim.org/compute'])) {
        const scoreMapper = {};
        _.map(this.activity['http://schema.repronim.org/compute'], (a) => {
          let scoreFormula = a['http://schema.repronim.org/jsExpression'][0]['@value'];
          const scoreVariableName = a['http://schema.repronim.org/variableName'][0]['@value'];
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
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
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
        // if (!_.isEmpty(this.activity['http://schema.repronim.org/compute'])) {
        //   this.evaluateScoringLogic();
        // }
      }
      if (dontKnow) {
        this.$emit('saveResponse', this.context[idx]['@id'], 'dontKnow');
        this.setResponse('dontknow', idx);
        // if (!_.isEmpty(this.activity['http://schema.repronim.org/compute'])) {
        //   this.evaluateScoringLogic();
        // }
      }
      this.$forceUpdate();
      if (idx >= this.listShow.length - 1) {
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
      const d2 = new Date();
      const t1 = d2.toISOString();
      // const t1 = performance.now();
      let uiUrl = `${window.location.origin}`;
      if (window.location.pathname) {
        uiUrl = `${uiUrl}${window.location.pathname}`;
      }
      const respActivityUuid = uuidv4();
      const responseUuid = uuidv4();
      const responseActivity = {
        '@context': 'https://raw.githubusercontent.com/ReproNim/reproschema/1.0.0-rc1/contexts/generic',
        '@type': 'reproschema:ResponseActivity',
        '@id': `uuid:${respActivityUuid}`,
        used: [`${itemUrl}`,
          `${this.srcUrl}`,
        ],
        inLanguage: this.getAnsweredLanguage,
        startedAtTime: this.t0,
        endedAtTime: t1,
        wasAssociatedWith: {
          version: '0.0.1',
          url: uiUrl,
          '@id': 'https://github.com/ReproNim/reproschema-ui',
        },
        generated: `uuid:${responseUuid}`,
      };
      const respData = {
        '@context': 'https://raw.githubusercontent.com/ReproNim/reproschema/1.0.0-rc1/contexts/generic',
        '@type': 'reproschema:Response',
        '@id': `uuid:${responseUuid}`,
        wasAttributedTo: {
          '@id': this.$store.state.participantUuid,
        },
        isAbout: itemUrl,
        value: val,
      };
      if (this.participantId) {
        respData.wasAttributedTo.subject_id = this.participantId;
      }
      const valueAndDataExport = [val, responseActivity, respData];
      this.$emit('saveResponse', this.context[index]['@id'], valueAndDataExport);
      this.t0 = t1;
      const currResponses = { ...this.responses };
      if (val instanceof Object) {
        currResponses[this.context[index]['@id']] = respData.value;
      } else {
        currResponses[this.context[index]['@id']] = val;
      }
      this.visibility = this.getVisibility(currResponses);
      // if (!_.isEmpty(this.activity['http://schema.repronim.org/compute'])) {
      //   // TODO: if you uncomment the scoring logic evaluation, things break w/ multipart.
      //   this.evaluateScoringLogic();
      // }
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
    },
    setScore(scoreObj, index) {
      this.$emit('saveScores', this.context[index]['@id'], scoreObj);
    },
    restart() {
      this.$emit('clearResponses');
      this.listShow = [this.initializeListShow()];
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
    responseMapper(responses) {
      const keys = _.map(this.order(), c => c['@id']); // Object.keys(this.responses);
      // a variable map is defined! great
      if (this.activity['http://schema.repronim.org/addProperties']) {
        const vmap = this.activity['http://schema.repronim.org/addProperties'];
        const keyArr = _.map(vmap, (v) => {
          const key = v['http://schema.repronim.org/isAbout'][0]['@id'];
          const qId = v['http://schema.repronim.org/variableName'][0]['@value'];
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
      // console.log(357, this.$store.getters.getQueryParameters);
      // todo: check for value for isVis variables from queryParameters
      const responseMapper = this.responseMapper(responses);
      if (!_.isEmpty(this.activity['http://schema.repronim.org/addProperties'])) {
        const visibilityMapper = {};
        _.map(this.activity['http://schema.repronim.org/addProperties'], (a) => {
          let val = true; // true by default if not mentioned
          if (a['http://schema.repronim.org/isVis']) {
            val = a['http://schema.repronim.org/isVis'][0]['@value'];
          }
          if (_.isString(val)) {
            val = this.evaluateString(val, responseMapper);
          }
          if (responseMapper[a['http://schema.repronim.org/variableName'][0]['@value']]) {
            visibilityMapper[responseMapper[a['http://schema.repronim.org/variableName'][0]['@value']].ref] = val;
          }
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
      if (this.activity['http://schema.repronim.org/shuffle']) {
        if (this.activity['http://schema.repronim.org/shuffle'][0]['@value']) { // when shuffle is true
          const orderList = this.activity['http://schema.repronim.org/order'][0]['@list'];
          const listToShuffle = orderList.slice(1, orderList.length - 3);
          const newList = _.shuffle(listToShuffle);
          newList.unshift(orderList[0]);
          newList.push(orderList[orderList.length - 3],
            orderList[orderList.length - 2], orderList[orderList.length - 1]);
          return newList;
        }
      } return this.activity['http://schema.repronim.org/order'][0]['@list'];
    },
    nextActivity1() {
      const currentIndex = parseInt(this.$store.state.activityIndex);
      // eslint-disable-next-line consistent-return
      const visibleAct = _.map(this.actVisibility, (ac, key) => (ac === true ? key : '')).filter(String);
      const nextIndex = visibleAct[visibleAct.indexOf(currentIndex) + 1];
      if (this.$route.query.url) {
        this.$router.push(`/activities/${nextIndex}?url=${this.$route.query.url}`);
      } else {
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
    getAnsweredLanguage() {
      return this.$store.getters.getAnsweredLanguage;
    },
    storeContext() {
      if (this.$store) {
        const state = this.$store.state;
        if (state.activities.length && state.activityIndex != null) {
          if (state.activities[state.activityIndex].activity) {
            const currentActivity = state.activities[state.activityIndex].activity;
            const actList = currentActivity['http://schema.repronim.org/order'][0]['@list'];
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
        if (this.activity['http://schema.repronim.org/order']) {
          const keys = this.order();
          // console.log(461, this.participantId, keys); // make invisible pid item
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
        if (this.activity['http://schema.repronim.org/preamble']) {
          const activePreamble = _.filter(this.activity['http://schema.repronim.org/preamble'], p => p['@language'] === this.selected_language);
          if (!Array.isArray(activePreamble) || !activePreamble.length) {
            // array does not exist, is not an array, or is empty
            // ⇒ do not attempt to process array
            return this.activity['http://schema.repronim.org/preamble'][0]['@value'];
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
        if (this.activity['http://schema.repronim.org/allow']) {
          let isSkip = false;
          let isDontKnow = false;
          _.map(this.activity['http://schema.repronim.org/allow'][0]['@list'], s => {
            if (s['@id'] === 'http://schema.repronim.org/Skipped') {
              isSkip = true;
            } else if (s['@id'] === 'http://schema.repronim.org/DontKnow') {
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
    participantId() {
      return this.$store.state.participantId;
    },
    getparticipantUUID() {
      return this.$store.getters.getparticipantUUID;
    },
  },
  mounted() {
      if (this.srcUrl) {
        this.getData();
      }
      const d = new Date();
      this.t0 = d.toISOString();
      // this.t0 = performance.now();

    },
  };
</script>
