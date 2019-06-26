<template>
  <div class="docked-layout">
    <MainNav title="Test your knowledge"/>
    <section>
      <div class="container">
        <div class="question" v-show="step === 1">
          <label>Question {{step}}</label>
          <h3>What is the purpose of this study?</h3>

          <RadioButton @change="updateQuizState" name="purpose" value="right">
            Understand the fluctuations of Parkinson’s disease symptoms
          </RadioButton>
          <RadioButton @change="updateQuizState"  name="purpose" value="wrong">
            Give medical advice and diagnose people with Parkinson’s disease
          </RadioButton>
        </div>

        <div class="question" v-show="step === 2">
          <label>Question {{step}}</label>
          <h3>Will my name be stored with my study data?</h3>

          <RadioButton @change="updateQuizState"  name="anon" value="wrong">
            Yes
          </RadioButton>
          <RadioButton @change="updateQuizState"  name="anon" value="right">
            No
          </RadioButton>
        </div>
        
        <div class="question" v-show="step === 3">
          <label>Question {{step}}</label>
          <h3>I decided to share my data broadly with qualified researchers and now I want to stop. What happens to the data I have already shared?</h3>

          <RadioButton @change="updateQuizState"  name="deletable" value="wrong">
            My account and all my data will be deleted
          </RadioButton>
          <RadioButton @change="updateQuizState"  name="deletable" value="right">
            The data I already shared will continue to be used in research
          </RadioButton>
          <RadioButton @change="updateQuizState"  name="deletable" value="wrong">
            My data will be sent to my regular healthcare provider
          </RadioButton>
        </div>

        <div class="question" v-show="step === 4">
          <label>Question {{step}}</label>
          <h3>The survey questions may be stressful for some people.</h3>

          <RadioButton @change="updateQuizState"  name="stressful" value="right">
            Yes
          </RadioButton>
          <RadioButton @change="updateQuizState"  name="stressful" value="wrong">
            No
          </RadioButton>
        </div>

        <div class="question" v-show="step === 5">
          <label>Question {{step}}</label>
          <h3>I can pause / resume participating at any time.</h3>

          <RadioButton @change="updateQuizState"  name="pausable" value="right">
            Yes
          </RadioButton>
          <RadioButton @change="updateQuizState"  name="pausable" value="wrong">
            No
          </RadioButton>
        </div>
      </div>
    </section>
    <Footer :step="step" :total-steps="totalSteps" :next-enabled="nextEnabled"
      v-on:back="doBack" v-on:next="doNext" v-on:submit="doSubmit"/>
  </div>
</template>

<script>
import MainNav from './MainNav.vue'
import Footer from './Footer.vue'
import Store from '../store'
import RadioButton from './RadioButton'

export default {
  name: 'StudyQuiz',
  components: { MainNav, Footer, RadioButton },
  data() {
    return {
      step: 1,
      totalSteps: 5,
      furthestStep: 0,
      answers: {}
    }
  },
  created() {
    this.$store.setCurrentStep(2)
  },
  computed: {
    nextEnabled: function() {
      return this.furthestStep >= this.step
    }
  },
  methods: {
    updateQuizState(name, value) {
      this.answers[name] = value
      this.furthestStep = this.step
    },
    doBack() {
      if (this.step > 1) {
        this.step -= 1
      }
    },
    doNext() {
      if (this.step < this.totalSteps) {
        this.step += 1
      }
    },
    doSubmit() {
      var hasErrors = Object.values(this.answers).some((answer) => answer === 'wrong')
      if (hasErrors) {
        this.$store.setAnswers(this.answers)
        this.$router.push('/study/retake-quiz')
      } else {
        this.$store.setCurrentStep(Store.QUIZ_DONE)
        this.$router.push('/study/overview')
      }
    }
  }
}
</script>

<style scoped>
.question > label {
  color: #6c7a89;
  font-size: .7rem;
}
.question > h3 {
  color: #3b4a63;
}
</style>