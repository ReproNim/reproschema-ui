<template>
  <div>
    <div v-if="!listShow.length">
      <h1 >{{ $t('loader')}}...</h1>
       <Loader />
    </div>
    <div v-else>
      <!-- <b-progress :value="progress" :max="100" class="mb-3"></b-progress> -->
      <div v-if="preambleText" class="preamble-text mb-2">
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
            :showPassOptions="showPassOptions"
            :reprotermsUrl="reprotermsUrl"
          />
        </transition>
        <b-modal v-model="showModal" ref="invalid-token-modal" ok-only title="Helpline!"
                 hide-footer header-class="justify-content-center">
          <p class="contact">If you're thinking about suicide, are worried about a friend or loved one, or would like emotional support, there are resources available 24/7. Your call or text is confidential and free.</p>

          <p>Call the Suicide Prevention Lifeline in the United States:</p>
          <p>English: 1-800-273-8255</p>
          <p>Español: 1-888-628-9454</p>
          <br>
          <p>Text the Crisis TextLine through SMS:</p>
          <p>US or Canada: 741741</p>
          <p class="contact"><a href="https://www.messenger.com/login.php?next=https%3A%2F%2Fwww.messenger.com%2Ft%2F204427966369963%2F%3Fmessaging_source%3Dsource%253Apages%253Amessage_shortlink" target="_blank">Facebook Messenger</a>
          <p>For other countries:</p>
          <p class="contact"><a href="https://www.befrienders.org" target="_blank">www.befrienders.org</a></p>
        </b-modal>
      </div>
    </transition-group>


    <div class="text-right mt-3" v-if="showPassOptions !== null ">
      <b-button variant="default"
                @click="restart">Restart</b-button>
      <b-button variant="default" v-if="showPassOptions['dontKnow']"
                @click="dontKnow">Don't Know</b-button>
      <b-button variant="default" v-if="showPassOptions['skip']"
                @click="skip">Skip</b-button>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import jsonld from 'jsonld/dist/jsonld.min';
import VuejsDialog from 'vuejs-dialog';
import 'vuejs-dialog/dist/vuejs-dialog.min.css';
import _ from 'lodash';
import Loader from '../Loader/';
import { v4 as uuidv4 } from 'uuid';

Vue.use(VuejsDialog);

const safeEval = require('safe-eval');

