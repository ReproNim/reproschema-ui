
<!--<script>-->
<!--export default {-->
  <!--name: 'Landing',-->
<!--};-->
<!--</script>-->
<template>
  <div class="docked-layout">
    <MainNav/>
    <section class="smooth-scroller" style="padding-top: 0">
      <section style="height: 30vw; min-height: 15rem; background: linear-gradient(#5A478F, #47337D)">
        <div style="
          height: 30vw;
          min-height: 15rem;
          background-image: url(/static/images/about%20the%20study.svg);
          background-position: center;
          background-size: contain;
          background-repeat: no-repeat">
        </div>
      </section>

      <section>
        <div class="container">
          <h2>Welcome to Voice Study</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu sagittis leo,
            sit amet consectetur mi. Donec volutpat rutrum massa et luctus.
            Fusce ac dui quam. Nam a nibh porttitor, tincidunt libero id, condimentum velit.
            Praesent ultricies consectetur nulla vel pharetra. Fusce auctor viverra fringilla.
            Duis euismod enim eu quam tincidunt, sed faucibus leo placerat.
            Pellentesque et justo a orci dictum pulvinar eleifend at nisl. Integer eu purus sapien.</p>
        </div>
      </section>

      <section>
        <div class="image container">
          <div class="image">
            <BridgeImage style="margin-bottom: -6px" src="/static/images/about%20the%20study.svg"/>
          </div>
          <div class="text" style="padding-top: 1rem">
            <h3>Understand your PD</h3>
            <p>Although your path is uncertain, seeing patterns over time may lead to a
              better understanding of your PD. Tracking your medication and other factors
              (e.g. stress, exercise) may provide insight into your symptoms and your
              ability to complete activities.  Understanding this may provide insights into
              your day to day health and lifestyle.</p>
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
            <p>Through the mPower app, you can tell your story of living with PD. It’s a tool
              to understand your symptoms, factors, and how these relate to your medication.
              You also can see your changes over time on physical and cognitive activities.
              This can help you talk about your story with doctors and caregivers. It is about
              you and how you live with PD.</p>
          </div>
        </div>
      </section>

      <section>
        <div class="image container">
          <div class="image">
            <BridgeImage style="transform: scale(0.7); padding-bottom: 1rem"
                         src="/static/images/create your story.svg"/>
          </div>
          <div class="text">
            <h3>Create your story</h3>
            <p>In just a minute you can see if you are eligible to participate in the mPower
              study. Find out now!</p>

            <p style="margin-top: 2rem">
              <router-link class="join-button" to="/study/intro">Join</router-link>
            </p>
          </div>
        </div>
      </section>
      <Footer/>
    </section>
  </div>
</template>

<script>
import MainNav from '../web/MainNav';
import Footer from '../web/Footer';

export default {
  name: 'Landing',
  components: { MainNav, Footer },
};
</script>

<style scoped>
</style>

