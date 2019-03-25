<template>
  <div class="SliderInput">
    <vue-slider v-model="input" :lazy="true" :data="interval"
                :marks="true"></vue-slider>
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

      // make sure you validate the date based on this.constraints.
    },
  },
  methods: {
    sendData(val) {
      this.$emit('valueChanged', val);
    },
  },
  computed: {
    interval() {
      console.log(this.constraints['http://schema.org/itemListElement'][0]['@list']);
      console.log(this.selected_language);
      return _.map(this.constraints['http://schema.org/itemListElement'][0]['@list'], (v) => {
        const activeValueChoices = _.filter(v['http://schema.org/name'], ac => ac['@language'] === this.selected_language);
        // console.log(37, activeValueChoices[0]['@value']);
        return activeValueChoices[0]['@value'];
      });
      // return ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    },
  },
  data() {
    return {
      // a proxy. It should initialize to this.init. when its changed,
      // we should tell the parent that its changed, with then changes this.input
      input: 0,
      // data: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    };
  },
  mounted() {
    if (this.init) {
      this.input = this.init;
    }
  },
};
</script>
