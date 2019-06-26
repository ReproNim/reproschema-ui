<template>
  <div>
    <MainNav title="Install The App" :back-to-overview="true" :show-help="true" :show-steps="true"/>
    <div class="container">
      <p>Thank you! Please enter your mobile phone number <!--and select your phone type--> to receive your download link for the mPower app:</p>

      <p style="text-align: center; margin-top: 2rem">
        <mdc-textfield ref="phoneField" v-model="phone" label="Enter phone number" type="tel" pattern="[0-9]*"/>
      </p>
      <p v-if="showAndroid" style="text-align: center; margin-top: 3rem">Pick one depending on your mobile phone:</p>
      <div class="buttons">
        <a @click="apple">
          <BridgeImage src="/static/images/App_Store_Badge.svg" :style="{opacity: hasNumber}"/>
        </a>
        <a @click="google" v-if="showAndroid">
          <BridgeImage src="/static/images/Android_Google_Play.svg" :style="{opacity: hasNumber}"/>
        </a>
      </div>
    </div>
    <mdc-snackbar ref="snackbar"/>
  </div>
</template>

<script>
import MainNav from './MainNav.vue'
import store from '../store'
import axios from 'axios';

export default {
  name: 'StudyRegistration',
  components: { MainNav },
  data() {
    return {
      phone: '',
      showAndroid: window.queryParams.android === "true"
    }
  },
  mounted() {
    var input = this.$refs.phoneField.$refs.input
    input.type = "tel"
    input.pattern = "[0-9]*"
  },
  computed: {
    hasNumber: function() {
      return this.phone.replace(/\D/g,'').length >= 10 ? 1 : .5
    }
  },
  methods: {
    apple: function(event) {
      if (this.hasNumber === 1) {
        event.target.style.opacity = .6;
        this.post('iPhone OS')
      }
    },
    google: function(event) {
      if (this.hasNumber === 1) {
        event.target.style.opacity = .6;
        this.post('Android')
      }
    },
    post: function(osName) {
      var snackbar = this.$refs.snackbar
      var phoneFormatted = this.phone.replace(/[^\d]/g,'')

      this.$store.setPhone(this.phone)
      axios.post('https://webservices.sagebridge.org/v3/itp', {
        studyId: 'sage-mpower-2',
        phone: {number: phoneFormatted, regionCode: 'US'},
        subpopGuid: 'sage-mpower-2',
        osName: osName,
        consentSignature: {
          name: this.$store.getName(),
          scope: this.$store.getSharingScope()
        }
      }).then(() => {
        this.$router.push("/study/done")
      }).catch(function(error) {
        if (error.response && error.response.data && error.response.data.message) {
          snackbar.show(error.response.data)
        } else {
          snackbar.show(error)
        }
      })
    }
  }
}
</script>

<style scoped>
.container {
  padding-top: 5rem;
}
.buttons {
  margin-top: 1rem;
  display: flex;
  justify-content: space-around;
}
.buttons img {
  width: calc(6rem + 2vw);
  cursor: pointer;
}
</style>
