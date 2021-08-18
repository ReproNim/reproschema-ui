<template>
  <div class="SliderInput ml-3 mr-3 pl-3 pr-3">
    <vue-slider v-model="input" :lazy="true" :data="interval"
                :marks="true" ></vue-slider>
    <b-row class="mt-3 pt-3 pl-0 pr-0">
      <div class="col text-left pr-0 pl-0">
        <span v-if="getMinImageLabel">
          <img class="imgLabel" :src="getMinImageLabel" />
        </span>
        <p>{{ getMinLabel }}</p>
      </div>
      <div class="col text-right pr-0 pl-0">
        <span v-if="getMinImageLabel">
          <img class="imgLabel" :src="getMaxImageLabel" />
        </span>
        <p>{{ getMaxLabel }}</p>
      </div>
    </b-row>
    <b-form @submit="sendData">
      <b-btn type="submit">{{ $t('submit-button')}}</b-btn>
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
  props: ['constraints', 'init', 'selected_language'],
  components: {
    VueSlider,
  },
  methods: {
    sendData(e) {
      e.preventDefault();
      this.$emit('valueChanged', this.input);
    },
  },
  computed: {
    interval() {
      return _.map(this.constraints['http://schema.repronim.org/choices'], (v) => {
        return v['http://schema.repronim.org/value'][0]['@value'];
      });
    },
    getMinLabel() {
      if (this.constraints['http://schema.repronim.org/choices']) {
        const activeMinLabel = _.filter(this.constraints['http://schema.repronim.org/choices'][0]['http://schema.org/name'], labels => labels['@language'] === this.selected_language);
        return activeMinLabel[0]['@value'];
      } return 'no min label';
    },
    getMaxLabel() {
      if (this.constraints['http://schema.repronim.org/choices']) {
        const choicesLength = (this.constraints['http://schema.repronim.org/choices']).length;
        const activeMaxLabel = _.filter(this.constraints['http://schema.repronim.org/choices'][choicesLength-1]['http://schema.org/name'], labels => labels['@language'] === this.selected_language);
        return activeMaxLabel[0]['@value'];
      } return 'no max label';
    },
    getMinImageLabel() {
      const vcList = this.constraints['http://schema.repronim.org/choices'];
      if (vcList[0]['http://schema.org/image']) {
        return vcList[0]['http://schema.org/image'][0]['@value'];
      }
      return false;
    },
    getMaxImageLabel() {
      const vcList = this.constraints['http://schema.repronim.org/choices'];
      const N = vcList.length;
      if (vcList[N - 1]['http://schema.org/image']) {
        return vcList[N - 1]['http://schema.org/image'][0]['@value'];
      }
      return false;
    },
  },
  data() {
    return {
      input: null,
    };
  },
  mounted() {
    if (this.init) {
      this.input = this.init;
    } else {
      this.input = this.interval[0]; // get the first value from choices
    }
  },
};
</script>
