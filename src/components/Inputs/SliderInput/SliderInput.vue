<template>
  <div class="SliderInput ml-3 mr-3 pl-3 pr-3">
    <vue-slider v-model="input" :lazy="true" :data="interval"
                :marks="getMarks" :process="false"></vue-slider>
    <b-row class="mt-3 pt-3 pl-0 pr-0">
      <div class="col text-left pr-0 pl-0">
        <span v-if="getMinImageLabel">
          <img class="imgLabel" :src="getMinImageLabel" />
        </span>
        <p>{{ getMinLabel }}</p>
      </div>
      <div class="col text-center pr-0 pl-0" v-if="getMidLabel">
        <span v-if="getMidImageLabel">
          <img class="imgLabel" :src="getMidImageLabel" />
        </span>
        <p>{{ getMidLabel }}</p>
      </div>
      <div class="col text-right pr-0 pl-0">
        <span v-if="getMaxImageLabel">
          <img class="imgLabel" :src="getMaxImageLabel" />
        </span>
        <p>{{ getMaxLabel }}</p>
      </div>
    </b-row>
    <b-form @submit="sendData">
      <b-button type="submit">{{ $t('submit-button')}}</b-button>
    </b-form>
  </div>
</template>

<style>
  .imgLabel {
    max-width: 40px;
    max-height: 40px;
  }
</style>

<script>
import _ from 'lodash';
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';

export default {
  name: 'SliderInput',
  props: {
    'constraints': {},
    'init': {},
    'selected_language': {}
  },
  components: {
    VueSlider,
  },
  data() {
    return {
      input: null
    };
  },
  methods: {
    sendData(e) {
      e.preventDefault();
      this.$emit('valueChanged', this.input);
    },
  },
  computed: {
    choices() {
      return this.constraints['http://schema.repronim.org/choices'] || [];
    },

    interval() {
      const minValue = this.constraints['http://schema.org/minValue'];
      const maxValue = this.constraints['http://schema.org/maxValue'];

      if (minValue && maxValue) {
        const min = minValue[0]['@value'];
        const max = maxValue[0]['@value'];
        return Array.from({length: max - min + 1}, (_, i) => min + i);
      }

      return this.choices.map(v => v['http://schema.repronim.org/value'][0]['@value']);
    },

    getMinLabel() {
      if (this.choices.length) {
        const activeLabel = _.find(this.choices[0]['http://schema.org/name'],
          label => label['@language'] === this.selected_language);
        return activeLabel ? activeLabel['@value'] : '';
      }
      return '';
    },

    getMaxLabel() {
      if (this.choices.length) {
        const activeLabel = _.find(this.choices[this.choices.length - 1]['http://schema.org/name'],
          label => label['@language'] === this.selected_language);
        return activeLabel ? activeLabel['@value'] : '';
      }
      return '';
    },

    getMinImageLabel() {
      const vcList = this.choices;
      if (vcList[0]['http://schema.org/image']) {
        return vcList[0]['http://schema.org/image'][0]['@value'];
      }
      return false;
    },

    getMaxImageLabel() {
      const vcList = this.choices;
      const N = vcList.length;
      if (vcList[N - 1]['http://schema.org/image']) {
        return vcList[N - 1]['http://schema.org/image'][0]['@value'];
      }
      return false;
    },

    getMarks() {
      if (this.constraints['http://schema.org/minValue'] &&
          this.constraints['http://schema.org/maxValue']) {
        const min = this.constraints['http://schema.org/minValue'][0]['@value'];
        const max = this.constraints['http://schema.org/maxValue'][0]['@value'];
        const choices = this.choices;

        if (choices) {
          const numChoices = choices.length;
          const step = (max - min) / (numChoices - 1);
          return Array.from({length: numChoices}, (_, i) => min + i * step);
        }
      }
      return true; // fallback to default behavior
    },

    getMidLabel() {
      if (this.choices.length % 2 === 1) { // Check if odd number of choices
        const midIndex = Math.floor(this.choices.length / 2);
        const activeMidLabel = _.find(this.choices[midIndex]['http://schema.org/name'],
          label => label['@language'] === this.selected_language);
        return activeMidLabel ? activeMidLabel['@value'] : '';
      }
      return '';
    },

    getMidImageLabel() {
      if (this.choices.length % 2 === 1) {
        const midIndex = Math.floor(this.choices.length / 2);
        if (this.choices[midIndex]['http://schema.org/image']) {
          return this.choices[midIndex]['http://schema.org/image'][0]['@value'];
        }
      }
      return false;
    },
  },
  mounted() {
    if (this.init) {
      this.input = this.init;

    } else {
      this.input = Math.round(this.interval[this.interval.length - 1]/2); // get the mid value from choices
    }
  },
};
</script>
