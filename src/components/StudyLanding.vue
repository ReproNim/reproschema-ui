<template>
  <div class="mt-3 container">

      <div>
        <div>
          <h1>{{ 'Let’s get started!' }}</h1>
        </div>
        <p>
          Now that you’ve learned the basics of studyX, we will provide you with a bit more
          detail so you can decide if studyX is right for you.
        </p>
        <p>
          First, let’s see if you’re eligible for the studyX study!
        </p>
      </div>

      <p>
        <b-button size="lg" variant="success"
         :to="{name: 'Home',
         params: {id: 0 }}">
          Start
        </b-button>
      </p>
    </div>
</template>

<style>
.markdown h1 {
    text-align: center;
}

.markdown img {
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: auto;
  margin-right: auto;
  display: block;
}
</style>


<script>
import VueMarkdown from 'vue-markdown';
import axios from 'axios';

export default {
  name: 'Applet',
  props: {
    applet: {
      type: Object,
    },
    progressObj: {
      type: Object,
    },
    completeObj: {
      type: Object,
    },
    data: {
      type: Object,
    },
    activityOrder: {
      type: Array,
    },
    activityDisplayNames: {
      type: Object,
    },
  },
  data() {
    return {
      about: '',
    };
  },
  components: {
    VueMarkdown,
  },
  // watch: {
  //   data() {
  //     this.getAboutData();
  //   },
  // },
  mounted() {
    // this.getAppletData();
    // this.getAboutData();
    window.scrollTo(0, 0);
  },
  // computed: {
  //   // activityOrder() {
  //   //   const tmp = this.data['https://schema.repronim.org/order'];
  //   //   if (tmp) {
  //   //     return tmp[0]['@list'];
  //   //   }
  //   //   return [];
  //   // },
  // },
  // methods: {
  //   getAboutData() {
  //     console.log(98, this.data);
  //     if (this.data['http://schema.org/about']) {
  //       axios.get(this.data['http://schema.org/about'][0]['@value']).then((resp) => {
  //         this.about = resp.data;
  //       });
  //     }
  //   },
  // },
};
</script>

