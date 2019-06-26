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
  scores: {},
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
    state.scores = _.map(data[0]['https://schema.repronim.org/order'][0]['@list'], () => ({}));
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

const ANSWERS = 'answers';
const CURRENT_STEP = 'currentStep';
const NAME = 'name';
const PHONE = 'phone';
const OS = 'os';
const SCOPE = 'scope';

let DATA = {};

function loadString(key) {
  return DATA[key];
}
function saveString(key, string) {
  DATA[key] = string;
}
function loadObj(key) {
  return DATA[key];
}
function saveObj(key, object) {
  DATA[key] = object;
}
function loadInt(key) {
  return DATA[key];
}

class Store {
  static UNSTARTED = 0
  static ELIGIBILITY_DONE = 1
  static CONSENT_DONE = 2
  static QUIZ_DONE = 3
  static SIGN_DONE = 4
  static REGISTER_DONE = 5

  clearAll() {
    DATA = {};
  }
  getSharingScope() {
    return loadString(SCOPE) || '';
  }
  setSharingScope(scope) {
    saveString(SCOPE, scope);
  }
  getPhone() {
    return loadString(PHONE) || '';
  }
  setPhone(phone) {
    saveString(PHONE, phone);
  }
  getSystem() {
    return loadString(OS) || '';
  }
  setSystem(os) {
    saveString(OS, os);
  }
  getName() {
    return loadString(NAME) || '';
  }
  setName(name) {
    saveString(NAME, name);
  }
  getAnswers() {
    return loadObj(ANSWERS) || {};
  }
  setAnswers(answers) {
    saveObj(ANSWERS, answers);
  }
  getCurrentStep() {
    return loadInt(CURRENT_STEP) || 0;
  }
  setCurrentStep(step) {
    saveObj(CURRENT_STEP, step);
  }
  advanceCurrentStep() {
    this.setCurrentStep(this.getCurrentStep() + 1);
  }
}
