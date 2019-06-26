<template>
  <div class="docked-layout">
    <MainNav title="Retake Quiz" :show-help="true"/>
    <section>
      <div class="container" style="padding-bottom: 0">
        <div class="preamble">
          <BridgeImage src="/static/images/warning-icon.png"/>
          <h2>You’re almost there!</h2>
          <p>You answered one or more questions incorrectly. We want to make sure that you understand what this study is about and what is involved before you proceed. Please review the sections again. </p>
        </div>
      </div>
      <div class="container" style="padding:0">
        <div class="questions">
          <div class="question" :class="{error: isError('purpose')}">
            <label>Question 1</label>
            <p>What is the purpose of this study?</p>
          </div>
          <div class="question" :class="{error: isError('anon')}">
            <label>Question 2</label>
            <p>Will my name be stored with my study data?</p>
          </div>
          <div class="question" :class="{error: isError('deletable')}">
            <label>Question 3</label>
            <p>If I decide to share my data with qualified researchers and then I change my mind, can my data be deleted from their studies?</p>
          </div>
          <div class="question" :class="{error: isError('stressful')}">
            <label>Question 4</label>
            <p>For some people, seeing their data may be stressful.</p>
          </div>
          <div class="question" :class="{error: isError('pausable')}">
            <label>Question 5</label>
            <p>With the mPower app I will be able to&hellip;</p>
          </div>
        </div>
      </div>
    </section>
    <NavFooter label="Review consent" @click="navigate"></NavFooter>
  </div>
</template>

<script>
import MainNav from './MainNav.vue'
import NavFooter from './NavFooter.vue'
import Store from '../store'

export default {
  name: 'StudyRetakeQuiz',
  components: { MainNav, NavFooter },
  created() {
    // due to failure, we're back to consent. When they are done reviewing, 
    // then we advance them to consent being done again.
    this.$store.setCurrentStep(Store.ELIGIBILITY_DONE)
  },
  methods: {
    isError: function(tag) {
      return this.$store.getAnswers()[tag] !== 'right'
    },
    navigate() {
      this.$router.push('/study/consent')
    }
  }
}
</script>

<style scoped>
nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  color: white;
}
.title {
  flex: 1;
  align-self: center;
  line-height: 1.1;
  margin: .6rem;
}
.nav-right {
  display: flex;
  margin: .6rem;
}
.help-link {
  color: #3b4a63; 
  background-color: white; 
  font-size: .7rem;
  height: 2.2rem;
  line-height: 2.2rem;
  padding: 0 .5rem;
  border-radius: 1.5rem;
}
.preamble img {
  width: 8rem;
  height: 8rem;
  display: block;
  margin: 0 auto;
}
.preamble p, .preamble h2 {
  color: white;
}
  .preamble h2 {
    margin-top: 0;
    font-size: 1.6rem;
  }
  .preamble p {
    font-size: .8rem;
  }
.questions {
  background-color: white;
  max-width: 30rem;
  padding: .5rem 2rem;
}
label {
  font-size: .7rem;
  color: #6c7a89;
  display: block;
  margin-bottom: .25rem;
}
.question p {
  margin: 0;
  font-size: .9rem;
  line-height: 1.2;
  color: #3b4a63;
}
.question div {
  text-align: right;
  display: none;
}
.question.error div {
  display: block;
}
.question a {
  text-decoration: underline;
  font-size: .8rem;
}
.question {
  border-bottom: 1px solid rgba(0, 0, 0, 0.24);
  padding: .5rem;
  background: transparent url(/static/images/Check-Mark.svg) left center;
  background-repeat: no-repeat;
  background-size: 1.5rem 1.5rem;
  padding-left: 3rem;
}
.error {
  background: transparent url(/static/images/Wrong-Icon.svg) left center;
  background-repeat: no-repeat;
  background-size: 1.5rem 1.5rem;
  padding-left: 3rem;
}
.error label, .error p {
  color: #ff8a80;
}
.question:last-child {
  padding-bottom: .5rem;
  border-bottom: none;
}
</style>
