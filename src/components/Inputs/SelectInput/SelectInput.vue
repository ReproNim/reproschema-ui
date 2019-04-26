<template>
  <div class="SelectInput">
    <multiselect v-if=" inputType=== 'select' && this.constraints['http://schema.org/itemListElement']"
                 v-model="selected" :options="this.options" :searchable="false"
                 :show-labels="false"
                 placeholder="Pick a value" @input="sendData">
    </multiselect>
    <multiselect v-else-if="inputType==='select'" v-model="selectedCountries" id="ajax" label="name"
                 track-by="code" placeholder="Type to search"
                 :options="this.options"
                 :searchable="true" :loading="isLoading"
                 :internal-search="false" :clear-on-select="false"
                 :close-on-select="false" :options-limit="300"
                 :limit="3" :limit-text="limitText" :max-height="600"
                 :show-no-results="false" :hide-selected="true"
                 @search-change="asyncFindPlace" @input="sendData">
      <span slot="noResult">Oops! No elements found. Consider changing the search query.</span>
    </multiselect>
    <multiselect v-else-if="inputType==='selectLanguage'" v-model="selected" label="name"
                 track-by="code" placeholder="Type to search"
                 :options="this.options" :multiple="true"
                 :searchable="true" :loading="isLoading"
                 :internal-search="false" :clear-on-select="false"
                 :close-on-select="false" :options-limit="300"
                 :limit="3" :limit-text="limitText" :max-height="600"
                 :show-no-results="false" :hide-selected="true"
                 @search-change="asyncFindLanguage" @input="sendData">
      <span slot="noResult">Oops! No elements found. Consider changing the search query.</span>
    </multiselect>
  </div>

</template>

<script>
import _ from 'lodash';
import axios from 'axios';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';

export default {
  name: 'SelectInput',
  props: ['constraints', 'init', 'selected_language', 'inputType'],
  components: {
    Multiselect,
  },
  data() {
    return {
      // The selected value.
      selected: null,
      // Options.
      options: [],
      selectedCountries: [],
      isLoading: false,
    };
  },
  watch: {
    input() {
      // if there is a change, emit it.
      this.$emit('valueChanged', this.selected);
    },

  },
  methods: {
    sendData(val) {
      console.log(47, val, val.name);
      this.$emit('valueChanged', val.name);
    },
    limitText(count) {
      return `and ${count} other countries`;
    },
    asyncFindPlace(query) {
      this.isLoading = true;
      axios.get(`http://api.geonames.org/searchJSON?q=${query}&maxRows=10&username=sanuann`)
        .then((resp) => {
          // this.options = _.map(resp.data.geonames, place => [place.name, place.countryCode]);
          // console.log(30, this.options);
          this.options = resp.data.geonames;
          this.isLoading = false;
        });
    },
    asyncFindLanguage(query) {
      this.isLoading = true;
      axios.get(`http://api.geonames.org/searchJSON?q=${query}&maxRows=10&username=sanuann`) // change this
        .then((resp) => {
          this.options = resp.data.geonames;
          this.isLoading = false;
        });
    },
    clearAll() {
      this.selectedCountries = [];
    },
  },
  mounted() {
    if (this.init) {
      this.selected = this.init;
    }
    if (this.constraints['http://schema.org/itemListElement']) { // if choices defined in schema
      this.options = _.map(this.constraints['http://schema.org/itemListElement'][0]['@list'], (v) => {
        const activeValueChoices = _.filter(v['http://schema.org/name'], ac => ac['@language'] === this.selected_language);
        // console.log(42, activeValueChoices[0]['@value']);
        return (activeValueChoices[0]['@value']);
      });
    }
  },
  computed: {
    optionList() {
      // TODO: else get from api
      if (this.inputType === 'select') {
        return this.asyncFindPlace();
      } else if (this.inputType === 'multiselect') {
        return this.asyncFindLanguage();
      } return ['not implemented yet'];
      // const cityList = this.getCitiesFromApi();
      // console.log(66, cityList);
    },
  },
};
</script>

<style>

</style>
