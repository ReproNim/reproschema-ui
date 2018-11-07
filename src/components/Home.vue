<template>
  <div class="hello">
    <div v-if="!listShow.length">
      <h1 >Loading...</h1>
      <Loader />
    </div>
    <div v-else>
      <b-progress :value="listShow.length" :max="context.length" class="mb-3"></b-progress>
    </div>
    <transition-group name="list" tag="div">
      <div v-for="(content, index) in contextReverse" :key="index" class="mt-3 mb-3">
        <transition name="list">
        <ContextItem
         v-if="listShow.indexOf(contextReverse.length - index - 1) >= 0"
         :item="content" :index="contextReverse.length - index - 1"
         v-on:skip="nextQuestion(contextReverse.length - index - 1)"
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
import config from '../config';
import ContextItem from './ContextItem';
import Loader from './Loader';


export default {
  name: 'Home',
  data() {
    return {
      activity: {},
      listShow: [],
      responses: [],
    };
  },
  components: {
    ContextItem,
    Loader,
  },
  methods: {
    nextQuestion(idx) {
      if (idx === this.listShow.length - 1) {
        this.listShow.push(_.max(this.listShow) + 1);
      }
    },
    setResponse(val, index) {
      this.responses.push({
        item: this.context[index],
        response: val,
      });
    },
  },
  watch: {
    listContentRev() {
      this.$forceUpdate();
    },
  },
  computed: {
    context() {
      if (this.activity.ui) {
        return this.activity.ui.order;
      }
      return {};
    },
    contextReverse() {
      /* eslint-disable */
      console.log(this.context);
      if(this.context.length >0) {
        return this.context.slice().reverse();
      }
      return {};
    },
  },
  mounted() {
    axios.get(config.githubSrc).then((resp) => {
      this.activity = resp.data;
      this.listShow.push(0);
    });
  },
};
</script>
