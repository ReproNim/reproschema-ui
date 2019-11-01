<template>
  <div class="docked-layout">
    <section>
      <div class="container">
        <div class="screen" v-show="step === 1">
          <div class="panel">
            <BridgeImage src="/static/images/about%20the%20study.svg"/>

            <h3>About the study</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu sagittis leo,
              sit amet consectetur mi. Donec volutpat rutrum massa et luctus.
              Fusce ac dui quam. Nam a nibh porttitor, tincidunt libero id, condimentum velit.
              Praesent ultricies consectetur nulla vel pharetra.
            </p>
          </div>
        </div>
        <div class="screen" v-show="step === 2">
          <div class="panel">
            <BridgeImage src="/static/images/procedures%20activities.svg"/>
            <h3>How does the study work?</h3>
            <p>
              1. Answer questions to determine if you are eligible for this study <br>
              2. Complete the informed consent process & download the app<br>
              3. Complete a one-time health survey<br>
              4. Complete short physical and cognitive activities <br>
              5. Track your symptoms, triggers, and medications
            </p>
          </div>
        </div>
        <div class="screen" v-show="step === 3">
          <div class="panel">
            <BridgeImage src="/static/images/how%20long%20does%20it%20last.svg"/>
            <h3>How long does it last?</h3>
            <p>We will ask you to participate for 2 weeks every three months.
              We would like you to participate for 2 years, but you can participate
              as long as you like.</p>
          </div>
        </div>
        <div class="screen" v-show="step === 4">
          <div class="panel">
            <BridgeImage src="/static/images/benefits%20and%20risks.svg"/>
            <h3>What are the benefits and risks?</h3>
            <p>You may not directly benefit from taking part but seeing trends in your data
              may be interesting to you. You may help researchers better understand PD.</p>

            <p>The main risk is to your privacy by an accidental release of your data. You
              may find some of the activities tiring and seeing your data may be stressful.</p>
          </div>
        </div>
      </div>
    </section>
    <div class="buttons">
      <button @click="doBack" :disabled="this.step === 1">Back</button>
      <button @click="doNext">{{nextName}}</button>
    </div>
  </div>
</template>

<script>

export default {
  name: 'StudyIntroduction',
  data() {
    return {
      step: 1,
      totalSteps: 4,
    };
  },
  computed: {
    nextName() {
      return (this.step === this.totalSteps) ? 'Start' : 'Next';
    },
    appletURL() {
      return 'https://raw.githubusercontent.com/ReproNim/reproschema/master/activity-sets/VoicePilot/VoicePilot_schema';
    },
    redirect() {
      return { name: 'Applet', params: { appletId: this.appletURL }, query: { ...this.query, consent: true } };
    },
  },
  methods: {
    doBack() {
      if (this.step > 1) {
        this.step -= 1;
      }
    },
    doNext() {
      if (this.step < this.totalSteps) {
        this.step += 1;
      } else if (this.step === this.totalSteps) {
        this.$router.push('/activities/0');
      }
    },
    learnMore() {
      this.$refs.consentViewer.toggleMax();
    },
  },
};
</script>

<style scoped>
  section {
    padding-top: 0;
  }
  .container {
    max-width: 30rem;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  .screen {
    margin: 0 auto;
    text-align: center;
  }
  .panel {
    overflow-y: auto;
  }
  .consent-viewer {
    width: 0px;
    height: 0px!important;
  }
  .root {
    max-width: 40rem;
    margin: 0 auto;
  }
  h3 {
    font-size: 3.2vh;
    font-weight: bold;
  }
  p, a {
    font-size: calc(2vh*1.4);
  }
  h3 {
    margin: 0 0 .5rem 0;
  }

  p {
    text-align: center;
  }
  img {
    height: 36vh;
    display: block;
    margin: 1rem auto;
  }
  .buttons {
    margin: 1rem auto 5vh auto;
    text-align: center;
  }
  .buttons button {
    font-size: 1rem;
    background-color: white;
    padding: .75rem 2rem;
    border-radius: 100px;
    cursor: pointer;
    font-weight: bold;
  }
  .buttons button + button {
    margin-left: 1rem;
  }
  button[disabled] {
    opacity: .5;
  }
  @media screen and (max-width: 50em) {
    h3, p {
      line-height: 1.1;
    }
  }
</style>
