<template>
  <div id="app" class="">
    <nav v-if="bannerMessage || showTimer" class="navbar sticky-top navbar-custom">
      <b-navbar-nav v-if="bannerMessage" class="navbar-brand">
        <b-nav-text>{{ $t('banner-message') }}</b-nav-text>
      </b-navbar-nav>
      <div id="timer" class="timer" v-if="showTimer">
        <!--  Timer Component  -->
        <Timer
            starttime="Dec 23, 2020 02:37:25"
            :endtime=expiryTime
            trans='{
            "day":"Day",
            "hours":"Hours",
            "minutes":"Minutes",
            "seconds":"Seconds",
            "expired":"Please contact the researchers for a new submission link.",
            "running":"Remaining...",
            "upcoming":"Till start of study."
            }'
        ></Timer>
        <!--  End! Timer Component  -->
      </div>
    </nav>
    <div class="wrapper">
      <!-- Sidebar -->
      <nav id="sidebar" ref="sidebar">
        <div class="sidebar-header">
          <h4>{{ sidebarHeader }}</h4>
        </div>
        <div>
          <select v-model="selected_language" @change="setLang($event)">
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
                    :disabled="!isAnswered">{{ $t('export-button')}}</b-button>
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
              <a v-if="showHelp" class="nav-link" href="#" v-bind:data-email=getEmailData>{{ $t('help-button') }}</a>
              <b-nav-item :to="{name: 'Landing', query: $route.query}" exact>{{ $t('home-button')}}</b-nav-item>
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
      <b-modal v-model="hasError" size="lg" ref="my-modal" hide-footer title="Uh-oh! Voice input needs fixing.">
        <div v-if="notIOS">
          <p>{{ $t('permission-change-notification')}}</p>
          <br>
          <img :src=permissionDemoPath alt="allow media permission" width="100%">
          <br>
          <p>{{ $t('permission-refresh') }}</p>
        </div>
        <div v-else>
          <p>{{ $t('safari-notification') }}</p>
        </div>
      </b-modal>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import axios from 'axios';
import Bowser from "bowser";
import moment from 'moment';
import _ from 'lodash';
import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import jsonld from 'jsonld/dist/jsonld.min';
import 'jszip/dist/jszip.min';
import { saveAs } from 'file-saver';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import circleProgress from './components/Circle/';
import Timer from './components/Timer/Timer';
import config from './config';
import i18n from './i18n';

Vue.use(BootstrapVue);
Vue.filter('reverse', value => value.slice().reverse());
const safeEval = require('safe-eval');
const MediaStreamRecorder = require('msr');

function getFilename(s) {
  const folders = s.split('/');
  const N = folders.length;
  const filename = folders[N - 1].split('.')[0];
  return filename;
}

class EmailDecoder {
    constructor(selector = '[data-email]') {
        this.selector = selector;
        this.initialize();
    }
    mailto(hash) {
        // https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
        window.location.href = `mailto:${atob(hash)}`
    }
    bindEvents() {
        document.querySelectorAll(this.selector).forEach(email => {
            email.addEventListener('click', () => {
                this.mailto(email.getAttribute('data-email'))
            })
        })
    }
    initialize() {
        this.bindEvents();
    }
}

