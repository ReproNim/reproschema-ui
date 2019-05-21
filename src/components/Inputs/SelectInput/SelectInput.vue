<template>
  <div class="SelectInput">
    <multiselect v-if=" inputType=== 'select' && this.constraints['http://schema.org/itemListElement']"
                 v-model="selected" :options="this.options" :searchable="false"
                 :show-labels="false"
                 placeholder="Pick a value" @input="sendData">
    </multiselect>
    <multiselect v-else v-model="selected" id="ajax"
                 placeholder="Type to search"
                 :options="this.options" :multiple="multipleAllowed"
                 :searchable="true"
                 :internal-search="true" :clear-on-select="false"
                 :close-on-select="true" :options-limit="300"
                 :limit="5" :limit-text="limitText" :max-height="600"
                 :show-no-results="false" :hide-selected="true"
                 @input="sendData">
      <span slot="noResult">Oops! No elements found. Consider changing the search query.</span>
    </multiselect>
    <!-- <multiselect v-else-if="inputType==='selectLanguage'" v-model="selected" label="name"
                 track-by="code" placeholder="Type to search"
                 :options="this.options" :multiple="true"
                 :searchable="true" :loading="isLoading"
                 :internal-search="true" :clear-on-select="false"
                 :close-on-select="false" :options-limit="300"
                 :limit="3" :limit-text="limitText" :max-height="600"
                 :show-no-results="false" :hide-selected="true"
                 @search-change="asyncFindLanguage" @input="sendData">
      <span slot="noResult">Oops! No elements found. Consider changing the search query.</span>
    </multiselect> -->
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
      this.$emit('valueChanged', val);
    },
    limitText(count) {
      return `and ${count} other countries`;
    },
  },
  mounted() {
    if (this.init) {
      this.selected = this.init;
    }
    if (this.constraints['http://schema.org/itemListElement']) { // if choices defined in schema
      this.options = _.map(this.constraints['http://schema.org/itemListElement'][0]['@list'], (v) => {
        const activeValueChoices = _.filter(v['http://schema.org/name'], ac => ac['@language'] === this.selected_language);
        return (activeValueChoices[0]['@value']);
      });
    } else if (this.constraints['https://schema.org/DigitalDocument']) { // if choice list defined in external file
      axios.get(this.constraints['https://schema.org/DigitalDocument'][0]['@id'])
        .then((resp) => {
          if (this.inputType === 'selectCountry') {
            this.options = _.map(resp.data, c => c.country);
          } else if (this.inputType === 'selectState' || this.inputType === 'selectLanguage') {
            this.options = Object.values(resp.data);
          } else this.options = resp.data;
        });
    }
  },
  computed: {
    multipleAllowed() {
      // console.log(93, 'here', this.constraints);
      if (this.constraints['http://schema.repronim.org/multipleChoice']) {
        // console.log(94, this.constraints['http://schema.repronim.org/multipleChoice']);
        return true;
      } return false;
    },
  },
};
</script>

<style>

</style>
