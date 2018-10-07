<template>
  <div class="hello">
    <div v-if="!listShow.length">
      <h1 >Loading...</h1>
      <Loader />
    </div>
    <div v-else class="fixed-top">
      <b-progress :value="listShow.length" :max="context.length" class="mb-3"></b-progress>
    </div>
    <transition-group name="list" tag="div">
      <div v-for="(content, index) in context"
       :key="index"
       class="mt-3 mb-3 fullpage"
       :id="'q'+index">
        <transition name="list">
        <ContextItem
         :item="content" :index="index"
         v-on:skip="nextQuestion(index)"
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

  .fullpage {
    height: 100vh;
    transform: translate(0, 25%);
  }

  .b-card {
    border-style: none;
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
import Vue from 'vue';
import _ from 'lodash';
import config from '../config';
import ContextItem from './ContextItem';
import Loader from './Loader';

const VueScrollTo = require('vue-scrollto');

// You can also pass in the default options
Vue.use(VueScrollTo, {
  container: 'body',
  duration: 600,
  easing: 'ease',
  offset: 0,
  force: true,
  cancelable: true,
  onStart: false,
  onDone: false,
  onCancel: false,
  x: false,
  y: true,
});


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
      this.$scrollTo(`#q${idx + 1}`);
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
      return _.filter(this.activity['@context'], (val, key) => {
        const special = ['pav', 'xsd', 'oslc', 'bibo', 'schema'].indexOf(key) >= 0;
        return key.indexOf(':') < 0 && key.indexOf('@') < 0 && key.indexOf('$') < 0 && !special;
      });
    },
    contextReverse() {
      return this.context.slice().reverse();
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
