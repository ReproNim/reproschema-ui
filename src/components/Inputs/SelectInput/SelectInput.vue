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
      this.options = _.map(this.constraints['http://schema.org/itemListElement'][0]['@list'], (v) => {
        const activeValueChoices = _.filter(v['http://schema.org/name'], ac => ac['@language'] === this.selected_language);
        // console.log(42, activeValueChoices[0]['@value']);
        return (activeValueChoices[0]['@value']);
      });
      // this.options = choiceList;
    } else {
      axios.get('http://api.geonames.org/searchJSON?q=india&maxRows=10&username=sanuann')
        .then((resp) => {
          console.log(28, resp.data.geonames);
          this.options = _.map(resp.data.geonames, place => [place.name, place.countryCode]);
          console.log(30, this.options);
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
      const cityList = this.getCitiesFromApi();
      console.log(66, cityList);
      return this.getCitiesFromApi();
    },
  },
};
</script>

<style>

</style>
