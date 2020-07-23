import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import jsonld from 'jsonld/dist/jsonld.min';
import config from '../config';
// eslint-disable-next-line import/first
import axios from 'axios';

window.jsonld = jsonld;

Vue.use(Vuex);
const state = {
  schema: {},
  progress: [],
  responses: [],
  exportResponses: [],
  scores: {},
  participantId: '',
  activities: [],
  activityIndex: null,
  storeReady: false,
  activityReady: false,
  termUrl: 'http://schema.repronim.org/',
  schemaType: '',
  answeredLanguage: '',
  participantUuid: '',
  expiryMinutes: null,
  token: null,
};

const getters = {
  // eslint-disable-next-line
  getParticipantId(state) {
    return state.participantId;
  },
  // eslint-disable-next-line
  getschemaType(state) {
    return state.schemaType;
  },
  // eslint-disable-next-line
  getTermsUrl(state) {
    return state.termUrl;
  },
  // eslint-disable-next-line
  srcUrl(state) {
    if (!_.isEmpty(state.schema) && state.activityIndex) {
      state.schemaType = (state.schema['@type'][0]).split('/').slice(-1)[0];
      if (state.schemaType === 'Activity') {
        return state.schema['@id']; // for rendering parameterized activities
      } return state.schema[`${state.termUrl}order`][0]['@list'][state.activityIndex]['@id'];
    }
    return null;
  },
  // eslint-disable-next-line
  readyForActivity(state) {
    return state.storeReady && state.activityReady;
  },
  // eslint-disable-next-line
  getAnsweredLanguage(state) {
    return state.answeredLanguage;
  },
};

const mutations = {
  // eslint-disable-next-line
  async setReprotermUrl(state, url) {
    axios.get(url).then((response) => {
      // console.log(67, response.data);
      const ctx = response.data['@context'];
      // const ctx = _.filter(response.data['@context'], c => c.includes('contexts/generic'));
      axios.get(ctx).then((resp) => {
        // console.log(68, resp.data);
        // state.termUrl = resp.data['@context'].reproterms;
        state.termUrl = 'http://schema.repronim.org/'; // change this
      });
    });
  },
  // eslint-disable-next-line
  setBaseSchema(state, data) {
    state.schema = data[0];
    state.progress = _.map(data[0][`${state.termUrl}order`][0]['@list'], () => 0);
    state.responses = _.map(data[0][`${state.termUrl}order`][0]['@list'], () => ({}));
    state.exportResponses = _.map(data[0][`${state.termUrl}order`][0]['@list'], () => ([]));
    state.scores = _.map(data[0][`${state.termUrl}order`][0]['@list'], () => ({}));
    state.activities = _.map(data[0][`${state.termUrl}order`][0]['@list'], () => ({}));
    state.storeReady = true;
    // state.participantId = uuidv4();
  },
  // eslint-disable-next-line
  setActivityIndex(state, idx) {
    state.activityIndex = idx;
    state.activityReady = true;
  },
  // eslint-disable-next-line
  setAuthToken(state, authToken) {
    state.token = authToken;
  },
  // eslint-disable-next-line
  setParticipantUUID(state, uid) {
    state.participantUuid = uid;
  },
  // eslint-disable-next-line
  setExpiryMinutes(state, minutes) {
    state.expiryMinutes = minutes;
  },
  // eslint-disable-next-line
  saveResponse(state, { key, value }) {
    // console.log(50, state.activityIndex, key, value);
    const val = value[0]; // response value
    const exportResponseActivity = value[1]; // response activity object for exporting data
    const exportResponse = value[2]; // response object for export data
    state.responses[state.activityIndex][key] = val;
    state.exportResponses[state.activityIndex].push(exportResponseActivity, exportResponse);
    // console.log(87, state.exportResponses);
  },
  // eslint-disable-next-line
  saveScores(state, { key, scoreObj }) {
    state.scores[state.activityIndex][key] = scoreObj;
    // _.map(scoreObj, (val, scoreKey) => {
    //   console.log(58, val, scoreKey, state.scores);
    //   state.scores[key][scoreKey] = val;
    // });
  },
  // eslint-disable-next-line
  saveParticipantId(state, uid) {
    state.participantId = uid;
  },
  // eslint-disable-next-line
  updateProgress(state, progress) {
    state.progress[state.activityIndex] = progress;
  },
  // eslint-disable-next-line
  setActivityData(state, resp) {
    state.activities[state.activityIndex].activity = resp[0];
    state.activities[state.activityIndex].listShow = [0];
  },
  // eslint-disable-next-line
  setListShow(state, arr) {
    state.activities[state.activityIndex].listShow = arr;
  },
  // eslint-disable-next-line
  // setLanguage(state, lang) {
  //   state.selected_language = lang;
  // },
  // eslint-disable-next-line
  setAnsweredLanguage(state, lang) {
    state.answeredLanguage = lang;
  },
  // eslint-disable-next-line
  setActivityList(state, actList) {
    if (state.activities[state.activityIndex]) {
      state.activities[state.activityIndex].activityList = actList;
    }
  },
  // eslint-disable-next-line
  clearResponses(state, actIndex) {
    state.responses[actIndex] = {};
    state.progress[actIndex] = 0;
  },
};

const actions = {
  async getReproTerm({ commit }, url) {
    commit('setReprotermUrl', url);
  },
  async getBaseSchema({ commit }, url) {
    commit('setBaseSchema', await (jsonld.expand(url || config.githubSrc)));
  },
  async setActivityIndex({ commit }, idx) {
    commit('setActivityIndex', idx);
  },
  saveParticipantId({ commit }, val) {
    commit('saveParticipantId', val);
  },
  saveResponse({ commit }, { key, value }) {
    commit('saveResponse', { key, value });
  },
  saveScores({ commit }, { key, scoreObj }) {
    commit('saveScores', { key, scoreObj });
  },
  updateProgress({ commit }, progress) {
    commit('updateProgress', progress);
  },
  // eslint-disable-next-line
  async getActivityData({ commit, getters }) {
    return commit('setActivityData', await jsonld.expand(getters.srcUrl));
  },
  updateListShow({ commit }, arr) {
    commit('setListShow', arr);
  },
  setAnsweredLanguage({ commit }, lang) {
    commit('setAnsweredLanguage', lang);
  },
  setActivityList({ commit }, actList) {
    commit('setActivityList', actList);
  },
  clearResponses({ commit }, actIndex) {
    commit('clearResponses', actIndex);
  },
  setParticipantUUID({ commit }, puid) {
    commit('setParticipantUUID', puid);
  },
  setAuthToken({ commit }, tok) {
    commit('setAuthToken', tok);
  },
  setExpiryMinutes({ commit }, mins) {
    commit('setExpiryMinutes', mins);
  },
};

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
});
