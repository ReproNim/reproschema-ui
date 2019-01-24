import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import _ from 'lodash';
import jsonld from 'jsonld/dist/jsonld.min';
import config from '../config';


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

const contextObj = {
  nda_guid: 'https://raw.githubusercontent.com/sanuann/schema-standardization/master/activities/NDA/nda_guid.jsonld',
  phq9_schema: 'https://raw.githubusercontent.com/sanuann/schema-standardization/master/activities/PHQ-9/phq9_schema.jsonld',
  phq9a_schema: 'https://raw.githubusercontent.com/sanuann/schema-standardization/master/activities/PHQ-9a/phq9a_schema.jsonld',
  phq8_schema: 'https://raw.githubusercontent.com/sanuann/schema-standardization/master/activities/PHQ-8/phq8_schema.jsonld',
};

const getters = {
  // eslint-disable-next-line
  srcUrl(state) {
    if (state.schema && state.activityIndex) {
      if (state.schema.ui) {
        return contextObj[state.schema.ui.order[state.activityIndex]];
      }
      // return 'https://raw.githubusercontent.com/sanuann/schema-standardization/master/activities/PHQ-9/phq9_schema.jsonld';
    }
    return null;
  },
  readyForActivity(state) {
    return state.storeReady && state.activityReady;
  },
  // eslint-disable-next-line
  context(state) {
    if (state.activities) {
      if (state.activities[state.activityIndex]) {
        const currentActivity = state.activities[state.activityIndex].activity;
        if (currentActivity) {
          const currentActivityOrder = currentActivity['https://schema.repronim.org/order'];
          if (currentActivityOrder) {
            const keys = currentActivityOrder[0]['@list'];
            return keys;
          }
        }
      }
    }
    /* eslint-enable */
    return [{}];
  },
  // eslint-disable-next-line
  contextReverse(state) {
    if (state.context) {
      if (state.context.length > 0) {
        return state.context.slice().reverse();
      }
    }
    return {};
  },
  // eslint-disable-next-line
  preambleText(state) {
    if (state.activities) {
      if (state.activities[state.activityIndex]) {
        const currentActivity = state.activities[state.activityIndex].activity;
        if (currentActivity) {
          const currentActivityPreamble = currentActivity['http://schema.repronim.org/preamble'];
          if (currentActivityPreamble) {
            const activePreamble = _.filter(currentActivityPreamble, p => p['@language'] === state.selected_language);
            if (activePreamble.length) {
              return activePreamble[0]['@value'];
            }
          }
        }
      }
    }
    return '';
  },
};

const mutations = {
  setBaseSchema(state, { data }) {
    console.log('setting base schema');
    state.schema = data;
    state.progress = _.map(data.ui.order, () => 0);
    state.responses = _.map(data.ui.order, () => ({}));
    state.activities = _.map(data.ui.order, () => ({}));
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
    console.log('setting activity data,', state, state.activityIndex, resp);
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
};

const actions = {
  async getBaseSchema({ commit }) {
    commit('setBaseSchema', await (axios.get(config.githubSrc)));
  },
  async setActivityIndex({ commit, dispatch }, idx) {
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
};

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
});
