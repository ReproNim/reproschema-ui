<template>
  <div id="app" class="">
    <nav class="navbar sticky-top navbar-custom">
      <b-navbar-nav class="navbar-brand">
        <b-nav-text>This service is a demonstration for the ReproNim project.</b-nav-text>
      </b-navbar-nav>
    </nav>
    <div class="wrapper">
      <!-- Sidebar -->
      <nav id="sidebar" v-bind:class="{'active':checkDisableBack}" ref="sidebar">
        <div class="sidebar-header">
          <h3>Activities</h3>
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
          <b-button class="align-middle" @click="downloadZipData"
                    :disabled="!isAnswered">Export</b-button>
        </div>
      </nav>

      <!-- Page Content -->
      <div id="content">
        <!-- We'll fill this with dummy content -->
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
          <div class="container-fluid">
            <b-navbar-nav>
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
import jsonld from 'jsonld/dist/jsonld.min';
import 'jszip/dist/jszip.min';
import { saveAs } from 'file-saver';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import circleProgress from './components/Circle/';

Vue.use(BootstrapVue);
Vue.filter('reverse', value => value.slice().reverse());

// let this.reprotermsUrl = 'https://raw.githubusercontent.com/ReproNim/reproschema/master/terms/';

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
      visibility: {},
      displayNames: {},
      labelMap: {},
      langMap: {},
      cache: {},
      isAnswered: false,
      clientIp: '',
      reproterms2: '',
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
        const uri = v[`${this.reprotermsUrl}isAbout`][0]['@id'];
        const variable = v[`${this.reprotermsUrl}variableName`][0]['@value'];
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
      console.log(178, 'save app', key, value);
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
        if (this.$store.state.schema[`${this.reprotermsUrl}displayNameMap`]) {
          // TODO: displayNameMap can be used to override prefLabel
          const displayNameMap = this.$store.state.schema[`${this.reprotermsUrl}displayNameMap`];
          const s = _.filter(displayNameMap, v1 => v1[`${this.reprotermsUrl}isAbout`][0]['@id'] === activityUrl);
          // console.log(152, s);
          const dName = _.filter(s[0]['http://schema.org/alternateName'], d => d['@language'] === this.selected_language);
          // console.log(154, dName);
          if (!Array.isArray(dName) || !dName.length) {
            // array does not exist, is not an array, or is empty
            // return display name corresponding to default language
            return s[0]['http://schema.org/alternateName'][0]['@value'];
          }
          return dName[0]['@value'];
        }
        return this.labelMap[activityUrl];
      } return '';
    },
    getPrefLabel() {
      if (this.schemaOrder) {
        _.map(this.schemaOrder, (s) => {
          jsonld.expand(s).then((resp) => {
            this.labelMap[s] = resp[0]['http://www.w3.org/2004/02/skos/core#prefLabel'][0]['@value'];
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
        // todo: implement client-side evaluation!
        Error('Client-side branching at activity set level is not implemented yet');
      }
      // this.visibility[index] = cond;
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
      _.map(data.response, (activityList) => {
        jszip.folder('responses').file(`activity_${key}.json`, JSON.stringify(activityList, null, 4));
        key += 1;
        // _.map(activityList, itemObj => {
        //   // if (val instanceof Blob) {
        //   //   // console.log(315, key, val);
        //   //   fileUploadData[key] = val;
        //   // } else if (_.isObject(val)) {
        //   //   // make sure there aren't any Blobs here.
        //   //   // if there are, add them to fileUploadData
        //   //   _.map(val, (val2, key2) => {
        //   //     if (val2 instanceof Blob) {
        //   //       // console.log(322, val, key2, val2);
        //   //       fileUploadData[`${key2}`] = val2;
        //   //     } else {
        //   //       // refill the object.
        //   //       if (!JSONdata[key]) {
        //   //         JSONdata[key] = {};
        //   //       }
        //   //       JSONdata[key][key2] = val2;
        //   //     }
        //   //   });
        //   // } else {
        //   //   JSONdata[key] = val;
        //   // }
        // });
      });

      // _.map(data.scores, (val, key) => { // todo: check if score object not null?
      //   if (!_.isEmpty(val)) {
      //     JSONscores[key] = val;
      //   }
      // });
      // _.map(JSONdata, (val, key) => {
      //   // console.log(342, (key));
      //   jszip.folder('data/responses').file(`activity_${key}.json`, JSON.stringify(val, null, 4));
      // });
      // _.map(JSONscores, (val, key) => {
      //   jszip.folder('data/scores').file(`activity_${key}_score.json`, JSON.stringify(val, null, 4));
      // });
      // _.map(fileUploadData, (val, key) => {
      //   const keyStrings = (key.split('activities/')[1]).split('/items/');
      //   jszip.folder(`data/responses/${keyStrings[0]}`).file(`${keyStrings[1]}.wav`, val);
      // });
      if (data.participantId) {
        jszip.file('userDetails.json', data.participantId);
      }
      jszip.generateAsync({ type: 'blob' })
        .then((myzipfile) => {
          saveAs(myzipfile, 'study-data.zip');
        });
    },
  },
  watch: {
    $route() {
      if (this.$route.params.id !== undefined) {
        this.$store.dispatch('setActivityIndex', this.$route.params.id);
      }
    },
    selected_language() {
      this.$store.dispatch('setLanguage', this.selected_language);
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
    // console.log('url is', url);
    if (url) {
      this.$store.dispatch('getReproTerm', url).then(() => {
        this.$store.dispatch('getBaseSchema', url).then(() => this.getPrefLabel());
      });
    } else {
      this.$store.dispatch('getBaseSchema', url).then(() => this.getPrefLabel());
    }
  },
  mounted() {
    // console.log(329, this.$route.query.uid, this.$route.query.consented);
    // if (this.$route.query.uid && this.$route.query.consented === 'True') {
    //   this.$router.push('/activities/0');
    // }
    // `http://api.ipstack.com/check?access_key=${accessKey}&hostname=1`
    if (this.$route.query.lang) {
      this.selected_language = this.$route.query.lang;
    } else this.selected_language = 'en';

    if (this.$route.query.uid) {
      this.$store.dispatch('saveParticipantId', this.$route.query.uid);
    }
    // axios.get('https://api.muctool.de/whois').then((resp) => {
    //   // console.log(32, resp.data.ip);
    //   this.clientIp = resp.data.ip;
    // });
    if (this.$route.params.id) {
      this.$store.dispatch('setActivityIndex', this.$route.params.id);
    }
    axios.get('https://raw.githubusercontent.com/ReproNim/reproschema/master/resources/languages.json').then((resp) => {
      this.langMap = resp.data;
    });
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
        const order = _.map(this.$store.state.schema[`${this.reprotermsUrl}order`][0]['@list'],
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
    allowExport() {
      if (!_.isEmpty(this.$store.state.schema) && this.$store.state.schema[`${this.reprotermsUrl}allow`]) {
        // console.log(351, this.$store.state.schema[this.reprotermsUrl+'allow'][0]['@list']);
        const allowList = _.map(this.$store.state.schema[`${this.reprotermsUrl}allow`][0]['@list'],
          u => u['@id']);
        return allowList.includes(`${this.reprotermsUrl}allow_export`);
      }
      return false;
    },
    schemaNameMapper() {
      const output = {};
      if (this.schemaOrder) {
        _.map(this.schemaOrder, (s) => {
          let fname = '';
          if (this.schema[`${this.reprotermsUrl}variableMap`]) {
            fname = this.getVariableName(s, this.schema[`${this.reprotermsUrl}variableMap`]);
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
      if (this.schema[`${this.reprotermsUrl}visibility`]) {
        return _.map(this.schemaOrder, (s) => {
          let keyName = '';
          if (this.schema[`${this.reprotermsUrl}variableMap`]) {
            keyName = this.getVariableName(s, this.schema[`${this.reprotermsUrl}variableMap`]);
          } else {
            // TODO: remove this backwards compatibility else
            keyName = getFilename(s);
          }
          // look through the "https://schema.repronim.org/visibility" field
          // and reformat nicely

          let condition = _.filter(this.schema[`${this.reprotermsUrl}visibility`], c => c['@index'] === keyName);
          const condition1 = _.filter(this.schema[`${this.reprotermsUrl}vis`], c => c[`${this.reprotermsUrl}variableName`][0]['@value'] === keyName);
          if (condition.length === 1) {
            condition = condition[0];
            if ('@value' in condition1[0][`${this.reprotermsUrl}isVis`][0]) {
              return condition1[0][`${this.reprotermsUrl}isVis`][0]['@value'];
            }
            if (('http://schema.org/httpMethod' in condition1[0][`${this.reprotermsUrl}isVis`][0]) &&
                ('http://schema.org/url' in condition1[0][`${this.reprotermsUrl}isVis`][0]) &&
                (`${this.reprotermsUrl}payload` in condition1[0][`${this.reprotermsUrl}isVis`][0])) {
              // lets fill the payload here.
              const payload = {};
              // const payloadList = condition[`${this.reprotermsUrl}payload`];
              const payloadList = condition1[0][`${this.reprotermsUrl}isVis`][0][`${this.reprotermsUrl}payload`];
              _.map(payloadList, (p) => {
                const item = p['@value'];
                const index = this.schemaOrder.indexOf(this.schemaNameMapper[item]);
                payload[this.schemaNameMapper[item]] = this.scores[index];
              });
              return {
                url: condition['http://schema.org/url'][0]['@value'],
                method: condition['http://schema.org/httpMethod'][0]['@value'],
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
      if (!_.isEmpty(this.$store.state.schema) && this.$store.state.schema[`${this.reprotermsUrl}allow`]) {
        const allowList = _.map(this.$store.state.schema[`${this.reprotermsUrl}allow`][0]['@list'],
          u => u['@id']);
        return allowList.includes(`${this.reprotermsUrl}disable_back`); // if true then hide sidebar on-load and activities cannot be clicked
      }
      return false;
    },
    checkAdvance() {
      if (!_.isEmpty(this.$store.state.schema) && this.$store.state.schema[`${this.reprotermsUrl}allow`]) {
        const allowList = _.map(this.$store.state.schema[`${this.reprotermsUrl}allow`][0]['@list'],
          u => u['@id']);
        return allowList.includes(`${this.reprotermsUrl}auto_advance`);
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

  #sidebar.active {
    margin-left: -250px;
  }

  @media (max-width: 768px) {
    #sidebar {
      margin-left: -250px;
    }
    #sidebar.active {
      margin-left: 0;
    }
  }

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
