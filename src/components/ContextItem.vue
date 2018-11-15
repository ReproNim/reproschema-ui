<template>
  <b-card class="text-center question mx-auto" :border-variant="variant">
    <!-- https://codepen.io/vikttor_/pen/jeqoPN?page=1& -->
    <div class="contextItem align-self-center center">
      <transition name="fade" mode="out-in">
        <InputSelector v-if="status === 'ready'"
         :inputType="ui.inputType"
         :title="title"
         :valueConstraints="valueConstraints"
         :init="init"
         v-on:skip="sendSkip"
         v-on:next="sendNext"
         v-on:valueChanged="sendData"
         />
        <div class="loader" v-else>
          <!-- <b-progress :value="50"
          :max="100" animated variant="secondary" class="mb-3 align-middle">
          </b-progress>
          <span class="align-middle mt-3 text-muted">loading</span> -->
          <Loader />
        </div>
      </transition>
    </div>
  </b-card>
</template>

<style scoped>

  .question {
    /* max-width: 500px; */
  }

  .loader {
    padding-top: 75px;
    padding-bottom: 50px;
  }

  /* .card-body {
    min-height: 270px;
    box-sizing: border-box;
    position: relative;
  } */

  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }

  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }

</style>

<script>
import axios from 'axios';
import _ from 'lodash';
import InputSelector from './InputSelector';
import Loader from './Loader';


export default {
  name: 'contextItem',
  props: ['item', 'index', 'init', 'responses', 'score', 'selected_language'],
  components: {
    InputSelector,
    Loader,
  },
  data() {
    return {
      data: [],
      valueC: [],
      status: 'loading',
      progress: 0,
      variant: null,
    };
  },
  computed: {
    ui() {
      /* eslint-disable */
      if (this.data.ui) {
        if (this.data.ui.inputType) {
          return this.data.ui;
        }
      }
      return {'inputType': 'N/A'}
      /* eslint-enable */
    },
    title() {
      // eslint-disable-next-line
      console.log(89, this.selected_language);
      const selectedValues = _.valuesIn(this.responses);
      if (selectedValues.length > 0 && this.index > 0) {
        /* eslint-disable */
        // console.log("this.item: ", this.item);
        const selectedLanguage = selectedValues[0].value;
        // eslint-disable-next-line
        // console.log('selectedLanguage', selectedLanguage);
        // eslint-disable-next-line
        // console.log(this.data.question)
        // eslint-disable-next-line
        const activeQuestion =  _.filter(this.data.question, (q) => {
          return q['@language'] === selectedLanguage;
        });
        // eslint-disable-next-line
        // console.log('activeQuestion', activeQuestion)
        return activeQuestion[0]['@value'];
      }
      // eslint-disable-next-line
      return this.data.question['@value'];
    },
    valueConstraints() {
      // eslint-disable-next-line
      // console.log('inside vc::::', this.data, this.data.valueConstraints);
      if (this.data.valueConstraints) {
          return this.valueC;
      }
      /* eslint-enable */
      return { requiredValue: false };
    },
  },
  methods: {
    getData() {
      // eslint-disable-next-line
      // console.log('inside getData::::', this.data, this.data.valueConstraints);
      axios.get(this.item[this.item['@type']], {
        onDownloadProgress() {
          // TODO: for some reason pEvent has total defined as 0.
          // so a progress bar won't work here.
        },
      })
        .then((resp) => {
          this.data = resp.data;
          // eslint-disable-next-line
          if (Object.keys(this.data.valueConstraints).indexOf('@id') > -1) {
            axios.get(this.data.valueConstraints['@id']).then((rsp) => {
              this.valueC = rsp.data;
            });
          } else {
            this.valueC = this.data.valueConstraints;
          }
          this.status = 'ready';
        });
    },
    sendSkip(doSkip) {
      // send that the component got skipped to the parent
      if (doSkip) {
        this.variant = 'warning';
      }
      this.$emit('skip');
    },
    sendNext() {
      this.$emit('next');
    },
    sendData(val) {
      this.variant = null;
      /* eslint-enable */
      this.$emit('setData', val, this.index);
    },
  },
  mounted() {
    this.getData();
    if (this.init) {
      if (this.init.skipped) {
        this.variant = 'warning';
      }
    }
  },
};
</script>
