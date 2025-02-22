<template>
  <div class="SelectInput">
    <multiselect v-if=" inputType=== 'select' && this.constraints['http://schema.org/itemListElement']"
                 v-model="selected" :options="this.options" :searchable="false"
                 :show-labels="false"
                 placeholder="Pick a value">
    </multiselect>
    <multiselect v-else-if="multipleAllowed" v-model="selected" id="ajax"
                 placeholder="Type to search"
                 :options="this.options" :multiple="true"
                 :searchable="true"
                 :internal-search="true" :clear-on-select="false"
                 :close-on-select="true" :options-limit="300"
                 :limit="5" :limit-text="limitText" :max-height="600"
                 :show-no-results="false" :hide-selected="true">
    </multiselect>
    <multiselect v-else v-model="selected" id="ajax"
                 placeholder="Type to search"
                 :options="this.options"
                 :searchable="true"
                 :internal-search="true" :clear-on-select="false"
                 :close-on-select="true" :options-limit="300"
                 :limit="5" :limit-text="limitText" :max-height="600"
                 :show-no-results="false" :hide-selected="false">
      <span slot="noResult">{{ $t('select-invalid-query')}}</span>
    </multiselect>
    <div v-if="checkOther" id="ifOther" style="display: block;">
      <br>
          <b-form-input v-model="otherInput" placeholder="Please describe">
        </b-form-input>
    </div>
    <br>
      <b-form v-if="this.selected" @submit="checkAndSendData">
        <b-btn type="submit">{{ $t('submit-button')}}</b-btn>
      </b-form>
  </div>
</template>

<script>
import _ from 'lodash';
import axios from 'axios';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';

// const reproterms = 'https://raw.githubusercontent.com/ReproNim/reproschema/master/terms/';

export default {
  name: 'SelectInput',
  props: {
    'reprotermsUrl': {},
    'constraints': {},
    'init': {},
    'selected_language': {},
    'inputType': {}
  },
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
      valueMap: {},
    };
  },
  methods: {
    checkAndSendData() {
      if (this.selected) {
        if (this.selected.includes('Other')) {
          if (!_.isEmpty(this.valueMap)) {
            this.valueMap["Other"] = this.otherInput;
          }
        }
        let out = null;
        if (this.multipleAllowed) {
          if (!_.isEmpty(this.valueMap)) {
            out = _.map(this.selected, v => this.valueMap[v]);
          } else if (this.selected.includes('Other')) {
            out = [...this.selected.slice(0, -1), this.otherInput];
          } else {
            out = [...this.selected]
          }
        } else {
          if (!_.isEmpty(this.valueMap)) {
            out = this.valueMap[this.selected];
          } else if (this.selected === 'Other') {
            out = this.otherInput;
          } else {
            out = this.selected;
          }
        }
        this.$emit('valueChanged', out);
      }
    },
    limitText(count) {
      return `and ${count} other countries`;
    },
  },
  computed: {
    multipleAllowed() {
      if (this.constraints['http://schema.repronim.org/multipleChoice']) {
        // console.log(94, this.constraints[this.reprotermsUrl+'multipleChoice']);
        return this.constraints['http://schema.repronim.org/multipleChoice'][0]['@value'];
      }
      return false;
    },
    checkOther() {
      if (this.selected) {
        if (this.multipleAllowed) {
          return this.selected.includes('Other');
        } else {
          return this.selected === 'Other';
        }
      }
      return false;
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
    if (this.constraints['http://schema.repronim.org/choices'].length > 1) { // if choices defined in schema
      this.options = _.map(this.constraints['http://schema.repronim.org/choices'], (v) => {
        const activeValueChoices = _.filter(v['http://schema.org/name'], ac => ac['@language'] === this.selected_language);
        return (activeValueChoices[0]['@value']);
      });
      this.options.forEach((key, index) => {
        this.valueMap[key] = this.constraints['http://schema.repronim.org/choices'][index]['http://schema.repronim.org/value'][0]['@value'];
      });
    } else if (this.constraints['http://schema.repronim.org/choices'].length === 1) { // choice list defined in external file
      axios.get(this.constraints['http://schema.repronim.org/choices'][0]['@value'])
        .then((resp) => {
          if (this.inputType === 'selectCountry') {
            this.options = _.map(resp.data, c => c.country);
          } else if (this.inputType === 'selectState' || this.inputType === 'selectLanguage') {
            this.options = Object.values(resp.data);
          } else this.options = resp.data;
        });
    }
  },
  watch: {
    input() {
      // if there is a change, emit it.
      this.$emit('valueChanged', this.selected);
    },

  },
};
</script>

<style>

</style>
