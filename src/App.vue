<template>
  <div id="app" class="">
    <nav class="navbar sticky-top navbar-custom">
      <b-navbar-nav class="navbar-brand">
        <b-nav-text>{{ banner }}</b-nav-text>
      </b-navbar-nav>
    </nav>
    <div class="wrapper">
      <!-- Sidebar -->
      <nav id="sidebar" v-bind:class="{'active':checkDisableBack}" ref="sidebar">
        <div class="sidebar-header">
          <h4>{{ sidebarHeader }}</h4>
        </div>
        <div>
          <select v-model="selected_language">
            <option disabled value="">Select Language</option>
            <option v-for="option in languageOptions" v-bind:value="option.value"
            :key="option.text">
              {{option.text}}
            </option>
          </select>
        </div>
        <ul class="list-unstyled components">
          <!-- <p>Dummy Heading</p> -->
          <li v-for="(ui, index) in schemaOrder" :key="index">
<!--            hi {{ index }} {{ visibility }}-->
            <a @click="setActivity(index)"
               v-if="visibility[index]"
               :class="{'current': index===activityIndex}">
              <circleProgress v-if="isProtocolUrl"
                :radius="20"
                :progress="progress[index]"
                :stroke="4"
                strokeColor="#007bff" />
              <span class="align-middle activityItem">
                     {{getDisplayName(ui)}}
                   </span>
            </a>
          </li>
        </ul>
        <div>
          <b-button v-if="allowExport" class="align-middle" @click="downloadZipData"
                    :disabled="!isAnswered">Export</b-button>
        </div>
      </nav>

      <!-- Page Content -->
      <div id="content">
        <!-- We'll fill this with dummy content -->
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
          <div class="container-fluid">
            <b-navbar-nav>
              <b-button v-b-toggle.sidebar>Toggle Sidebar</b-button>
              <button @click="toggleSidebar"
                      type="button"
                      id="sidebarCollapse"
                      class="btn">
                <span class="navbar-toggler-icon"></span>
              </button>
            </b-navbar-nav>

            <b-navbar-nav class="float-right">
              <b-nav-item :to="{name: 'Landing', query: $route.query}" exact>Home</b-nav-item>
            </b-navbar-nav>
          </div>
        </nav>
        <b-container>
          <router-view
            :reprotermsUrl="reprotermsUrl"
            :srcUrl="srcUrl" :responses="responses[activityIndex]"
            :selected_language="selected_language"
            :ipAddress="clientIp"
            :participantID="getPId"
            :progress="progress[activityIndex]"
            :autoAdvance="checkAdvance"
            :actVisibility="Object.values(visibility)"
            :nextActivity="nextActivity"
            v-on:updateProgress="updateProgress"
            v-on:saveResponse="saveResponse"
            v-on:saveScores="saveScores"
            v-on:clearResponses="clearResponses"
          />
        </b-container>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import axios from 'axios';
import _ from 'lodash';
import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import jsonld from 'jsonld/dist/jsonld.min';
import 'jszip/dist/jszip.min';
import { saveAs } from 'file-saver';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import circleProgress from './components/Circle/';
import config from './config';

Vue.use(BootstrapVue);
Vue.filter('reverse', value => value.slice().reverse());
const safeEval = require('safe-eval');

function getFilename(s) {
  const folders = s.split('/');
  const N = folders.length;
  const filename = folders[N - 1].split('.')[0];
  return filename;
}

