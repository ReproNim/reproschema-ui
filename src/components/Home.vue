<template>
  <div class="hello">
    <div v-if="!listShow.length">
      <h1 >Loading...</h1>
      <Loader />
    </div>
    <div v-else>
      <b-progress :value="listShow.length - 1" :max="context.length" class="mb-3"></b-progress>
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
  props: ['srcUrl', 'responses'],
  data() {
    return {
      activity: {},
      listShow: [],
    };
  },
  components: {
    ContextItem,
    Loader,
  },
  methods: {
    nextQuestion(idx, skip) {
      if (skip) {
        this.$emit('saveResponse', this.context[idx]['@id'], { skipped: 1, value: null });
      }
      if (idx === this.listShow.length - 1) {
        this.listShow.push(_.max(this.listShow) + 1);
      }
    },
    setResponse(value, index) {
      // this.responses.push({
      //   item: this.context[index],
      //   response: val,
      // });
      this.$emit('saveResponse', this.context[index]['@id'], { value, skipped: 0 });
    },
  },
  watch: {
    listContentRev() {
      this.$forceUpdate();
    },
    listShow() {
      const progress = ((this.listShow.length - 1) / this.context.length) * 100;
      this.$emit('updateProgress', progress);
    },
    srcUrl() {
      if (this.srcUrl) {
        axios.get(this.srcUrl).then((resp) => {
          this.activity = resp.data;
          this.listShow = [0];

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
      }
    },
  },
  computed: {
    context() {
      /* eslint-disable */
      if (this.activity._ui) {
        const keys = this.activity._ui.order;
        const self = this;
        return _.map(keys, k => self.activity[k]);
      }
      /* eslint-enable */
      return [{}];
    },
    contextReverse() {
      return this.context.slice().reverse();
    },
  },
  mounted() {

  },
};
</script>