export default {
  name: 'App',
  components: {
    circleProgress,
    Timer,
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
      content: {},
      startButton: config.startButton,
      showHelp: config.showHelp,
      bannerMessage: config.banner,
      audioConstraints: { audio: true, video: false },
      hasError: false,
      browserType: "",
      clientSpecs: {}
      // responses: [],
    };
  },
  methods: {
    initialize(audioStream) {
      this.mediaRecorder = new MediaStreamRecorder(audioStream);
    },
    error() {
      this.hasError = true;
    },
    checkPermission() {
      // Older browsers might not implement mediaDevices at all, so we set an empty object first
      if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
      }

      // Some browsers partially implement mediaDevices. We can't just assign an object
      // with getUserMedia as it would overwrite existing properties.
      // Here, we will just add the getUserMedia property if it's missing.
      if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = (constraints) => {
          // First get ahold of the legacy getUserMedia, if present
          const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia
                  || navigator.msGetUserMedia;

          // Some browsers just don't implement it - return a rejected promise with an error
          // to keep a consistent interface
          if (!getUserMedia) {
            this.supported = false;
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
          }

          // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
          return new Promise(((resolve, reject) => {
            getUserMedia.call(navigator, constraints, resolve, reject);
          }));
        };
      }

      if (navigator.mediaDevices.getUserMedia) {
        this.supported = true;
        navigator.mediaDevices.getUserMedia(this.audioConstraints).then(this.initialize, this.error);
        // console.log('getUserMedia API supported');
      } else {
        this.supported = false;
        // console.log(275, 'Getusermedia API is not supported on this browser');
      }


      // navigator.mediaDevices.getUserMedia(constraints)
      //         .then(function(stream) {
      //           /* use the stream */
      //         })
      //         .catch(function(err) {
      //           /* handle the error */
      //         });


    },
    setLang(event) {
      i18n.locale = event.target.value;
    },
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
        // eslint-disable-next-line no-prototype-builtins
        if (value[1].hasOwnProperty('used')) {
            value[1].used.push(this.protocolUrl);
        }
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
      const fileName = `${uuidv4()}-${this.participantId}`;
      _.map(data.response, (eachActivityList) => {
        const activityData = [];
        _.map(eachActivityList, (itemObj) => {
          const newObj = { ...itemObj }; // what does this do?
          if (itemObj['@type'] === 'reproschema:Response') {
            // const voiceMap = {};
            if (itemObj.value instanceof Blob) {
              const keyStrings = (itemObj.isAbout.split('/'));
              const rId = itemObj['@id'].split('uuid:')[1];
              jszip.folder(fileName).file(`${keyStrings[keyStrings.length-1]}-${rId}.wav`, itemObj.value);
              newObj.value = `${keyStrings[keyStrings.length-1]}-${rId}.wav`;
              voiceMap[itemObj['@id']] = `${keyStrings[keyStrings.length-1]}-${rId}.wav`;
            }
            // filter out sub-activities only, the criteria inside if needs to be changed
            else if (itemObj.value.constructor === Object && !itemObj.value.hasOwnProperty('unitCode')) {
              _.map(itemObj.value, (valueList, fieldKey) => {
                const subActivityFieldData = [];
                _.map(valueList, eachItem => {
                  const newItem = { ...eachItem };
                  if (eachItem && eachItem['@type'] === 'reproschema:Response') {
                    if (eachItem.value instanceof Blob) {
                      const keyStrings = (eachItem.isAbout.split('/'));
                      const rId = eachItem['@id'].split('uuid:')[1];
                      jszip.folder(fileName).file(`${keyStrings[keyStrings.length-1]}-${rId}.wav`, eachItem.value);
                      newItem.value = `${keyStrings[keyStrings.length-1]}-${rId}.wav`;
                      voiceMap[eachItem['@id']] = `${keyStrings[keyStrings.length-1]}-${rId}.wav`;
                    }
                  }
                  subActivityFieldData.push(newItem);
                });
                itemObj.value[fieldKey] = subActivityFieldData;
              })
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
          jszip.folder(fileName).file(`activity_${key}.jsonld`, JSON.stringify(activityData, null, 4));
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
          saveAs(myzipfile, `${fileName}.zip`);
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
    new EmailDecoder('[data-email]');
    this.clientSpecs = JSON.stringify(Bowser.parse(window.navigator.userAgent));
    this.browserType = Bowser.parse(window.navigator.userAgent).browser.name;
    if (config.checkMediaPermission) {
      this.checkPermission();
    }
    if (this.$route.query.lang) {
      this.selected_language = this.$route.query.lang;
      i18n.locale = this.selected_language;
    } else this.selected_language = 'en';

    if (this.$route.query.uid) {
      // console.log(407, this.$route.query.uid);
      this.$store.dispatch('saveParticipantId', this.$route.query.uid);
    } else if (config.generateRandomUid) {
      this.$store.dispatch('saveParticipantId', uuidv4());
    }
    if (this.$route.params.id) {
      this.$store.dispatch('setActivityIndex', this.$route.params.id);
    }
    axios.get('https://raw.githubusercontent.com/ReproNim/reproschema-library/master/resources/languages.json').then((resp) => {
      this.langMap = resp.data;
    });
    this.$store.dispatch('setParticipantUUID', uuidv4()); // set participant UUID for the current user
    if (this.$route.query.expiry_time) {
      this.$store.dispatch('setExpiryMinutes', this.$route.query.expiry_time);
    }
    if (this.$route.query.auth_token) {
      this.$store.dispatch('setAuthToken', this.$route.query.auth_token);
    }
    if (!_.isEmpty(this.$route.query)) {
        this.$store.dispatch('setQueryParameters', this.$route.query);
    }
  },
  computed: {
      notIOS() {
        // return false;
        return Bowser.parse(window.navigator.userAgent).os.name !== 'iOS';
      },
      permissionDemoPath() {
        let path = require('./assets/audio-permission-setting-chrome.gif');
        if (this.browserType === 'Firefox') {
          path = require('./assets/audio-permission-setting-firefox.gif');
          // do something - firefox image
        }
        else if (this.browserType === 'Safari') {
          path = require('./assets/audio-permission-setting-safari.gif');
        }
        // default is the Chrome demo
        return path;
      },
      expiryTime() {
        let endDate = moment(this.$store.getters.getExpiryTime)['_i'];
        endDate = endDate.replace(' ', '+');
        // console.log(537, endDate, new Date(endDate).toString(), new Date(endDate).getTime());
        return new Date(endDate).getTime();
      },
      showTimer() {
          return !!this.$store.getters.getExpiryTime;
      },
      getEmailData() {
          const emailData = `${config.contact}?subject=${config.emailSubject}&body=[ Describe the issue in detail. You can copy and paste text, screen capture and/or describe the expected vs. actual result.] Browser properties: ${this.clientSpecs}]`;
          return window.btoa(emailData);
      },
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
    shouldUpload() {
      return !!(config.backendServer && this.$store.getters.getAuthToken);
    },
    allowExport() {
      if (!_.isEmpty(this.$store.state.schema) && this.$store.state.schema['http://schema.repronim.org/allow']) {
        const allowList = _.map(this.$store.state.schema['http://schema.repronim.org/allow'],
          u => u['@id']);
        this.$store.dispatch('setExport', allowList.includes('http://schema.repronim.org/AllowExport'));
        return allowList.includes('http://schema.repronim.org/AllowExport') || !this.shouldUpload;
      }
      this.$store.dispatch('setExport', false);
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
    participantId() {
      return this.$store.getters.getParticipantId;
    },
  },
};
</script>

<style>
  .wrapper {
    display: flex;
    width: 100%;
  }

  #sidebar {
    min-width: 250px;
    max-width: 250px;
    text-align: center;
    transition: all 0.3s;
  }

  #sidebar.active {
    margin-left: -250px;
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

  #content {
    width: 100%;
    margin: 0;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  #content.active {
    width: 100%;
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

  a:not([href]):not([tabindex]) {
    color: inherit;
    text-decoration: none;
  }

  .help {
      color: rgba(0, 0, 0, 0.5);
  }

  @media (max-width: 768px) {
    #sidebar {
      margin-left: -250px;
    }
    #sidebar.active {
      margin-left: 0px;
    }
    #content {
      width: 100%;
    }
    #content.active {
      width: calc(100% - 250px);
    }
  }


</style>


