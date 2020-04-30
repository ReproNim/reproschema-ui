<template>
  <div class="docked-layout">
    <section id="smooth-scroller" class="smooth-scroller" style="padding-top: 0">
      <section style="height: 30vw; min-height: 15rem;
      background: linear-gradient(#268762, #15ac7f)">
        <div style="
          height: 30vw;
          min-height: 15rem;
          background-image: url(static/images/about%20the%20study.svg);
          background-position: center;
          background-size: contain;
          background-repeat: no-repeat">
        </div>
      </section>
      <br>
      <vue-markdown v-if="content"> {{content}} </vue-markdown>
      <Loader v-else/>
    </section>
    <p style="margin-top: 2rem">
      <button class="join-button" @click="doNext">Join</button>
    </p>
  </div>
</template>

<script>

import axios from 'axios';
import VueMarkdown from 'vue-markdown';
import Loader from '../Loader';

export default {
  name: 'Landing',
  props: {
    contentSrc: {
      type: String,
    },
  },
  components: {
    VueMarkdown,
    Loader,
  },
  data() {
    return {
      content: null,
    };
  },
  computed: {
    reprotermsUrl() {
      return this.$store.getters.getTermsUrl;
    },
  },
  methods: {
    doBack() {
      if (this.step > 1) {
        this.step -= 1;
      }
    },
    doNext() {
      this.$router.push('/activities/0');
    },
    getContent() {
      let landingUrl = this.contentSrc; // default to this for now.
      if (this.$store.state.schema[`${this.reprotermsUrl}landingPage`]) {
        landingUrl = this.$store.state.schema[`${this.reprotermsUrl}landingPage`][0]['@value'];
      }
      axios.get(landingUrl).then((resp) => {
        this.content = resp.data;
      }).then(() => {
        // HTML injected into a component cannot be styled in the component?
        // https://forum.vuejs.org/t/html-injected-into-a-component-from-a-vuex-store-cannot-be-styled-in-the-component/13691/24
        const rootnode = document.getElementById('smooth-scroller');
        const treeWalker = document.createTreeWalker(rootnode, NodeFilter.SHOW_ELEMENT, null);
        let currentNode = treeWalker.currentNode;
        while (currentNode) {
          currentNode = treeWalker.nextNode();
          if (currentNode) {
            // eslint-disable-next-line no-underscore-dangle
            currentNode.setAttribute(this.$options._scopeId, '');
          }
        }
      });
    },
  },
  created() {
    const url = this.$route.query.url;
    if (url) {
      this.$store.dispatch('getReproTerm', url).then(() => {
        this.$store.dispatch('getBaseSchema', url).then(() => this.getContent());
      });
    } else {
      this.$store.dispatch('getBaseSchema', url).then(() => this.getContent());
    }
  },
};
</script>

<style scoped>
  h1 {
    font-size: 1.2rem;
    margin: 0;
    padding: 0;
    color: #5A478F;
  }
  h2 {
    color: #268762;
    text-align: center;
    margin: 1rem 0 .5rem 0;
  }
  h3 {
    color: #268762;
    margin: 0;
    margin-bottom: .25rem;
  }
  p {
    line-height: 1.5;
    color: #1A1C29;
    margin: 0;
    margin-bottom: 1rem;
  }
  blockquote {
    margin-left: 1rem;
    margin-right: 0;
    font-size: .8rem;
  }
  button {
    border: none;
  }

  section:nth-child(odd) {
    width: 100%;
    background-color: rgba(238, 238, 238, 0.3);
  }
  .container {
    max-width: 30rem;
    margin: 0 auto;
    padding: 1.5rem;
  }
  .image.container {
    max-width: 60rem;
    padding: 1rem 1rem 0 1rem;
    display: flex;
    align-items: center;
  }
  .image.container .image {
    align-self: flex-end;
  }
  .image.container .image img {
    width: 15rem;
  }
  .image.container .text {
    margin-left: 2rem;
  }
  .image.container .text h2 {
    color: #219c6d;
  }
  .image.container .text h3 {
    color: #219c6d;
  }
  .image.container .text p {
    font-size: .9rem;
  }
  img {
    width: 100%;
  }
  .join-button {
    background-color: #F5B33C;
    color: #1A1C29!important;
    border-radius: 100px;
    border: none;
    display: inline-block;
    margin: .2rem 0;
    padding: .4rem 1.6rem;
    text-decoration: none;
    font-weight: bold;
  }
  .grayscale {
    opacity: .4;
  }

  /* Layout of general HTML content */
  ol, ul {
    margin: 0;
    margin-bottom: 1rem;
    padding: 0 0 0 1.3rem;
  }
  table {
    width: 100%;
  }
  td {
    vertical-align: top;
  }
  li {
    margin-top: .75rem;
    margin-bottom: .75rem;
  }
  /* Consent as displayed in a viewer that can be maximized to view. */
  .maximized {
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    z-index: 2;
    background-color: white;
    overflow: hidden;
    -webkit-overflow-scrolling: touch;
  }
  .min-max-control {
    bottom: 0;
    cursor: pointer;
    position: absolute;
    right: 0;
    width: 2rem;
    height: 2rem;
    z-index: 1;
    border-radius: 2px;
  }

  nav.basic {
    color: white;
    background-color: rgba(0,0,0,.1);
    display: flex;
    overflow: hidden;
    justify-content: space-between;
    align-items: center;
    padding-left: 1rem;
    padding-right: 1rem;
  }
  nav.basic > div {
    height: 2.2rem;
    line-height: 2.2rem;
    padding: .25rem 0rem;
  }
  nav.basic a {
    background-color: white;
    padding: .4rem 1rem;
    border-radius: 1rem;
    font-size: .7rem;
  }

  /* DOCKED LAYOUT (header annd footer at top and bottom of viewport,
  center elements each scroll) */
  .docked-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
  }
  .docked-layout > section {
    flex: 1;
    overflow-y: auto;
    position: relative;
  }
  .docked-layout > section.smooth-scroller {
    -webkit-overflow-scrolling: touch;
  }

  @media screen and (max-width: 50em) {
    .image.container {
      flex-direction: column;
      padding-top: 1rem;
    }
    .image.container .image {
      margin: 0 auto;
    }
    .image.container .text {
      margin: 1rem;
    }
  }
  @media screen and (min-width: 40em) {
    html, body {
      font-size: 20px;
    }
  }
</style>
