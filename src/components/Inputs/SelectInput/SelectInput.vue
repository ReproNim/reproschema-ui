<template>
  <div class="SelectInput">
    <multiselect v-if=" inputType=== 'select' && this.constraints['http://schema.org/itemListElement']"
                 v-model="selected" :options="this.options" :searchable="false"
                 :show-labels="false"
                 placeholder="Pick a value" @input="checkNotOtherAndSendData">
    </multiselect>
    <multiselect v-else v-model="selected" id="ajax"
                 placeholder="Type to search"
                 :options="this.options" :multiple="multipleAllowed"
                 :searchable="true"
                 :internal-search="true" :clear-on-select="false"
                 :close-on-select="true" :options-limit="300"
                 :limit="5" :limit-text="limitText" :max-height="600"
                 :show-no-results="false" :hide-selected="true"
                 @input="checkNotOtherAndSendData">
      <span slot="noResult">Oops! No elements found. Consider changing the search query.</span>
    </multiselect>
    <div v-if="checkOther" id="ifOther" style="display: block;">
      <br><b-form-input v-model="otherInput" placeholder="Please describe" @change="sendData">
    </b-form-input>
    </div>
  </div>

</template>

<script>
import _ from 'lodash';
import axios from 'axios';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';
const reproterms = 'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/terms/'

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
      otherInput: '',
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
    checkNotOtherAndSendData(val) {
      if (val !== 'Other') {
        this.$emit('valueChanged', val);
      }
    },
    sendData(val) {
      this.$emit('valueChanged', [this.selected, val]);
    },
    limitText(count) {
      return `and ${count} other countries`;
    },
  },
  mounted() {
    if (this.init) {
      // console.log(74, this.init);
      if (Array.isArray(this.init)) {
        this.selected = this.init[0];
        this.otherInput = this.init[1];
      } else this.selected = this.init;
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
      if (this.constraints[reproterms+'multipleChoice']) {
        // console.log(94, this.constraints[reproterms+'multipleChoice']);
        return true;
      } return false;
    },
    checkOther() {
      if (this.selected === 'Other') {
        return true;
      }
      return false;
    },
  },
};
</script>

<style>

</style>
