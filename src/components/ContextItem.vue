<template>
  <b-card class="text-center question mx-auto" :border-variant="variant">
    <!-- https://codepen.io/vikttor_/pen/jeqoPN?page=1& -->
    <div class="contextItem align-self-center center">
      <transition name="fade" mode="out-in">
        <InputSelector v-if="status === 'ready'"
         :inputType="ui.inputType"
         :title="title"
         :valueConstraints="valueConstraints"
         v-on:skip="sendSkip"
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
import InputSelector from './InputSelector';
import Loader from './Loader';
// import _ from 'lodash';

export default {
  name: 'contextItem',
  props: ['item', 'index'],
  components: {
    InputSelector,
    Loader,
  },
  data() {
    return {
      data: [],
      status: 'loading',
      progress: 0,
      variant: null,
    };
  },
  computed: {
    ui() {
      /* eslint-disable */
      if (this.data._ui) {
        if (this.data._ui.inputType) {
          return this.data._ui;
        }
      }
      return {'inputType': 'N/A'}
      /* eslint-enable */
    },
    title() {
      return this.data.title;
    },
    valueConstraints() {
      /* eslint-disable */
      if (this.data._valueConstraints) {
        return this.data._valueConstraints;
      }
      /* eslint-enable */
      return { requiredValue: false };
    },
  },
  methods: {
    getData() {
      axios.get(this.item[this.item['@type']], {
        onDownloadProgress() {
          // TODO: for some reason pEvent has total defined as 0.
          // so a progress bar won't work here.
        },
      })
        .then((resp) => {
          this.data = resp.data;
          this.status = 'ready';
        });
    },
    sendSkip(doSkip) {
      // send that the component got skipped to the parent
      console.log('sending skip', doSkip);
      if (doSkip) {
        this.variant = 'warning';
      }
      this.$emit('skip');
    },
    sendData(val) {
      this.variant = null;
      this.$emit('setData', val, this.index);
    },
  },
  mounted() {
    this.getData();
  },
};
</script>
