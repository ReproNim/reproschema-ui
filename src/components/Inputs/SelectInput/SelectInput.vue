<template>
  <div class="SelectInput">
    <b-form-select v-model="selected" :options="options" @change="sendData"></b-form-select>
  </div>

</template>

<script>
import _ from 'lodash';
import axios from 'axios';

export default {
  name: 'SelectInput',
  props: ['constraints', 'init', 'selected_language', 'inputType'],
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
    if (this.constraints['http://schema.org/itemListElement']) { // defined in schema
      return _.map(this.constraints['http://schema.org/itemListElement'][0]['@list'], (v) => {
        const activeValueChoices = _.filter(v['http://schema.org/name'], ac => ac['@language'] === this.selected_language);
        this.options = activeValueChoices[0]['@value'];
      });
    }
    if (this.inputType === 'select') {
      axios.get('http://api.geonames.org/searchJSON?q=kochi&maxRows=10&username=sanuann')
        .then((resp) => {
          // console.log(28, resp.data.geonames);
          this.options = _.map(resp.data.geonames, cities => [cities.name, cities.countryCode]);
          // console.log(30, this.options);
          // return this.options;
        });
      // return this.options; // temporary
    }
    return this.options;
  },
  computed: {
    optionList() {
      // TODO: else get from api
      /* if (inputType === 'select') {
        return this.getCitiesFromApi();
      }
      else if (inputType === 'states') {
        return this.getStateList();
      }
      else if (inputType === language) {
        return this.getLanguageList();
      }
      else
        return ['not implemented yet'];
       */
      // const cityList = this.getCitiesFromApi();
      return this.getCitiesFromApi();
    },
  },
};
</script>

<style>

</style>
