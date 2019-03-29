<template>
  <div id="app" class="">
    <div class="wrapper">
      <!-- Sidebar -->
      <nav id="sidebar" ref="sidebar">
        <div class="sidebar-header">
          <h3>Activities</h3>
        </div>
        <div>
          <select v-model="selected_language">
            <option disabled value="">Select Language</option>
            <option value="en">English</option>
          </select>
        </div>
        <ul class="list-unstyled components">
            <!-- <p>Dummy Heading</p> -->
            <li v-for="(ui, index) in schemaOrder" :key="index">
                <a @click="setActivity(index)"
                v-if="visibility[index]"
                :class="{'current': index==activityIndex}">
                  <circleProgress
                   :radius="20"
                   :progress="progress[index]"
                   :stroke="4"
                   strokeColor="#007bff" />
                   <span class="align-middle activityItem">
                     {{getName(ui)}}
                   </span>
                </a>
            </li>
        </ul>
        <div>
          <b-button class="align-middle" @click="downloadZipData">Export</b-button>
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
              :srcUrl="srcUrl" :responses="responses[activityIndex]"
              :selected_language="selected_language"
              :progress="progress[activityIndex]"
              v-on:updateProgress="updateProgress"
              v-on:saveResponse="saveResponse"
              v-on:clearResponses="clearResponses"
            />
          </b-container>
      </div>
    </div>
  </div>
</template>

<script>
// import jsonld from 'jsonld/dist/jsonld.min';
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import axios from 'axios';
import _ from 'lodash';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import circleProgress from './components/Circle/';
// import SurveyItem from './components/SurveyItem';

Vue.use(BootstrapVue);
// Vue.component('survey-item', SurveyItem);
Vue.filter('reverse', value => value.slice().reverse());

function getFilename(s) {
  const folders = s.split('/');
  const N = folders.length;
  const filename = folders[N - 1].split('.')[0];
  return filename;
}

function getCoffee() {
  return new Promise(resolve => setTimeout(() => resolve('☕'), 2000)); // it takes 2 seconds to make coffee);
}

export default {
  name: 'App',
  components: {
    circleProgress,
  },
  data() {
    return {
      sidebarActive: true,
      selected_language: 'en',
      visibility: {},
      cache: {},
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
    setActivity(index) {
      if (this.$route.query.url) {
        this.$router.push(`/activities/${index}?url=${this.$route.query.url}`);
      } else {
        this.$router.push(`/activities/${index}`);
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
      if (this.currentResponse[key] !== value && this.progress[this.activityIndex] === 100) {
        // there has been a change in an already completed activity
        needsVizUpdate = true;
      }
      this.$store.dispatch('saveResponse', { key, value });
      if (needsVizUpdate) {
        this.setVisbility();
      }
    },
    clearResponses() {
      this.$store.dispatch('clearResponses', this.activityIndex);
      this.$forceUpdate();
    },
    getName(url) {
      // TODO: this is a hack. the jsonld expander should give us this info.
      if (url) {
        if (!_.isEmpty(this.$store.state.schema)) {
          const nameMap = this.$store.state.schema['https://schema.repronim.org/activity_display_name'][0];
          if (url in nameMap) {
            // console.log(123, nameMap[url][0]['@id']);
            const mappedUrl = nameMap[url][0]['@id'];
            const folders = mappedUrl.split('/');
            const N = folders.length;
            return folders[N - 1].split('_schema')[0].split('.jsonld')[0];
          }
        }
      }
      return null;
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
        this.cache[cacheKey] = resp.data;

        return resp.data;
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
      const totalResponse = this.$store.state.responses;
      console.log('download data file', totalResponse);
      // const dirPaths = config.dirPaths;
      // const pathToDb = path.join(userData, dirPaths[0]);
      // var zip = new easyzip.EasyZip();
      // zip.zipFolder(pathToDb, function (err) {
      //   if (err) {
      //     console.log(err);
      //     throw err;
      //   }
      //   console.log('success zipping');
      //   zip.writeToResponse(res, 'myUploads');
      //   res.end();
      // });
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
    this.$store.dispatch('getBaseSchema', url);
  },
  mounted() {
    if (this.$route.params.id) {
      this.$store.dispatch('setActivityIndex', this.$route.params.id);
    }
  },
  computed: {
    srcUrl() {
      return this.$store.getters.srcUrl;
    },
    schema() {
      return this.$store.state.schema;
    },
    responses() {
      return this.$store.state.responses;
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
        const order = _.map(this.$store.state.schema['https://schema.repronim.org/order'][0]['@list'],
          u => u['@id']);
        return order;
      }
      return [];
    },
    schemaNameMapper() {
      const output = {};
      if (this.schemaOrder) {
        _.map(this.schemaOrder, (s) => {
          const fname = getFilename(s);
          output[fname] = s;
        });
      }
      return output;
    },
    visibilityConditions() {
      if (this.schema['https://schema.repronim.org/visibility']) {
        return _.map(this.schemaOrder, (s) => {
          // TODO: don't assume the key name is the same as the ending of the filename.
          const keyName = getFilename(s);

          // look through the "https://schema.repronim.org/visibility" field
          // and reformat nicely

          let condition = _.filter(this.schema['https://schema.repronim.org/visibility'], (c) => {
            return c['@index'] === keyName;
          });
          if (condition.length === 1) {
            condition = condition[0];

            // check which keys are in this condition:

            const conditionKeys = Object.keys(condition);
            if (conditionKeys.indexOf('@value') > -1) {
              return condition['@value'];
            }

            if (conditionKeys.indexOf('http://schema.org/httpMethod') > -1 &&
              conditionKeys.indexOf('http://schema.org/url') > -1 &&
              conditionKeys.indexOf('https://schema.repronim.org/payload') > -1
            ) {
              // lets fill the payload here.
              const payload = {};
              const payloadList = condition['https://schema.repronim.org/payload'];
              _.map(payloadList, (p) => {
                const item = p['@value'];
                const index = this.schemaOrder.indexOf(this.schemaNameMapper[item]);
                payload[this.schemaNameMapper[item]] = this.responses[index];
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
</style>
