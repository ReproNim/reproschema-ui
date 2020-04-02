import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';
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
  scores: {},
  activities: [],
  activityIndex: null,
  storeReady: false,
  activityReady: false,
  termUrl: 'https://raw.githubusercontent.com/ReproNim/reproschema/master/terms/',
};
// const reproterms = 'https://raw.githubusercontent.com/ReproNim/reproschema/master/terms/';

const getters = {
  // eslint-disable-next-line
  getTermsUrl(state) {
    return state.termUrl;
  },
  // eslint-disable-next-line
  srcUrl(state) {
    if (!_.isEmpty(state.schema) && state.activityIndex) {
      return state.schema[`${state.termUrl}order`][0]['@list'][state.activityIndex]['@id'];
    }
    return null;
  },
  // eslint-disable-next-line
  readyForActivity(state) {
    return state.storeReady && state.activityReady;
  },
};

const mutations = {
  // eslint-disable-next-line
  setReprotermUrl(state, url) {
    axios.get(url).then((response) => {
      const ctx = _.filter(response.data['@context'], c => c.includes('contexts/generic'));
      console.log(40, ctx);
      axios.get(ctx[0]).then((resp) => {
        console.log(46, resp.data['@context'].reproterms);
        state.termUrl = resp.data['@context'].reproterms;
      });
    });
  },
  // eslint-disable-next-line
  setBaseSchema(state, data) {
    state.schema = data[0];
    state.progress = _.map(data[0][`${state.termUrl}order`][0]['@list'], () => 0);
    state.responses = _.map(data[0][`${state.termUrl}order`][0]['@list'], () => ({}));
    state.scores = _.map(data[0][`${state.termUrl}order`][0]['@list'], () => ({}));
    state.activities = _.map(data[0][`${state.termUrl}order`][0]['@list'], () => ({}));
    state.storeReady = true;
  },
  // eslint-disable-next-line
  setActivityIndex(state, idx) {
    state.activityIndex = idx;
    state.activityReady = true;
  },
  // eslint-disable-next-line
  saveResponse(state, { key, value }) {
    // console.log(50, state.activityIndex, key, value, state.responses);
    state.responses[state.activityIndex][key] = value;
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
  setLanguage(state, lang) {
    state.selected_language = lang;
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
  setLanguage({ commit }, lang) {
    commit('setLanguage', lang);
  },
  setActivityList({ commit }, actList) {
    commit('setActivityList', actList);
  },
  clearResponses({ commit }, actIndex) {
    commit('clearResponses', actIndex);
  },
};

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
});
