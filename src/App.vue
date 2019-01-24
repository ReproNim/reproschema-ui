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
        <ul class="list-unstyled components" v-if="schema.ui">
            <!-- <p>Dummy Heading</p> -->
            <li v-for="(ui, index) in schema.ui.order" :key="index">
                <a @click="setActivity(index)" :class="{'current': index==activityIndex}">
                  <circleProgress
                   :radius="20"
                   :progress="progress[index]"
                   :stroke="4"
                   strokeColor="#007bff" />
                   <span class="align-middle activityItem">
                     {{ui}}
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
                    <b-nav-item to="/" exact>Home</b-nav-item>
                  </b-navbar-nav>
              </div>
          </nav>
          <b-container>
            <router-view
              :srcUrl="srcUrl" :responses="responses[activityIndex]"
              :selected_language="selected_language"
              v-on:updateProgress="updateProgress"
              v-on:saveResponse="saveResponse"
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
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import circleProgress from './components/Circle';
import config from './config';


Vue.use(BootstrapVue);
Vue.filter('reverse', value => value.slice().reverse());

const contextObj = {
  nda_guid: 'https://raw.githubusercontent.com/sanuann/schema-standardization/master/activities/NDA/nda_guid.jsonld',
  phq9_schema: 'https://raw.githubusercontent.com/sanuann/schema-standardization/master/activities/PHQ-9/phq9_schema.jsonld',
  phq9a_schema: 'https://raw.githubusercontent.com/sanuann/schema-standardization/master/activities/PHQ-9a/phq9a_schema.jsonld',
  phq8_schema: 'https://raw.githubusercontent.com/sanuann/schema-standardization/master/activities/PHQ-8/phq8_schema.jsonld',
};

export default {
  name: 'App',
  components: {
    circleProgress,
  },
  data() {
    return {
      sidebarActive: true,
      selected_language: 'en',
      // schema: {},
      // activityIndex: null,
      // progress: [],
      // responses: {},
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
      // this.activityIndex = index;
      // this.$store.dispatch('setActivityIndex', index);
      this.$router.push(`/activities/${index}`);
    },
    updateProgress(progress) {
      this.$store.dispatch('updateProgress', progress);
      // this.progress[this.activityIndex] = progress;
      this.$forceUpdate();
    },
    saveResponse(key, value) {
      // this.responses[this.activityIndex][key] = value;
      this.$store.dispatch('saveResponse', { key, value });
      // Vue.set(this.responses[this.activityIndex], key, value);
      // eslint-disable-next-line
      // console.log('TOTAL RESPONSE:', this.responses);
      // this.$forceUpdate();
    },
  },
  watch: {
    $route() {
      if (this.$route.params.id !== undefined) {
        // this.activityIndex = this.$route.params.id;
        this.$store.dispatch('setActivityIndex', this.$route.params.id);
      }
    },
    selected_language() {
      this.$store.dispatch('setLanguage', this.selected_language);
    },
  },
  beforeCreate() {
    // console.log('before App.vue create')
    // this.$store.dispatch('getBaseSchema');
  },
  created() {
    this.$store.dispatch('getBaseSchema');
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