<!--<template>-->
<!--<div class="landingPage mt-3 pt-3 text-left">-->
<!--<section class="smooth-scroller" style="padding-top: 0">-->
<!--<section style="height: 30vw; min-height: 15rem;-->
<!--background: linear-gradient(#5A478F, #47337D)">-->
<!--<div style="-->
<!--height: 30vw;-->
<!--min-height: 15rem;-->
<!--background-image: url(/static/images/about%20the%20study.svg);-->
<!--background-position: center;-->
<!--background-size: contain;-->
<!--background-repeat: no-repeat">-->
<!--</div>-->
<!--</section>-->
<!--<br>-->
<!--<section>-->
<!--<div class="container">-->
<!--<vue-markdown v-if="content"> {{content}} </vue-markdown>-->
<!--<Loader v-else/>-->
<!--<p style="margin-top: 2rem">-->
<!--<router-link class="join-button" to="/study/intro">Join</router-link>-->
<!--</p>-->
<!--</div>-->
<!--</section>-->
<!--</section>-->
<!--</div>-->
<!--</template>-->

<!--<style>-->
<!--.landingPage img {-->
<!--max-width: 250px;-->
<!--}-->
<!--</style>-->

<!--<script>-->
<!--import axios from 'axios';-->
<!--import VueMarkdown from 'vue-markdown';-->
<!--import Loader from '../Loader';-->

<!--export default {-->
<!--props: {-->
<!--contentSrc: {-->
<!--type: String,-->
<!--},-->
<!--},-->
<!--components: {-->
<!--VueMarkdown,-->
<!--Loader,-->
<!--},-->
<!--data() {-->
<!--return {-->
<!--content: null,-->
<!--};-->
<!--},-->
<!--mounted() {-->
<!--axios.get(this.contentSrc).then((resp) => {-->
<!--this.content = resp.data;-->
<!--});-->
<!--},-->
<!--};-->
<!--</script>-->

<template>
  <div class="docked-layout">
    <section class="smooth-scroller" style="padding-top: 0">
      <section style="height: 30vw; min-height: 15rem; background: linear-gradient(#268762, #15ac7f)">
        <div style="
          height: 30vw;
          min-height: 15rem;
          background-image: url(/static/images/about%20the%20study.svg);
          background-position: center;
          background-size: contain;
          background-repeat: no-repeat">
        </div>
      </section>
      <br>
      <section>
        <div class="container-fluid">
          <h2>Welcome to Voice Study</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu sagittis leo, sit
            amet consectetur mi. Donec volutpat rutrum massa et luctus. Fusce ac dui quam. Nam a
            nibh porttitor, tincidunt libero id, condimentum velit. Praesent ultricies consectetur
            nulla vel pharetra. Fusce auctor viverra fringilla. Duis euismod enim eu quam tincidunt,
            sed faucibus leo placerat. Pellentesque et justo a orci dictum pulvinar eleifend at
            nisl. Integer eu purus sapien.</p>
        </div>
      </section>

      <section>
        <div class="image container">
          <div class="image">
            <BridgeImage style="margin-bottom: -6px" src="/static/images/about%20the%20study.svg"/>
          </div>
          <div class="text" style="padding-top: 1rem">
            <h3>Understand your PD</h3>
            <p>Although your path is uncertain, seeing patterns over time may lead to a better
              understanding of your PD. Tracking your medication and other factors
              (e.g. stress, exercise) may provide insight into your symptoms and your ability to
              complete activities.  Understanding this may provide insights into your day to day
              health and lifestyle.</p>
          </div>
        </div>
      </section>

      <section>
        <div class="image container">
          <div class="image">
            <BridgeImage style="padding-top: 1.5rem" src="/static/images/tell%20your%20story.svg"/>
          </div>
          <div class="text">
            <h3>Telling your story</h3>
            <p>Through the mPower app, you can tell your story of living with PD. It’s a tool to
              understand your symptoms, factors, and how these relate to your medication. You also
              can see your changes over time on physical and cognitive activities. This can help
              you talk about your story with doctors and caregivers. It is about you and how you
              live with PD.</p>
          </div>
        </div>
      </section>

      <section>
        <div class="image container">
          <div class="image">
            <BridgeImage style="transform: scale(0.7); padding-bottom: 1rem" src="/static/images/create your story.svg"/>
          </div>
          <div class="text">
            <h3>Create your story</h3>
            <p>In just a minute you can see if you are eligible to participate in the voice study.
              Find out now!</p>

            <p style="margin-top: 2rem">
              <router-link class="join-button" to="/study/intro">Join</router-link>
            </p>
            <!--<div class="container">-->
            <!--<vue-markdown v-if="content"> {{content}} </vue-markdown>-->
            <!--<Loader v-else/>-->
            <!--</div>-->
          </div>
        </div>
      </section>
    </section>
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
  mounted() {
    axios.get(this.contentSrc).then((resp) => {
      this.content = resp.data;
    });
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
  .opener {
    background: transparent url(/static/images/Maximize.svg) center center no-repeat;
    background-size: contain;
  }
  .closer {
    background: transparent url(/static/images/Minimize.svg) center center no-repeat;
    background-size: contain;
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
