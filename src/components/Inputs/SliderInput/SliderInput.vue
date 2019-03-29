<template>
  <div class="SliderInput">
    <vue-slider v-model="input" :lazy="true" :data="interval"
                :marks="true" @change="sendData"></vue-slider>
  </div>
</template>

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
