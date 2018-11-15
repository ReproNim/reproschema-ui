<template>
  <div class="hello">
    <div v-if="!listShow.length">
      <h1 >Loading...</h1>
      <Loader />
    </div>
    <div v-else>
      <b-progress :value="listShow.length" :max="context.length" class="mb-3"></b-progress>
    </div>
    <transition-group name="list" tag="div" mode="in-out">
      <div v-for="(content, index) in contextReverse" :key="index" class="mt-3 mb-3">
        <transition name="list">
        <ContextItem
           v-if="listShow.indexOf(contextReverse.length - index - 1) >= 0"
           :item="content" :index="contextReverse.length - index - 1"
           :init="responses[content['@id']]"
           v-on:skip="nextQuestion(contextReverse.length - index - 1, 1)"
           v-on:next="nextQuestion(contextReverse.length - index - 1, 0)"
           v-on:setData="setResponse"
           :responses="responses"
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
</style>

<script>
import axios from 'axios';
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
      score: 0,
    };
  },
  components: {
    ContextItem,
    Loader,
  },
  methods: {
    getData() {
      axios.get(this.srcUrl).then((resp) => {
        this.activity = resp.data;
        this.listShow = [0];
        /* eslint-disable */
        // console.log(74, this.activity);
        this.$nextTick(() => {
          // set listShow if there are responses for items in the context
          const answered = _.filter(this.context, c => Object.keys(this.responses).indexOf(c['@id']) > -1);
          if (!answered.length) {
            this.listShow = [0];
          } else {
            this.listShow = _.map(new Array(answered.length + 1), (c, i) => i);
          }
        });
      });
    },
    nextQuestion(idx, skip) {
      if (skip) {
        this.$emit('saveResponse', this.context[idx]['@id'], { skipped: 1, value: null });
      }
      if (idx === this.listShow.length - 1) {
        this.listShow.push(_.max(this.listShow) + 1);
      }
    },
    setResponse(value, index) {
      this.$emit('saveResponse', this.activity.ui.order[index], {value, skipped: 0});

      if (this.activity.scoringLogic) {
        var scoringLogic = this.activity.scoringLogic.code;
        if(this.responses) {
          var str ='';
          _.forOwn(this.responses, function (val, key) {
            // eslint-disable-next-line
            if (scoringLogic.indexOf(key) > -1) {
              // scoringLogic = _.replace(scoringLogic,new RegExp(key,'g'),val.value)
              str += 'const '+key + '=' + val.value +'; ';
            }
          });

          try {
            // eslint-disable-next-line
            console.log('total_score::::', eval(str+'; '+ scoringLogic));
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
      if (this.activity.ui) {
        const keys = this.activity.ui.order;
        return _.map(keys, k => this.activity[k]);
      }
      /* eslint-enable */
      return [{}];
    },
    contextReverse() {
      /* eslint-disable */
      //console.log(this.context);
      if(this.context.length >0) {
        return this.context.slice().reverse();
      }
      return {};
    },
  },
  mounted() {
    if (this.srcUrl) {
      // eslint-disable-next-line
      console.log(161, this.selected_language);
      console.log('Home mounted: ', this.srcUrl);
      this.getData();
    }
  },
};
</script>