export default {
  name: 'App',
  components: {
    circleProgress,
  },
  data() {
    return {
      sidebarActive: true,
      selected_language: '',
      sidebarHeader: '',
      visibility: {},
      displayNames: {},
      labelMap: {},
      langMap: {},
      cache: {},
      isAnswered: false,
      clientIp: '',
      reproterms2: '',
      protocolUrl: config.githubSrc,
      banner: config.banner,
      content: {},
      // responses: [],
    };
  },
  methods: {
    toggleSidebar() {
      if (this.$refs.sidebar.className.indexOf('active') < 0) {
        this.$refs.sidebar.className = 'active';
      } else {
        this.$refs.sidebar.className = '';
      }
    },
    getVariableName(s, variableMap) {
      const vmap = variableMap;
      const mapper = {};
      _.map(vmap, (v) => {
        const uri = v['http://schema.repronim.org/isAbout'][0]['@id'];
        const variable = v['http://schema.repronim.org/variableName'][0]['@value'];
        mapper[uri] = variable;
      });
      return mapper[s];
    },
    setActivity(index) {
      if (!this.checkDisableBack && this.isProtocolUrl) { // check if disableBack not enabled
        if (this.$route.query.url) {
          this.$router.push(`/activities/${index}?url=${this.$route.query.url}`);
        } else {
          this.$router.push(`/activities/${index}`);
        }
      }
    },
    updateProgress(progress) {
      this.checkProgressDiff(this.progress[this.activityIndex], progress);
      this.$store.dispatch('updateProgress', progress);
      this.$forceUpdate();
    },
    checkProgressDiff(oldP, newP) {
      // TODO: check for an already completed activity. Progress won't change,
      // but there will be a change in responses that needs to trigger
      // this.setVisibility().
      if ((oldP !== newP) && newP === 100) {
        // console.log('time to check for branching activities!');
        this.setVisbility();
      }
    },
    saveResponse(key, value) {
      let needsVizUpdate = false;
      if (this.currentResponse[key] !== value[0] && this.progress[this.activityIndex] === 100) {
        // there has been a change in an already completed activity
        needsVizUpdate = true;
      }
      // add protocol url to prov:used key in responseActivity
      value[1].used.push(this.protocolUrl);
      this.$store.dispatch('saveResponse', { key, value });
      if (needsVizUpdate) {
        this.setVisbility();
      }
      this.isAnswered = true;
    },
    saveScores(key, scoreObj) {
      this.$store.dispatch('saveScores', { key, scoreObj });
    },
    clearResponses() {
      this.$store.dispatch('clearResponses', this.activityIndex);
      this.$forceUpdate();
    },
    getDisplayName(activityUrl) {
      if (!_.isEmpty(this.$store.state.schema)) {
        // console.log(197, this.$store.state.schema['http://schema.repronim.org/addProperties']);
        let labelList = this.labelMap[activityUrl];
        if (this.$store.state.schema['http://schema.repronim.org/addProperties'][0]['http://www.w3.org/2004/02/skos/core#prefLabel']) {
          const addProperties = this.$store.state.schema['http://schema.repronim.org/addProperties'];
          const s = _.filter(addProperties, v1 => v1['http://schema.repronim.org/isAbout'][0]['@id'] === activityUrl);
          // console.log(152, s);
          labelList = s[0]['http://www.w3.org/2004/02/skos/core#prefLabel'];
          const dName = _.filter(labelList, d => d['@language'] === this.selected_language);
          // console.log(154, dName);
          if (!Array.isArray(dName) || !dName.length) {
            // array does not exist, is not an array, or is empty
            // return display name corresponding to default language
            return labelList[0]['@value'];
          }
          return dName[0]['@value'];
        }
        // console.log(216, this.labelMap[activityUrl]);
        const dName = _.filter(labelList, d => d['@language'] === this.selected_language);
        // console.log(154, dName);
        if (!Array.isArray(dName) || !dName.length) {
          // array does not exist, is not an array, or is empty
          // return display name corresponding to default language
          return labelList;
        }
        return dName[0]['@value'];
      } return '';
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
          if (_.isArray(val)) {
            val = `[${val}]`; // put braces for array
          }
          output = output.replace(new RegExp(`\\b${k}\\b` || `\\b${k}\\.`), val);
        } else {
          output = output.replace(new RegExp(`\\b${k}\\b`), 0);
        }
      });
      return safeEval(output);
    },
    responseMapper(index, responses) {
      // a variable map is defined! great
      if (this.schema['http://schema.repronim.org/addProperties']) {
        const vmap = this.schema['http://schema.repronim.org/addProperties'];
        const keyArr = _.map(vmap, (v) => {
          const key = v['http://schema.repronim.org/isAbout'][0]['@id'];
          const qId = v['http://schema.repronim.org/variableName'][0]['@value'];
          const rp = _.filter(responses, r => key in r);
          let val = rp[0];
          if (rp[0]) {
            val = rp[0][key];
          }
          return { key, val, qId };
        });
        const outMapper = {};
        _.map(keyArr, (a) => {
          outMapper[a.qId] = { val: a.val, ref: a.key };
        });
        return outMapper;
      }
      return {};
    },
    getPrefLabel() {
      const baseSchema = this.$store.state.schema;
      let sidebarHeader = _.filter(baseSchema['http://www.w3.org/2004/02/skos/core#prefLabel'], n => n['@language'] === this.selected_language);
      if (!sidebarHeader.length) { // selected_language absent, return label in default language
        sidebarHeader = baseSchema['http://www.w3.org/2004/02/skos/core#prefLabel'];
      }
      this.sidebarHeader = sidebarHeader[0]['@value']; // set sidebar header
      if (this.schemaOrder) {
        _.map(this.schemaOrder, (s) => {
          jsonld.expand(s).then((resp) => {
            this.labelMap[s] = resp[0]['http://www.w3.org/2004/02/skos/core#prefLabel'];
          });
        });
      }
    },
    async computeVisibilityCondition(cond, index) {
      if (_.isObject(cond)) {
        const request = {
          method: cond.method,
          url: cond.url,
          data: cond.payload,
          headers: {
            'content-type': 'application/json',
          },
        };
        const cacheKey = JSON.stringify(request);
        if (Object.keys(this.cache).indexOf(cacheKey) > -1) {
          // this.visibility[index] = this.cache[cacheKey];
          return this.cache[cacheKey];
        }
        if (this.visibility[index] == null || this.visibility[index] === undefined) {
          // if there is a request and it hasn't been run yet, then
          // default to false
          this.visibility[index] = false;
        }
        // console.log('making request', request, 'cache', this.cache);
        const resp = await axios(request);
        // this.visibility[index] = resp.data;
        this.cache[cacheKey] = resp.data.qualified;
        return resp.data.qualified;
      } else if (_.isString(cond)) {
        const responseMapper = this.responseMapper(index, this.$store.state.responses);
        const v = this.evaluateString(cond, responseMapper);
        // this.visibilty[index] = v;
        return v;
      }
      return cond;
    },
    visibilityChain(conditionList) {
      if (!conditionList[0]) {
        return 0;
      }
      return this.computeVisibilityCondition(conditionList[0].condition,
        conditionList[0].index)
        .then((resp) => {
          this.visibility[conditionList[0].index] = resp;
          this.$forceUpdate();
          const newConditionList = [...conditionList];
          newConditionList.shift();
          this.visibilityChain(newConditionList);
        });
    },
    setVisbility() {
      const values = _.map(this.visibilityConditions, (condition, index) => ({ condition, index }));
      this.visibilityChain(values);
    },
    downloadZipData() {
      const Response = this.$store.state.exportResponses;
      const totalScores = this.$store.state.scores;
      const uId = this.$store.state.participantId;
      const totalResponse = { response: Response, scores: totalScores, participantId: uId };
      this.formatData(totalResponse);
    },
    formatData(data) {
      const jszip = new JSZip();
      // const fileUploadData = {};
      // const JSONdata = {};
      // const JSONscores = {};
      // sort out blobs from JSONdata
      let key = 0;
      const voiceMap = {};
      _.map(data.response, (eachActivityList) => {
        const activityData = [];
        _.map(eachActivityList, (itemObj) => {
          const newObj = { ...itemObj };
          if (itemObj['@type'] === 'reproschema:Response') {
            // const voiceMap = {};
            if (itemObj.value instanceof Blob) {
              const keyStrings = (itemObj.isAbout.split('/items/')[1]);
              const rId = itemObj['@id'].split('uuid:')[1];
              jszip.folder('responses').file(`${keyStrings}-${rId}.wav`, itemObj.value);
              newObj.value = `${keyStrings}-${rId}.wav`;
              voiceMap[itemObj['@id']] = `${keyStrings}-${rId}.wav`;
            }
            // eslint-disable-next-line no-unused-vars
            // _.map(itemObj, (value, key1) => {
            //   if (value instanceof Blob) {
            //     const keyStrings = (itemObj.isAbout.split('/items/')[1]);
            //     const rId = itemObj['@id'].split('uuid:')[1];
            //     jszip.folder('responses').file(`${keyStrings}-${rId}.wav`, value);
            //     // eslint-disable-next-line no-param-reassign
            //     voiceMap[itemObj['@id']] = `${keyStrings}-${rId}.wav`;
            //   }
            //   // todo: check if sections are present, they are no longer object but lists
            //   // else if (_.isObject(value)) {
            //   //   // make sure there aren't any Blobs here.
            //   //   // if there are, add them to fileUploadData
            //   //   _.map(value, (val2, key2) => {
            //   //     if (val2 instanceof Blob) {
            //   //       // console.log(322, val, key2, val2);
            //   //       fileUploadData[`${key2}`] = val2;
            //   //     }
            //   //     else {
            //   //       // refill the object.
            //   //       if (!JSONdata[key]) {
            //   //         JSONdata[key] = {};
            //   //       }
            //   //       JSONdata[key][key2] = val2;
            //   //     }
            //   //   });
            //   // }
            //   // else {
            //   //   JSONdata[key] = val;
            //   // }
            // });
            // console.log(316, voiceMap);
            // _.map(voiceMap, (v, ky) => {
            //   if (ky in itemObj) {
            //     const newObj = itemObj;
            //     // console.log(327, itemObj);
            //     newObj[ky] = v;
            //   }
            // });
          }
          activityData.push(newObj);
        });
        // write out the activity files
        if (activityData.length) { // if activity is answered then write to file
          jszip.folder('responses').file(`activity_${key}.jsonld`, JSON.stringify(activityData, null, 4));
          key += 1;
        }
      });

      // _.map(data.scores, (val, key) => { // todo: check if score object not null?
      //   if (!_.isEmpty(val)) {
      //     JSONscores[key] = val;
      //   }
      // });
      // _.map(JSONdata, (val, key) => {
      //   // console.log(342, (key));
      // jszip.folder('responses').file(`activity_${key}.json`, JSON.stringify(val, null, 4));
      // });
      // _.map(JSONscores, (val, key) => {
      // jszip.folder('scores').file(`activity_${key}_score.json`, JSON.stringify(val, null, 4));
      // });
      jszip.generateAsync({ type: 'blob' })
        .then((myzipfile) => {
          const fileName = `study-data-${uuidv4()}`;
          saveAs(myzipfile, fileName);
        });
    },
  },
  watch: {
    $route() {
      if (this.$route.params.id !== undefined) {
        this.$store.dispatch('setActivityIndex', this.$route.params.id);
      }
    },
    visibilityConditions: {
      handler(newC) {
        if (!_.isEmpty(newC)) {
          this.setVisbility();
        }
      },
      deep: true,
    },
  },
  created() {
    const url = this.$route.query.url;
    if (url) {
      this.protocolUrl = url;
    }
    this.$store.dispatch('getBaseSchema', url).then(() => this.getPrefLabel());
    // this.$store.dispatch('getBaseSchema', url);
  },
  mounted() {
    if (this.$route.query.lang) {
      this.selected_language = this.$route.query.lang;
    } else this.selected_language = 'en';

    if (this.$route.query.uid) {
      // console.log(407, this.$route.query.uid);
      this.$store.dispatch('saveParticipantId', this.$route.query.uid);
    }
    if (this.$route.params.id) {
      this.$store.dispatch('setActivityIndex', this.$route.params.id);
    }
    axios.get('https://raw.githubusercontent.com/ReproNim/reproschema-library /master/resources/languages.json').then((resp) => {
      this.langMap = resp.data;
    });
    this.$store.dispatch('setParticipantUUID', uuidv4()); // set participant UUID for the current user
    if (this.$route.query.expiry_minutes) {
      this.$store.dispatch('setExpiryMinutes', this.$route.query.expiry_minutes);
    }
    if (this.$route.query.auth_token) {
      this.$store.dispatch('setAuthToken', this.$route.query.auth_token);
    }
  },
  computed: {
    getschemaType() {
      return this.$store.getters.getschemaType;
    },
    isProtocolUrl() {
      if (this.getschemaType === 'Activity') {
        return false;
      } return true;
    },
    srcUrl() {
      return this.$store.getters.srcUrl;
    },
    reprotermsUrl() {
      return this.$store.getters.getTermsUrl;
    },
    schema() {
      return this.$store.state.schema;
    },
    responses() {
      return this.$store.state.responses;
    },
    scores() {
      return this.$store.state.scores;
    },
    activityIndex() {
      return this.$store.state.activityIndex;
    },
    progress() {
      return this.$store.state.progress;
    },
    currentActivityProgress() {
      return this.progress[this.activityIndex];
    },
    currentResponse() {
      return this.responses[this.activityIndex];
    },
    schemaOrder() {
      if (!_.isEmpty(this.$store.state.schema)) {
        const order = _.map(this.$store.state.schema['http://schema.repronim.org/order'][0]['@list'],
          u => u['@id']);
        return order;
      }
      return [];
    },
    languageOptions() {
      if (!_.isEmpty(this.$store.state.schema)) {
        const langCodeList = _.map(this.$store.state.schema['http://www.w3.org/2004/02/skos/core#prefLabel'], l => l['@language']);
        const langList = _.map(langCodeList, c => ({ value: c, text: this.langMap[c] }));
        return langList;
      } return [];
    },
    // getPrefLabel() {
    //   if (!_.isEmpty(this.$store.state.schema)) {
    //     const preferredLabel = _.filter(this.$store.state.schema['http://www.w3.org/2004/02/skos/core#prefLabel'], n => n['@language'] === this.selected_language);
    //     console.log(508, 'get label', preferredLabel);
    //     if (preferredLabel) {
    //       return preferredLabel[0]['@value'];
    //     } return this.$store.state.schema['http://www.w3.org/2004/02/skos/core#prefLabel'][0]['@value']; // return label in default language
    //   } return '';
    // },
    allowExport() {
      if (!_.isEmpty(this.$store.state.schema) && this.$store.state.schema['http://schema.repronim.org/allow']) {
        const allowList = _.map(this.$store.state.schema['http://schema.repronim.org/allow'],
          u => u['@id']);
        return allowList.includes('http://schema.repronim.org/AllowExport');
      }
      return false;
    },
    schemaNameMapper() {
      const output = {};
      if (this.schemaOrder) {
        _.map(this.schemaOrder, (s) => {
          let fname = '';
          if (this.schema['http://schema.repronim.org/variableMap']) {
            fname = this.getVariableName(s, this.schema['http://schema.repronim.org/variableMap']);
          } else {
            // TODO: remove this backwards compatibility else
            fname = getFilename(s);
          }
          output[fname] = s;
        });
      }
      return output;
    },
    visibilityConditions() {
      if (this.schema['http://schema.repronim.org/addProperties']) {
        return _.map(this.schemaOrder, (s) => {
          // let keyName = '';
          const addProperties = this.schema['http://schema.repronim.org/addProperties'];
          const currentActivityObj = _.filter(addProperties, v1 => v1['http://schema.repronim.org/isAbout'][0]['@id'] === s);
          let varName = _.filter(currentActivityObj[0]['http://schema.repronim.org/variableName'], v => v['@language'] === this.selected_language);
          if (!varName.length) {
            // if selected lang is not in schema, return corresponding to default lang
            varName = currentActivityObj[0]['http://schema.repronim.org/variableName'];
          }
          // keyName = varName[0]['@value'];
          if (currentActivityObj[0]['http://schema.repronim.org/isVis']) {
            const condition1 = currentActivityObj[0]['http://schema.repronim.org/isVis'][0];
            if ('@value' in condition1) {
              return condition1['@value'];
            }
            if (('http://schema.org/httpMethod' in condition1) &&
                ('http://schema.org/url' in condition1) &&
                ('http://schema.repronim.org/payload' in condition1)) {
              // lets fill the payload here.
              const payload = {};
              // const payloadList = condition['http://schema.repronim.org/payload'];
              const payloadList = condition1['http://schema.repronim.org/payload']; // todo: check when its payload
              _.map(payloadList, (p) => {
                const item = p['@value'];
                const index = this.schemaOrder.indexOf(this.schemaNameMapper[item]);
                payload[this.schemaNameMapper[item]] = this.scores[index];
              });
              return {
                url: condition1['http://schema.org/url'][0]['@value'],
                method: condition1['http://schema.org/httpMethod'][0]['@value'],
                payload,
              };
            }
          }
          // if something is up with the schema, just default to true.
          return true;
        });
      }
      // return all true's:
      return _.mapValues(this.schemaOrder, () => true);
    },
    checkDisableBack() {
      if (!_.isEmpty(this.$store.state.schema) && this.$store.state.schema['http://schema.repronim.org/allow']) {
        const allowList = _.map(this.$store.state.schema['http://schema.repronim.org/allow'],
          u => u['@id']);
        return allowList.includes('http://schema.repronim.org/DisableBack'); // if true then hide sidebar on-load and activities cannot be clicked
      }
      return false;
    },
    getPId() {
      return this.$store.getters.getParticipantId;
    },
    checkAdvance() {
      if (!_.isEmpty(this.$store.state.schema) && this.$store.state.schema['http://schema.repronim.org/allow']) {
        const allowList = _.map(this.$store.state.schema['http://schema.repronim.org/allow'],
          u => u['@id']);
        return allowList.includes('http://schema.repronim.org/AutoAdvance');
      }
      return false;
    },
    nextActivity() {
      const nextObj = {};
      for (let i = 0; i < this.schemaOrder.length - 1; i += 1) {
        nextObj[this.schemaOrder[i]] = this.schemaOrder[i + 1];
      }
      return nextObj;
    },
  },
};
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }

  #content {
    width: 100%;
    margin: 0;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .wrapper {
    display: flex;
    width: 100%;
    align-items: stretch;
  }

  #sidebar {
    min-width: 250px;
    max-width: 250px;
  }

  /*@media screen and (min-width: 769px) {*/
  /*  #sidebar {*/
  /*    display: none;*/
  /*  }*/
  /*}*/

  /*@media screen and (min-width: 1001px) {*/
  /*  #sidebar {*/
  /*    display:block ;*/
  /*  }*/
  /*}*/

  @media (min-width: 768px) and (max-width: 1000px) {
    .collapse {
      display: none !important;
    }
  }

  #sidebar.active {
    margin-left: -250px;
  }

  /*@media (max-width: 768px) {*/
  /*  #sidebar {*/
  /*    margin-left: -250px;*/
  /*  }*/
  /*  #sidebar.active {*/
  /*    margin-left: 0;*/
  /*  }*/
  /*}*/

  #sidebar {
    /* don't forget to add all the previously mentioned styles here too */
    transition: all 0.3s;
  }

  #sidebar .sidebar-header {
    padding: 20px;
  }

  #sidebar ul.components {
    padding: 20px 0;
  }

  #sidebar ul p {
    padding: 10px;
  }

  #sidebar ul li a {
    padding: 10px;
    font-size: 1.1em;
    display: block;
    cursor: pointer;
    text-align: left;

  }
  #sidebar ul li a:hover {
    background-color: #17a2b8;
    color: white;
  }

  .current {
    background-color: #17a2b8;
    color: white !important;
  }

  #sidebar ul li.active > a, a[aria-expanded="true"] {

  }
  ul ul a {
    font-size: 1.5em !important;
    padding-left: 30px !important;

  }

  select > .placeholder {
    display: none;
  }

  .spacer {
    flex: 1;
  }
  body {
    margin: 0;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  .navbar-custom {
    align-items:center;
    background-color: #219c6d;
    color: floralwhite;
    display: flex;
    flex-wrap: wrap;
    justify-content: center!important;
    padding: .25rem .75rem .25rem .75rem;
    left: 0;
    bottom: 0;
    width: 100%;
  }
  .navbar-brand {
    font-size: 1.75rem;
  }
</style>
