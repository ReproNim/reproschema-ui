<template>
  <div class="SelectInput">
    <b-form-select v-model="selected" :options="optionList" @change="sendData"></b-form-select>
  </div>

</template>

<script>
import _ from 'lodash';

export default {
  name: 'SelectInput',
  props: ['constraints', 'init', 'selected_language'],
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
  data() {
    return {
      // The selected value.
      selected: null,
      // Options.
      options: [],
    };
  },
  mounted() {
    if (this.init) {
      this.selected = this.init;
    }
  },
  computed: {
    optionList() {
      if (this.constraints['http://schema.org/itemListElement']) { // defined in schema
        return _.map(this.constraints['http://schema.org/itemListElement'][0]['@list'], (v) => {
          const activeValueChoices = _.filter(v['http://schema.org/name'], ac => ac['@language'] === this.selected_language);
          return activeValueChoices[0]['@value'];
        });
      }
      // TODO: else get from api
      return this.options;
    },
  },
};
</script>

<style>

</style>
