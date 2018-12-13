<template>
  <div class="hello">
    <div v-if="!listShow.length">
      <h1 >Loading...</h1>
      <Loader />
    </div>
    <div v-else>
      <b-progress :value="listShow.length" :max="context.length" class="mb-3"></b-progress>
      <div v-if="preambleText" class="preamble-text">
        <strong> {{ preambleText }} </strong>
      </div>
    </div>

    <transition-group name="list" tag="div" mode="in-out">
      <div v-for="(content, index) in contextReverse" :key="index" class="mt-3 mb-3">
        <transition name="list">
        <ContextItem
           v-if="listShow.indexOf(contextReverse.length - index - 1) >= 0"
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
import jsonld from 'jsonld/dist/jsonld.min';
// import axios from 'axios';
import _ from 'lodash';
import ContextItem from './ContextItem';
import Loader from './Loader';


export default {
  name: 'Home',
  props: ['srcUrl', 'responses', 'selected_language'],
  data() {
    return {
      activity: {},
      listShow: [],
      parsedJSONLD: {},
      score: 0,
    };
  },
  components: {
    ContextItem,
    Loader,
  },
  methods: {
    getData() {
      jsonld.expand(this.srcUrl).then((resp) => {
        this.activity = resp[0];
        // eslint-disable-next-line
        // console.log(85, this.activity);
        // console.log(83, resp[0]['https://schema.repronim.org/order'][0]['@list']);
        this.listShow = [0];
        this.$nextTick(() => {
          // eslint-disable-next-line
          // console.log('nexttick', this.context);
          // set listShow if there are responses for items in the context
          const answered = _.filter(this.context, c =>
            Object.keys(this.responses).indexOf(c['@id']) > -1);
          // eslint-disable-next-line
          // console.log(89, this.responses);
          if (!answered.length) {
            this.listShow = [0];
            // eslint-disable-next-line
            // console.log('answered.length 92', answered.length, this.listShow);
          } else {
            this.listShow = _.map(new Array(answered.length + 1), (c, i) => i);
            // eslint-disable-next-line
            // console.log('answered.length 98', answered.length, this.listShow);
          }
        });
      });
      // console.log(133);
    },
    nextQuestion(idx, skip, dontKnow) {
      if (skip) {
        const currentQuestion = this.activity['https://schema.repronim.org/order'][0]['@list'][idx];
        this.$emit('saveResponse', this.context[idx]['@id'], { skipped: 1, value: null, question: currentQuestion });
      }
      if (dontKnow) {
        // console.log(115, this.activity['https://schema.repronim.org/order'][0]['@list'][idx]);
        const currentQuestion = this.activity['https://schema.repronim.org/order'][0]['@list'][idx];
        this.$emit('saveResponse', this.context[idx]['@id'], { dontKnow: 1, value: null, question: currentQuestion });
      }
      if (idx === this.listShow.length - 1) {
        this.listShow.push(_.max(this.listShow) + 1);
      }
    },
    setResponse(value, index) {
      const currentQuestion = this.activity['https://schema.repronim.org/order'][0]['@list'][index];
      this.$emit('saveResponse', this.context[index]['@id'], { value, skipped: 0, dontKnow: 0, question: currentQuestion });
      if (this.activity.scoringLogic) {
        const scoringLogic = this.activity.scoringLogic.code;
        if (this.responses) {
          let str = '';
          _.forOwn(this.responses, (val) => {
            if (scoringLogic.indexOf(val.question) > -1) {
              str += `const ${val.question}=${val.value}; `;
            }
          });
          try {
            // eslint-disable-next-line
            console.log('TOTAL SCORE::::', eval(str+' '+ scoringLogic));
          } catch (e) {
            // Do nothing
          }
        }
      }
    },
  },
  watch: {
    $route() {
      this.getData();
      // console.log(170);
    },
    listContentRev() {
      this.$forceUpdate();
    },
    listShow() {
      const progress = ((this.listShow.length - 1) / this.context.length) * 100;
      this.$emit('updateProgress', progress);
    },
    srcUrl() {
      if (this.srcUrl) {
        this.getData();
      }
    },
  },
  computed: {
    context() {
      /* eslint-disable */
      /*if (this.activity.ui) {
        const keys = this.activity.ui.order;
        // console.log('keys order:: ', _.map(keys, k => this.activity[k]));
        return _.map(keys, k => this.activity[k]);
      }*/
      if (this.activity['https://schema.repronim.org/order']) {
        const keys = this.activity['https://schema.repronim.org/order'][0]['@list'];
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
      // console.log(210);
      if (this.activity.preamble) {
        const activePreamble = _.filter(this.activity.preamble, p => p['@language'] === this.selected_language);
        return activePreamble[0]['@value'];
      }
      return '';
    },
  },
  mounted() {
    if (this.srcUrl) {
      console.log('Home mounted: ', this.srcUrl);
      this.getData();
    }
  },
};
</script>