export default {
  name: 'Section',
  props: {
    reprotermsUrl: {
      type: String,
    },
    srcUrl: {
      type: String,
    },
    progress: {
      type: Number,
    },
    responses: {
      type: Object,
    },
    selected_language: {
      type: String,
      default: 'en',
    },
    showPassOptions: {
      type: Object,
    },
  },
  data() {
    return {
      activity: {},
      listShow: [],
      parsedJSONLD: {},
      visibility: {},
      scores: {},
      currentIndex: 0,
      showModal: false
    };
  },
  components: {
    Loader,
  },
  mounted() {
    if (this.srcUrl) {
      // eslint-disable-next-line
        this.getData();
      this.t0 = performance.now();
    }
  },
  methods: {
    getData() {
      // this.$store.dispatch('getActivityData');
      jsonld.expand(this.srcUrl).then((resp) => {
        this.activity = resp[0];
        this.listShow = [0];
        this.$nextTick(() => {
          const answered = _.filter(this.context, c =>
            Object.keys(this.responses).indexOf(c['@id']) > -1);
          if (!answered.length) {
            this.listShow = [0];
          } else {
            this.listShow = _.map(new Array(answered.length + 1), (c, i) => i);
          }
          this.visibility = this.getVisibility(this.responses);
        });
      });
    },
    getVisibility(responses) {
      const responseMapper = this.responseMapper(responses);
      if (!_.isEmpty(this.activity['http://schema.repronim.org/addProperties'])) {
        const visibilityMapper = {};
        _.map(this.activity['http://schema.repronim.org/addProperties'], (a) => {
          let val = true; // true by default if not mentioned
          if (a[`${this.reprotermsUrl}isVis`]) {
            val = a[`${this.reprotermsUrl}isVis`][0]['@value'];
          }
          if (_.isString(val)) {
            val = this.evaluateString(val, responseMapper);
          }
          if (responseMapper[a[`${this.reprotermsUrl}variableName`][0]['@value']]) {
            visibilityMapper[responseMapper[a[`${this.reprotermsUrl}variableName`][0]['@value']].ref] = val;
          }
        });
        // console.log(142, 'in section', visibilityMapper);
        return visibilityMapper;
      }
      return {};
    },
    responseMapper(responses) {
      let keyArr;
      // a variable map is defined! great
      if (this.activity['http://schema.repronim.org/addProperties']) {
        const vmap = this.activity['http://schema.repronim.org/addProperties'];
        keyArr = _.map(vmap, (v) => {
          const key = v['http://schema.repronim.org/isAbout'][0]['@id'];
          const qId = v['http://schema.repronim.org/variableName'][0]['@value'];
          const val = responses[key];
          return { key, val, qId };
        });

      }
      if (this.$store.getters.getQueryParameters) {
        const q = this.$store.getters.getQueryParameters;
        Object.entries(q).forEach(
                ([key, value]) => {
                  const qId = key;
                  if (key === "week") {
                    value = parseInt(value);
                  }
                  const val = value;
                  keyArr.push({ key, val, qId });
                }
        );
      }
      const outMapper = {};
      _.map(keyArr, (a) => {
        outMapper[a.qId] = { val: a.val, ref: a.key };
      });
      return outMapper;
    },
    evaluateString(string, responseMapper) {
      // console.log(176, string, responseMapper);
      const keys = Object.keys(responseMapper);
      let output = string;
      _.map(keys, (k) => {
        // grab the value of the key from responseMapper
        let val = responseMapper[k].val;
        if (Array.isArray(responseMapper[k].val)) {
          val = responseMapper[k].val[0];
        }
        if (val !== 'http://schema.repronim.org/Skipped' && val !== 'http://schema.repronim.org/DontKnow') {
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
    restart() {
      this.currentIndex = 0;
      this.listShow = [0];
      this.$emit('clearResponses');
    },
    skip(val) {
      this.$emit('skip', val);
    },
    dontKnow() {
      this.$emit('dontKnow');
    },
    updateProgress() {
      let totalQ = this.context.length;
      // TODO: add back branching logic to this.
      if (!_.isEmpty(this.visibility)) {
        totalQ = _.filter(this.visibility).length;
      }
      const progress = ((Object.keys(this.responses).length) / totalQ) * 100;
      this.$emit('updateProgress', progress);
      if (progress === 100) {
        // console.log(212, 'section complete--send responses: ', this.responses);
        // this.$emit('valueChanged', this.responses);
        this.$emit('next');
      }
    },
    setResponse(val, index) {
      const itemUrl = this.context[index]['@id'];
      // console.log(226, this.responses);
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
        '@context': 'https://raw.githubusercontent.com/ReproNim/reproschema/1.0.0-rc2/contexts/generic',
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
        '@context': 'https://raw.githubusercontent.com/ReproNim/reproschema/1.0.0-rc2/contexts/generic',
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
      //const valueAndDataExport = [responseActivity, respData];
      this.$emit('saveResponse', this.context[index]['@id'], val);
      let answeredObj = {};
      answeredObj[this.context[index]['@id']] = val;
      this.$emit('valueChanged', answeredObj);
      this.t0 = t1;
      const currResponses = { ...this.responses };
      if (val instanceof Object) {
        currResponses[this.context[index]['@id']] = respData.value;
      } else {
        currResponses[this.context[index]['@id']] = val;
      }
      // TODO: add back branching logic
      this.visibility = this.getVisibility(currResponses);

      // TODO: add back scoring logic to this component.
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
      this.$forceUpdate();
    },
    getScoring(responses) {
      const responseMapper = this.responseMapper(responses);
      if (!_.isEmpty(this.activity['http://schema.repronim.org/compute'])) {
        const scoreMapper = {};
        _.map(this.activity['http://schema.repronim.org/compute'], (a) => {
          let scoreFormula = a[`${this.reprotermsUrl}jsExpression`][0]['@value'];
          const scoreVariableName = a[`${this.reprotermsUrl}variableName`][0]['@value'];
          if (_.isString(scoreFormula)) {
            scoreFormula = this.evaluateString(scoreFormula, responseMapper);
          }
          if (responseMapper[scoreVariableName]) {
            scoreMapper[responseMapper[scoreVariableName].ref] = scoreFormula;
          }
        });
        return scoreMapper;
      }
      return {};
    },
    checkAlertMessage(idx) {
      // final setting should be a combination of all four [activity (add, override), protocol(add, override)] (if present)
      // protocol overrides activity
      const protocolSchema = this.$store.getters.getProtocolSchema;
      let flag = 0;
      if (!flag && protocolSchema['http://schema.repronim.org/overrideProperties']) { // priority 1
        // console.log(259, 'priority 1');
      } else if (!flag && protocolSchema['http://schema.repronim.org/addProperties']) { // priority 2
        let addP = _.filter(protocolSchema['http://schema.repronim.org/addProperties'], c => {
          // console.log(263, c['http://schema.repronim.org/isAbout'][0]['@id'], this.context[idx]['@id']);
          c['http://schema.repronim.org/isAbout'][0]['@id'] === this.context[idx]['@id'];
        });
        flag = addP.length ? 1: 0;
        // console.log(265, 'priority 2', this.context[idx]['@id'], addP, flag);
      } if (!flag && this.activity['http://schema.repronim.org/overrideProperties']) { // priority 3
        // console.log(268, 'priority 3');
      } else { // priority 4 - look in activity addProperties
        let addPA = _.filter(this.activity['http://schema.repronim.org/addProperties'], c =>
          //console.log(271, c['http://schema.repronim.org/isAbout'][0]['@id'], this.context[idx]['@id']);
          (c['http://schema.repronim.org/isAbout'][0]['@id'] === this.context[idx]['@id']) && c['http://schema.repronim.org/message']
        );
        // console.log(274, 'priority 4', addPA);
      }
      const key_name = this.context[idx]['@id'].split('/');
      if (idx === 8 && key_name[key_name.length - 1] === 'phq9_9' && this.responses[this.context[idx]['@id']] > 0) {
        this.showModal = true;
      }
    },
    nextQuestion(idx, skip, dontKnow) {
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
      this.checkAlertMessage(idx);
      if (skip) {
        this.setResponse('http://schema.repronim.org/Skipped', idx);
      }
      if (dontKnow) {
        this.setResponse('http://schema.repronim.org/DontKnow', idx);
      }

      this.$forceUpdate();
      if (idx <= this.listShow.length - 1) {
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
    order() {
      return this.activity[`${this.reprotermsUrl}order`][0]['@list'];
    },
  },
  watch: {
    srcUrl() {
      if (this.srcUrl) {
        this.getData();
      }
    },
  },
  computed: {
    currentItem() {
      return this.context[this.currentIndex];
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
      if (this.activity[`${this.reprotermsUrl}order`]) {
        const keys = this.activity[`${this.reprotermsUrl}order`][0]['@list'];
        return keys;
      }
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
          const activePreamble = _.filter(this.activity[`${this.reprotermsUrl}preamble`],
            p => p['@language'] === this.selected_language);
          return activePreamble[0]['@value'];
        }
        return '';
      },
      findPassOptions() {
        if (this.activity[this.reprotermsUrl+'allow']) {
          let isSkip = false;
          let isDontKnow = false;
          _.map(this.activity[`${this.reprotermsUrl}allow`][0]['@list'], s => {
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
      }
    },
  };
</script>

