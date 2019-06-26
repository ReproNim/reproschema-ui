<template>
  <div class="docked-layout">
    <MainNav title="Quiz" :back-to-overview="true" :show-help="true" :show-steps="true"/>
    <section>
      <div class="container">
        <div class="question" v-show="step === 1">
          <label>Question {{step}}</label>
          <h3>What is the purpose of this study?</h3>

          <RadioButton @change="updateQuizState" name="purpose" value="right">
            Understand the changes in Parkinson’s disease symptoms
          </RadioButton>
          <RadioButton @change="updateQuizState"  name="purpose" value="wrong1">
            Give medical and treatment advice to people with Parkinson’s disease
          </RadioButton>
          <RadioButton @change="updateQuizState"  name="purpose" value="wrong2">
            Diagnose people with Parkinson’s disease
          </RadioButton>
        </div>

        <div class="question" v-show="step === 2">
          <label>Question {{step}}</label>
          <h3>What will be used to identify my study data?</h3>

          <RadioButton @change="updateQuizState"  name="anon" value="wrong1">
            My full name
          </RadioButton>
          <RadioButton @change="updateQuizState"  name="anon" value="wrong2">
            My house address
          </RadioButton>
          <RadioButton @change="updateQuizState"  name="anon" value="right">
            My Global Unique Identifier (GUID)
          </RadioButton>
        </div>

        <div class="question" v-show="step === 3">
          <label>Question {{step}}</label>
          <h3>I decided to share my data broadly with qualified researchers and now I want to stop.
            What happens to the data I have already shared?</h3>

          <RadioButton @change="updateQuizState"  name="deletable" value="wrong1">
            My account and all my data will be deleted
          </RadioButton>
          <RadioButton @change="updateQuizState"  name="deletable" value="right">
            The data I already shared will continue to be used in research
          </RadioButton>
          <RadioButton @change="updateQuizState"  name="deletable" value="wrong2">
            My data will be sent to my regular healthcare provider
          </RadioButton>
        </div>

        <div class="question" v-show="step === 4">
          <label>Question {{step}}</label>
          <h3>Are there risks of participating in this study?</h3>

          <RadioButton @change="updateQuizState"  name="stressful" value="wrong1">
            There is no risk of participating in this research study
          </RadioButton>
          <RadioButton @change="updateQuizState"  name="stressful" value="wrong2">
            There is a risk that my regular doctor won’t be allowed to care for me any longer
          </RadioButton>
          <RadioButton @change="updateQuizState"  name="stressful" value="right">
            Some activities may be tiring and seeing my data may be stressful
          </RadioButton>
        </div>

        <div class="question" v-show="step === 5">
          <label>Question {{step}}</label>
          <h3>With the mPower app I will be able to:</h3>

          <RadioButton @change="updateQuizState"  name="pausable" value="right">
            Track my symptoms and triggers
          </RadioButton>
          <RadioButton @change="updateQuizState"  name="pausable" value="wrong1">
            Schedule an appointment with my regular doctor
          </RadioButton>
          <RadioButton @change="updateQuizState"  name="pausable" value="wrong2">
            Join a support group for people living with Parkinson's disease
          </RadioButton>
        </div>
      </div>
    </section>
    <Footer :step="step" :total-steps="totalSteps" :next-enabled="nextEnabled"
      v-on:back="doBack" v-on:next="doNext" v-on:submit="doSubmit"/>
  </div>
</template>

<script>
import MainNav from './MainNav';
import Footer from './Footer';
import Store from '../../store/store';
import RadioButton from './RadioButton';

export default {
  name: 'StudyQuiz',
  components: { MainNav, Footer, RadioButton },
  data() {
    return {
      step: 1,
      totalSteps: 5,
      furthestStep: 0,
      answers: {},
    };
  },
  created() {
    this.$store.setCurrentStep(2);
  },
  computed: {
    nextEnabled() {
      return this.furthestStep >= this.step;
    },
  },
  methods: {
    updateQuizState(name, value) {
      ga('send', 'event', 'Quiz', name, value);
      this.answers[name] = value;
      this.furthestStep = this.step;
    },
    doBack() {
      if (this.step > 1) {
        this.step -= 1;
      }
    },
    doNext() {
      if (this.step < this.totalSteps) {
        this.step += 1;
      }
    },
    doSubmit() {
      const hasErrors = Object.values(this.answers).some(answer => answer !== 'right');
      if (hasErrors) {
        ga('send', 'event', 'Quiz', 'finished', 'failure');
        this.$store.setAnswers(this.answers);
        this.$router.push('/study/retake-quiz');
      } else {
        ga('send', 'event', 'Quiz', 'finished', 'success');
        this.$store.setCurrentStep(Store.QUIZ_DONE);
        this.$router.push('/study/overview');
      }
    },
  },
};
</script>

<style scoped>
section {
  padding-top: 0;
}
.container {
  padding: 0;
  max-width: 30rem;
}
.question {
  padding: 1.5rem 1.5rem .5rem 1.5rem;
}
.question > label {
  color: #6c7a89;
  font-size: .7rem;
  margin-bottom: 1rem;
  display: block;
}
.question > h3 {
  color: #3b4a63;
  margin-bottom: 1rem;
}
.radio-holder {
  display: block;
}
.success, .failure {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
}
  .success h4, .failure h4 {
    font-size: 1.2rem;
    margin: .5rem 0;
  }
  .success div, .failure div {
    max-width: 30rem;
    margin: 0 auto;
    padding: 0rem 1.5rem;
  }
  .success p, .failure p {
    line-height: 1.1;
  }
  .success {
    background-color: #f0faf6;
  }
    .success h4 {
      color: #63D49E;
    }
    .success button {
       font-size: 1.3rem;
       background-color: #5A478F;
       color: white;
       border-radius: 100px;
       padding: .25rem 2rem;
       margin-top: -1rem;
       margin-bottom: 1rem;
       font-weight: bold;
    }
  .failure {
    background-color: #fef0f1;
  }
    .failure h4 {
      color: #EE6070;
    }
</style>
