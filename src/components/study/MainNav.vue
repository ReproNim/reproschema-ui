<template>
  <nav>
    <div class="left">
      <router-link v-show="backToSign" to="/study/sign">
        <BridgeImage style="width: .5vw" src="/static/images/Back.svg"/>
        {{title}}
      </router-link>
      <router-link v-show="backToOverview" to="/study/overview">
        <BridgeImage style="width: .5vw" src="/static/images/Back.svg"/>
        {{title}}
      </router-link>
      <span v-if="!backToSign && !backToOverview && !showBack">{{title}}</span>
      <a @click="historyBack" v-if="showBack">
        <BridgeImage style="width: .5vw" src="/static/images/Back.svg"/>
        {{title}}
      </a>
    </div>
    <div class="center" v-if="showSteps">
      <span class="eligibility icon" v-bind:class="{ grayscale: currentStep > Store.UNSTARTED }">
      </span>
      <span class="consent icon" v-bind:class="{ grayscale: currentStep > Store.ELIGIBILITY_DONE }">
      </span>
      <span class="quiz icon" v-bind:class="{ grayscale: currentStep > Store.CONSENT_DONE }">
      </span>
      <span class="sign icon" v-bind:class="{ grayscale: currentStep > Store.QUIZ_DONE }">
      </span>
      <span class="registration icon" v-bind:class="{ grayscale: currentStep > Store.SIGN_DONE }">
      </span>
    </div>
    <div class="center" v-else>
    </div>
    <div class="right" v-if="showHelp">
      <router-link to="/study/help" class="full help-link">Need Help?</router-link>
      <router-link to="/study/help" class="short help-link">?</router-link>
    </div>
  </nav>
</template>

<script>
import Store from '../../store/store';

export default {
  name: 'MainNav',
  props: {
    title: {
      type: String,
    },
    showBack: {
      type: Boolean,
      default: false,
    },
    showSteps: {
      type: Boolean,
      default: false,
    },
    showHelp: {
      type: Boolean,
      default: false,
    },
    backToSign: {
      type: Boolean,
      default: false,
    },
    backToOverview: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      currentStep: Store.UNSTARTED,
      Store,
    };
  },
  created() {
    this.currentStep = this.$store.getCurrentStep();
  },
  methods: {
    historyBack() {
      history.back();
    },
  },
};
</script>

<style scoped>
nav {
  background-image: linear-gradient(90deg, #332069 0%, #907FBA 100%);
  background-blend-mode: multiply;
  background-color: rgba(0,0,0,.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  height: 3rem;
}
.left {
  padding: 0 0 0 1rem;
  display: flex;
  align-items: center;
}
.left img {
  width: 1rem!important;
  margin-right: .5rem;
}
.left a {
  color: white;
  display: flex;
  align-items: center;
}
.center {
  display: none;
}
.right {
  display: flex;
  margin: 0.6rem;
}
.icon {
  display: block;
  width: 2.2rem;
  height: 2.2rem;
  margin-left: 1vw;
  border-radius: 50%;
  background-color: white;
  background-repeat: no-repeat;
  background-position: center;
}
  .eligibility {
    background-image: url(/static/images/Eligibility.svg);
    background-size: 55%;
    background-position: center 43%;
  }
  .consent {
    background-image: url(/static/images/Consent.svg);
    background-size: 40%;
  }
  .quiz {
    background-image: url(/static/images/Comprehension.svg);
    background-size: 50%;
  }
  .sign {
    background-image: url(/static/images/Sign%20consent.svg);
    background-size: 55%;
  }
  .registration {
    background-image: url(/static/images/Register.svg);
    background-position: 68% center;
    background-size: 50%;
  }
.help-link {
  color: #3b4a63;
  background-color: white;
  font-size: 0.7rem;
  height: 2.4rem;
  line-height: 2.4rem;
  padding: 0 0.5rem;
}
  .full.help-link {
    border-radius: 1.5rem;
  }
  .short.help-link {
    border-radius: 50%;
    width: 2.4rem;
    text-align: center;
    padding: 0;
    font-weight: bold;
    font-size: 1.1rem;
    display: none;
  }
.grayscale {
  opacity: 0.4;
  filter: gray;
  filter: grayscale(1);
}
@media screen and (max-width: 30em) {
  .center {
    display: none;
  }
  .full.help-link {
    display: none;
  }
  .short.help-link {
    display: block;
  }
  .icon, .help-link {
    display: block;
    width: 1.4rem;
    height: 1.4rem;
    padding: 0;
    border-radius: 50%;
  }
  .short.help-link {
    width: 1.4rem;
    line-height: 1.4rem;
  }
}
@media screen and (min-width: 50em) {
  .center {
    display: flex;
    flex: 1;
    justify-content: flex-end;
    border-right: 1px solid silver;
    padding-right: 0.6rem;
  }
}
</style>
