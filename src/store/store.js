import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';
import jsonld from 'jsonld/dist/jsonld.min';
import config from '../config';

window.jsonld = jsonld;

Vue.use(Vuex);
const state = {
  schema: {},
  progress: [],
  responses: [],
  activities: [],
  activityIndex: null,
  storeReady: false,
  activityReady: false,
};

const getters = {
  // eslint-disable-next-line
  srcUrl(state) {
    if (!_.isEmpty(state.schema) && state.activityIndex) {
      return state.schema['https://schema.repronim.org/order'][0]['@list'][state.activityIndex]['@id'];
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
  setBaseSchema(state, data) {
    state.schema = data[0];
    state.progress = _.map(data[0]['https://schema.repronim.org/order'][0]['@list'], () => 0);
    state.responses = _.map(data[0]['https://schema.repronim.org/order'][0]['@list'], () => ({}));
    state.activities = _.map(data[0]['https://schema.repronim.org/order'][0]['@list'], () => ({}));
    state.storeReady = true;
  },
  // eslint-disable-next-line
  setActivityIndex(state, idx) {
    state.activityIndex = idx;
    state.activityReady = true;
  },
  // eslint-disable-next-line
  saveResponse(state, { key, value }) {
    state.responses[state.activityIndex][key] = value;
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
  async getBaseSchema({ commit }, url) {
    commit('setBaseSchema', await (jsonld.expand(url || config.githubSrc)));
  },
  async setActivityIndex({ commit }, idx) {
    commit('setActivityIndex', idx);
  },
  saveResponse({ commit }, { key, value }) {
    commit('saveResponse', { key, value });
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
