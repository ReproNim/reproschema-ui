<template>
  <div class="docked-layout">
    <MainNav title="Eligibility" :back-to-overview="true" :show-help="true" :show-steps="true"/>
    <section>
      <form class="container" onsubmit="return false" @keypress="advanceOnTab">
        <h3>Let’s find out if you’re eligible</h3>

        <div class="question" v-if="step >= 1">
          <span>I am </span>
          <mdc-textfield @blur="advanceTo(2)" v-model="age" type="tel" label="Age"/>
          <span>years old</span>
        </div>

        <div class="question" v-if="step >= 2">
          <span>I live </span>
          <div class="mdc-select">
            <select @change="advanceTo(3)" dense v-model="residence" class="mdc-select__surface">
              <option :key="state" v-for="state in states">{{state}}</option>
            </select>
            <div class="mdc-select__bottom-line"></div>
          </div>
        </div>

        <div class="question" v-if="step >= 3">
          <span>I </span>
          <div class="mdc-select">
            <select @change="advanceTo(4)" dense v-model="comfort" class="mdc-select__surface">
              <option>Select</option>
              <option>have an Apple</option>
              <option>have an Android</option>
              <option>do not have a</option>
            </select>
            <div class="mdc-select__bottom-line"></div>
          </div>
          <span>smart phone.</span>
        </div>
      </form>
    </section>
    <Footer v-freeze :step="step" :total-steps="totalSteps" :next-enabled="nextEnabled"
      @back="doBack" @next="doNext" @submit="doSubmit" :do-not-advance-on-submit="true"/>
  </div>
</template>

<script>
import MainNav from './MainNav';
import Footer from './Footer';
import Store from '../../store/store';

const STATES = ['Select', 'in the United States', 'outside of the United States']
const ANDROID_FORM_LINK = 'https://docs.google.com/forms/d/e/1FAIpQLSfq73gWXNqufhDQpkKZv20RjDLAHTQiSmdJVHISVd0Hg-wQ-Q/viewform?usp=sf_link';

export default {
  name: 'StudyEligibility',
  components: { MainNav, Footer },
  data() {
    return {
      step: 1,
      totalSteps: 3,
      residence: 'Select',
      comfort: 'Select',
      states: STATES,
      age: '',
    };
  },
  computed: {
    nextEnabled() {
      const age = parseInt(this.age);
      if (this.step === 1 && age) {
        return true;
      } else if (this.step === 2 && this.residence !== 'Select') {
        return true;
      } else if (this.step >= 3 && this.comfort !== 'Select') {
        return true;
      }
      return false;
    },
  },
  methods: {
    advanceTo(thisStep) {
      if (thisStep > this.step) {
        this.step = thisStep;
      }
    },
    advanceOnTab(event) {
      if (event.keyCode === 13) {
        this.step += 1;
      }
    },
    doBack() {
      this.step -= 1;
    },
    doNext() {
      this.step += 1;
    },
    doSubmit() {
      if (this.comfort === 'have an Android' && window.queryParams.android !== "true") {
        window.location = ANDROID_FORM_LINK;
        return;
      }
      const validResidence = (this.residence === 'in the United States')
      const validComfort = (this.comfort !== 'do not have a')
      const validAge = this.age >= 18;

      if (!validAge || !validResidence || !validComfort) {
        this.$router.push('/study/ineligible');
      } else {
        this.$store.setCurrentStep(Store.ELIGIBILITY_DONE);
        this.$router.push('/study/overview');
      }
    },
  },
};
</script>

<style scoped>
.mdc-textfield-wrapper {
  min-width: 8rem;
}
h3 {
  text-align: center;
  margin-bottom: 2rem;
}
.question {
  display: flex;
  margin-bottom: 1.5rem;
  flex-direction: row;
  align-items: baseline;
  margin-bottom: 1.5rem;
}
  .question > * {
    margin: 0 .25rem;
    white-space: nowrap;
  }
select {
  background-color: transparent;
}
@media screen and (max-width: 50em) {
  .question {
    margin-right: -1rem;
    margin-left: -1rem;
  }
  .mdc-select {
    height: 2rem;
  }
  .mdc-textfield-wrapper {
    height: 3rem;
  }
}
</style>
