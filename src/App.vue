<template>
  <div id="app" class="">
    <div class="wrapper">
      <!-- Sidebar -->
      <nav id="sidebar" ref="sidebar">
        <div class="sidebar-header">
          <h3>Activities</h3>
        </div>

        <ul class="list-unstyled components" v-if="schema._ui">
            <!-- <p>Dummy Heading</p> -->
            <li v-for="(ui, index) in schema._ui.order" :key="index">
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
                  <button @click="toggleSidebar"
                          type="button"
                          id="sidebarCollapse"
                          class="btn">
                      <span class="navbar-toggler-icon"></span>
                  </button>
              </div>
          </nav>
          <b-container>
            <router-view :srcUrl="srcUrl" v-on:updateProgress="updateProgress"/>
          </b-container>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import circleProgress from './components/Circle';
import config from './config';


Vue.use(BootstrapVue);
Vue.filter('reverse', value => value.slice().reverse());

export default {
  name: 'App',
  components: {
    circleProgress,
  },
  data() {
    return {
      sidebarActive: true,
      schema: {},
      activityIndex: 0,
      progress: [],
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
      this.activityIndex = index;
    },
    updateProgress(progress) {
      this.progress[this.activityIndex] = progress;
      this.$forceUpdate();
    },
  },
  mounted() {
    axios.get(config.githubSrc).then((resp) => {
      this.schema = resp.data;
      /* eslint-disable */
      this.progress = _.map(this.schema._ui.order, () => 0);
      /* eslint-enable */
    });
  },
  computed: {
    srcUrl() {
      /* eslint-disable */
      if (this.schema._ui) {
        console.log();
        return this.schema[this.schema._ui.order[this.activityIndex]]['@id'];
      }
      /* eslint-enable */
      return null;
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

</style>
