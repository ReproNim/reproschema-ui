<template>
  <div class="hello">
    <div v-if="!listShow.length">
      <h1 >Loading...</h1>
      <Loader />
    </div>
    <div v-else>
      <transition name="list" tag="div" mode="in-out">
        <div v-if="progress === 100" class="mt-3 mb-3">
          <slot></slot>
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


Vue.component('survey-item', SurveyItem);
const safeEval = require('safe-eval');

export default {
  name: 'Home',
  props: ['srcUrl', 'responses', 'selected_language', 'progress'],
  data() {
    return {
      activity: {},
      listShow: [],
      parsedJSONLD: {},
      visibility: {},
      score: 0,
    };
  },
  components: {
    Loader,
  },
  methods: {
    getData() {
      // this.$store.dispatch('getActivityData');
      jsonld.expand(this.srcUrl).then((resp) => {
        this.activity = resp[0];
        this.listShow = [0];
        this.$nextTick(() => {
          // eslint-disable-next-line
          // console.log(86, this.context);
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
    evaluateScoringLogic() {
      const scoringLogic = (this.activity['https://schema.repronim.org/scoringLogic'][0]['@value']).split('= ')[1];
      if (this.responses) {
        let str = '';
        _.forOwn(this.responses, (val, key) => {
          const qId = (key.split(/\/items\//)[1]).split(/.jsonld/)[0]; // split url to get the scoring key
          if (scoringLogic) {
            if (isNaN(val)) {
              str += `const ${qId}=0; `;
            } else {
              str += `const ${qId}=${val}; `;
            }
          }
        });
        try {
          // eslint-disable-next-line
          this.score = eval(`${str}  ${scoringLogic}`);
          // console.log('TOTAL SCORING LOGIC::::', this.score);
        } catch (e) {
          // Do nothing
        }
      }
    },
    nextQuestion(idx, skip, dontKnow) {
      if (skip) {
        this.$emit('saveResponse', this.context[idx]['@id'], 'skipped');
        // if (!_.isEmpty(this.activity['https://schema.repronim.org/scoringLogic'])) {
        //   this.evaluateScoringLogic();
        // }
      }
      if (dontKnow) {
        this.$emit('saveResponse', this.context[idx]['@id'], 'dontKnow');
        // if (!_.isEmpty(this.activity['https://schema.repronim.org/scoringLogic'])) {
        //   this.evaluateScoringLogic();
        // }
      }
      this.$forceUpdate();
      if (idx === this.listShow.length - 1) {
        this.listShow.push(_.max(this.listShow) + 1);
        if (this.$store) {
          this.$store.dispatch('updateListShow', this.listShow);
        }
      }
    },
    setResponse(value, index) {
      this.$emit('saveResponse', this.context[index]['@id'], value);
      const currResponses = { ...this.responses };
      currResponses[this.context[index]['@id']] = value;
      this.visibility = this.getVisibility(currResponses);
      if (!_.isEmpty(this.activity['https://schema.repronim.org/scoringLogic'])) {
        this.evaluateScoringLogic();
      }

      // if (this.activity['https://schema.repronim.org/branchLogic']) {
      //   this.evaluateBranchingLogic();
      // }
      this.updateProgress();
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
        // console.log(totalQ);
      }
      const progress = ((Object.keys(this.responses).length) / totalQ) * 100;
      this.$emit('updateProgress', progress);
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
    storeContext() {
      if (this.$store) {
        const state = this.$store.state;
        if (state.activities.length && state.activityIndex != null) {
          if (state.activities[state.activityIndex].activity) {
            const currentActivity = state.activities[state.activityIndex].activity;
            const actList = currentActivity['https://schema.repronim.org/order'][0]['@list'];
            return actList;
          }
        }
      }
      return [{}];
    },
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
        return criteria1 && criteria2;
      });
    },
    context() {
      /* eslint-disable */
      if (this.activity['https://schema.repronim.org/order']) {
        const keys = this.activity['https://schema.repronim.org/order'][0]['@list'];

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
        return activePreamble[0]['@value'];
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
  },
  mounted() {
    if (this.srcUrl) {
      // eslint-disable-next-line
      this.getData();
    }
  },
};
</script>
