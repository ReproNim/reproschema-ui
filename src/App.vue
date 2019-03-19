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
                <a @click="setActivity(index)" :class="{'current': index==activityIndex}">
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
import _ from 'lodash';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import circleProgress from './components/Circle/';
import SurveyItem from './components/SurveyItem';

Vue.use(BootstrapVue);
Vue.component('survey-item', SurveyItem);
Vue.filter('reverse', value => value.slice().reverse());

export default {
  name: 'App',
  components: {
    circleProgress,
  },
  data() {
    return {
      sidebarActive: true,
      selected_language: 'en',
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
      this.$store.dispatch('updateProgress', progress);
      this.$forceUpdate();
    },
    saveResponse(key, value) {
      this.$store.dispatch('saveResponse', { key, value });
    },
    clearResponses() {
      this.$store.dispatch('clearResponses', this.activityIndex);
      this.$forceUpdate();
    },
    getName(url) {
      // TODO: this is a hack. the jsonld expander should give us this info.
      if (url) {
        const folders = url.split('/');
        const N = folders.length;
        return folders[N - 1].split('_schema')[0].split('.jsonld')[0];
      }
      return null;
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
    schemaOrder() {
      if (!_.isEmpty(this.$store.state.schema)) {
        const order = _.map(this.$store.state.schema['https://schema.repronim.org/order'][0]['@list'],
          u => u['@id']);
        return order;
      }
      return [];
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
