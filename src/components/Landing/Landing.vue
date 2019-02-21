<template>
  <div class="landingPage mt-3 pt-3 text-left">
    <vue-markdown v-if="content"> {{content}} </vue-markdown>
    <Loader v-else/>
  </div>
</template>

<style>
  .landingPage img {
    max-width: 250px;
  }
</style>

<script>
import axios from 'axios';
import VueMarkdown from 'vue-markdown';
import config from '../../config';
import Loader from '../Loader';

export default {
  components: {
    VueMarkdown,
    Loader,
  },
  data() {
    return {
      content: null,
    };
  },
  mounted() {
    axios.get(config.contentSrc).then((resp) => {
      this.content = resp.data;
    });
  },
};
</script>
