<template>
  <div>
    <MainNav title="Overview" :show-help="true"/>
    <div class="intro">
      <template v-if="currentStep === Store.UNSTARTED">
        <h2>Let’s get started!</h2>
        <p>Now that you’ve learned the basics of mPower, we will provide you with a
          bit more detail so you can decide if mPower is right for you.</p>
        <p>First, let’s see if you’re eligible for the mPower study!</p>
      </template>
      <template v-if="currentStep === Store.ELIGIBILITY_DONE">
        <h2>Welcome to mPower!</h2>
        <p>mPower is a study to track the symptoms of Parkinson’s Disease over time.
          Here you can learn about the study and decide if you want to join! Let’s get started.</p>
      </template>
      <template v-if="currentStep === Store.CONSENT_DONE">
        <h2>Thanks for walking through consent!</h2>
        <p>Next we will ask you 5 questions. They will tell you if we did a good job
          explaining the study.</p>
      </template>
      <template v-if="currentStep === Store.QUIZ_DONE">
        <h2>Great job!</h2>
        <p>You’ve passed the quiz, now let’s review the consent document that you
          looked at one more time before we can register you for the study.</p>
      </template>
      <template v-if="currentStep === Store.SIGN_DONE">
        <h2>Registration</h2>
        <p>Register your phone so you can download and install the app.</p>
      </template>
    </div>
    <router-link to="/study/eligibility" class="step"
      v-bind:class="{ done: currentStep > Store.UNSTARTED,
      current: currentStep === Store.UNSTARTED }">
      <div class="icon eligibility"></div>
      <div class="content">
        <h3>Eligibility</h3>
        <p v-if="currentStep < Store.ELIGIBILITY_DONE">
          Let’s see if you are eligible for the Parkinsons Disease study.<br>2 MINUTES</p>
        <p v-else>Great, you are eligible for the mPower study</p>
      </div>
      <div class="done"></div>
      <div class="lock"></div>
      <div class="start">Start</div>
    </router-link>

    <router-link to="/study/consent" class="step"
      v-bind:class="{ done: currentStep > Store.ELIGIBILITY_DONE,
      current: currentStep === Store.ELIGIBILITY_DONE }">
      <div class="icon consent"></div>
      <div class="content">
        <h3>Consent</h3>
        <p v-if="currentStep < Store.CONSENT_DONE">
          Learn about the study, risks, and benefits of joining.<br>5 MINUTES</p>
        <p v-else>Thanks for walk through the consent</p>
      </div>
      <div class="done"></div>
      <div class="lock"></div>
      <div class="start">Start</div>
    </router-link>

    <router-link to="/study/quiz" class="step"
      v-bind:class="{ done: currentStep > Store.CONSENT_DONE,
      current: currentStep === Store.CONSENT_DONE }">
      <div class="icon quiz"></div>
      <div class="content">
        <h3>Quiz</h3>
        <p v-if="currentStep < Store.QUIZ_DONE">
          Let’s see what you have learned from the consent document.<br>5 MINUTES</p>
        <p v-else>Awesome job</p>
      </div>
      <div class="done"></div>
      <div class="lock"></div>
      <div class="start">Start</div>
    </router-link>

    <router-link to="/study/sign" class="step"
      v-bind:class="{ done: currentStep > Store.QUIZ_DONE,
      current: currentStep === Store.QUIZ_DONE }">
      <div class="icon sign"></div>
      <div class="content">
        <h3>Sign</h3>
        <p v-if="currentStep < Store.SIGN_DONE">Sign the consent document.<br>2 MINUTES</p>
        <p v-else>You have agreed to the study, let’s get started.</p>
      </div>
      <div class="done"></div>
      <div class="lock"></div>
      <div class="start">Start</div>
    </router-link>

    <router-link to="/study/registration" class="step"
      v-if="!isEmbedded" v-bind:class="{ done: currentStep > Store.SIGN_DONE,
      current: currentStep === Store.SIGN_DONE }">
      <div class="icon registration"></div>
      <div class="content">
        <h3>Registration</h3>
        <p>Add your phone number so you can join the study!<br>1 MINUTE</p>
      </div>
      <div class="done"></div>
      <div class="lock"></div>
      <div class="start">Start</div>
    </router-link>
  </div>
</template>

<script>
import MainNav from './MainNav';
import Store from '../../store/store';

export default {
  name: 'StudyOverview',
  components: { MainNav },
  created() {
    if (this.$route.query.start) {
      this.$store.setCurrentStep(Store.UNSTARTED);
    }
    this.currentStep = this.$store.getCurrentStep();
  },
  data() {
    return {
      currentStep: null,
      Store,
    };
  },
  computed: {
    isEmbedded() {
      return !!(window.consentsToResearch || window.location.search === '?embedded');
    },
  },
};
</script>

<style scoped>
.icon {
  width: 8vw; /* height is 0.85222 of width */
  min-width: 3rem;
  align-self: stretch;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center top;
  margin: .6rem .25rem;
}
  .icon.sign {
    margin: .8rem .25rem;
  }
  .eligibility {
    background-image: url(/static/images/Eligibility.svg);
  }
  .consent {
    background-image: url(/static/images/Consent.svg);
  }
  .quiz {
    background-image: url(/static/images/Comprehension.svg);
  }
  .sign {
    background-image: url(/static/images/Sign%20consent.svg);
  }
  .registration {
    background-image: url(/static/images/Register.svg);
  }
.container {
  padding: 0;
  padding-bottom: 3rem;
}
.intro {
  padding: 1rem 1rem 1.5rem 1rem;
  text-align: center;
  max-width: 30rem;
  margin: 0 auto;
}
.intro h2, .into h3, .intro p {
  color: white;
  line-height: 1.3;
}
  .intro h2 {
    font-size: 1.6rem;
  }
  .intro p {
    font-size: .9rem;
  }
.step {
  display: flex;
  align-items: center;
  background-color: white;
  max-width: 30rem;

  border-radius: .75rem;
  padding: .5rem;
  margin: 0 auto 1rem auto;
}
  .step div {
    opacity: .5;
  }
  .step.current div, .step.done div {
    opacity: 1;
  }
.content {
  flex: 1;
  padding: .25rem;
}
  .content h3 {
    font-size: 1rem;
    font-weight: bold;
    margin-bottom: .1rem;
    color: black;
  }
  .content p {
    font-size: .7rem;
    line-height: 1.5;
    margin: 0;
  }
.current {
  background-color: white;
}
  .current h3, .current p {
    color: #1A1C29;
  }
.lock {
  background: transparent url(/static/images/Locked.svg) center no-repeat;
  width: 2.5rem;
  height: 2.5rem;
}
  .current .lock, .done .lock {
    display: none;
  }
.done .done {
  background: transparent url(/static/images/done.svg) center no-repeat;
  background-size: contain;
  width: 1.6rem;
  height: 1.6rem;
}
  .done .lock, .done .start {
    display: none;
  }
.start {
  display: none;
  width: 2.25rem;
}
  .current .start {
    display: block;
  }
@media screen and (max-width: 50em) {
  .intro {
    padding: 0 1rem;
  }
  .step {
    border-radius: 0;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: .25rem;
  }
}
</style>
