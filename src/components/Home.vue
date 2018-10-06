<template>
  <div class="hello">
    <transition-group name="list" tag="div">
      <div v-for="(content, index) in contextReverse" :key="index" class="mt-3 mb-3">
        <transition name="list">
        <ContextItem
         v-if="listShow.indexOf(contextReverse.length - index - 1) >= 0"
         :item="content" :index="index" v-on:skip="nextQuestion"/>
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


export default {
  name: 'Home',
  data() {
    return {
      activity: {},
      listShow: [],
    };
  },
  components: {
    ContextItem,
  },
  methods: {
    nextQuestion() {
      console.log(_.max(this.listShow) + 1);
      this.listShow.push(_.max(this.listShow) + 1);
      this.$forceUpdate();
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
    listRev() {
      const q = this.listShow.slice();
      q.reverse();
      return q;
    },
    listContentRev() {
      if (this.listRev) {
        return _.map(this.listRev, i => this.context[i]);
      }
      return [];
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
