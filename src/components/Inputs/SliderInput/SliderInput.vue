<template>
  <div class="SliderInput ml-3 mr-3 pl-3 pr-3">
    <vue-slider v-model="input" :lazy="true" :data="interval"
                :marks="true" @change="sendData"></vue-slider>
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
  watch: {
    input() {
      // if there is a change, emit it.
      this.$emit('valueChanged', this.input);
    },
  },
  methods: {
    sendData(val) {
      this.$emit('valueChanged', val);
    },
  },
  computed: {
    interval() {
      return _.map(this.constraints['http://schema.org/itemListElement'][0]['@list'], (v) => {
        const activeValueChoices = _.filter(v['http://schema.org/name'], ac => ac['@language'] === this.selected_language);
        return activeValueChoices[0]['@value'];
      });
    },
    getMinLabel() {
      const activeMinLabel = _.filter(this.constraints['http://schema.org/minValue'], labels => labels['@language'] === this.selected_language);
      return activeMinLabel[0]['@value'];
    },
    getMaxLabel() {
      const activeMaxLabel = _.filter(this.constraints['http://schema.org/maxValue'], labels => labels['@language'] === this.selected_language);
      return activeMaxLabel[0]['@value'];
    },
    getMinImageLabel() {
      const vcList = this.constraints['http://schema.org/itemListElement'][0]['@list'];
      if (vcList[0]['http://schema.org/image']) {
        return vcList[0]['http://schema.org/image'][0]['@value'];
      }
      return false;
    },
    getMaxImageLabel() {
      const vcList = this.constraints['http://schema.org/itemListElement'][0]['@list'];
      const N = vcList.length;
      if (vcList[N - 1]['http://schema.org/image']) {
        return vcList[N - 1]['http://schema.org/image'][0]['@value'];
      }
      return false;
    },
  },
  data() {
    return {
      input: 0,
    };
  },
  mounted() {
    if (this.init) {
      this.input = this.init;
    }
  },
};
</script>
