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
        });
      });
    },
    nextQuestion(idx, skip, dontKnow) {
      if (skip) {
        this.$emit('saveResponse', this.context[idx]['@id'], 'skipped');
        if (this.activity['https://schema.repronim.org/scoringLogic']) {
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
              console.log('TOTAL SCORE::::', eval(str + ' ' + scoringLogic));
            } catch (e) {
              // Do nothing
            }
          }
        }
      }
      if (dontKnow) {
        this.$emit('saveResponse', this.context[idx]['@id'], 'dontKnow');
        if (this.activity['https://schema.repronim.org/scoringLogic']) {
          const scoringLogic = (this.activity['https://schema.repronim.org/scoringLogic'][0]['@value']).split('= ')[1];
          if (this.responses) {
            // eslint-disable-next-line
            // console.log(113, this.responses);
            let str = '';
            _.forOwn(this.responses, (val, key) => {
              const qId = (key.split(/\/items\//)[1]).split(/.jsonld/)[0]; // split url to get the scoring key
              // console.log(142, qId, val);
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
              console.log('TOTAL SCORE::::', eval(str + ' ' + scoringLogic));
            } catch (e) {
              // Do nothing
            }
          }
        }
      }
      if (idx === this.listShow.length - 1) {
        this.listShow.push(_.max(this.listShow) + 1);
      }
    },
    setResponse(value, index) {
      this.$emit('saveResponse', this.context[index]['@id'], value);
      if (this.activity['https://schema.repronim.org/scoringLogic']) {
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
            console.log('TOTAL SCORE::::', eval(str + ' ' + scoringLogic));
            // console.log('str', str);
          } catch (e) {
            // Do nothing
          }
        }
      }
      /* if (this.activity['https://schema.repronim.org/branchLogic']) {
        const branchLogic = this.activity['https://schema.repronim.org/branchLogic'][0]['@value'].split();
        if (this.responses) {
          let br = '';
          _.forOwn(this.responses, (val, key) => {
            const qId = (key.split(/\/items\//)[1]).split(/.jsonld/)[0];
            if (branchLogic) {
              if (isNaN(val)) {
                br += `const ${qId}=0; `;
              } else {
                br += `const ${qId}=${val}; `;
              }
            }
          });
          try {
            // eslint-disable-next-line
            console.log('branch logic::::', eval(br+' '+ branchLogic));
            console.log('br', br);
          } catch (e) {
            console.log('catch-br', br);
            // Do nothing
          } */
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
      if (this.activity['http://schema.repronim.org/preamble']) {
        const activePreamble = _.filter(this.activity['http://schema.repronim.org/preamble'], p => p['@language'] === this.selected_language);
        return activePreamble[0]['@value'];
      }
      return '';
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
