<template>
  <div class="RangeInput">
    <b-form ref="form" @submit="onSubmit" :novalidate="true">
      <b-row>
        <b-col lg="4" class="col-4 col-md-4">
          <b-form-group>
            <b-form-input placeholder="start" ref="rangeInput" v-model="input1"
                          :class="{'is-valid': isValidFloat}">
            </b-form-input>
<!--            <div class="invalid-feedback">-->
<!--              {{ $t('invalid-feedback-number')}}-->
<!--            </div>-->
          </b-form-group>
        </b-col>
        <b-col lg="4" class="col-4 col-md-4">
          <b-form-group>
            <b-form-input placeholder="end" ref="rangeInput" v-model="input2"
                          :class="{'is-valid': isValidFloat}">
            </b-form-input>
<!--            <div class="invalid-feedback">-->
<!--              {{ $t('invalid-feedback-number')}}-->
<!--            </div>-->
          </b-form-group>
        </b-col>
        <b-col lg="4" v-if="hasUnit && Array.isArray(options)">
          <multiselect v-model="input3"
                       :options="this.options" :searchable="false" :show-labels="false"
                       :allowEmpty="false" placeholder="unit">
          </multiselect>
        </b-col>
        <div v-else-if="hasUnit && !Array.isArray(options)">
          <p class="singleUnit"> {{ options }}</p>
        </div>
      </b-row>
      <b-btn type="submit">{{ $t('submit-button')}}</b-btn>
    </b-form>
  </div>
</template>

<style>
  .multiselect__tags {
    padding: 4px 40px 0 15px!important;
    border: 1px solid #ced4da;
    max-height: 38px;
    min-height: 38px;
  }

  .multiselect__placeholder {
    color: #6c757c;
    font-size: 1rem;
  }

  .multiselect__single {
    margin-top: 5px;
  }

  .singleUnit {
    margin-top: 0.5rem;
  }

</style>

<script>
import _ from 'lodash';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';

export default {
  name: 'RangeInput',
  props: ['constraints', 'init'],
  components: {
    Multiselect,
  },
  data() {
    return {
      input1: '',
      input2: '',
      input3: '',
    };
  },
  methods: {
    onSubmit(e) {
      e.preventDefault();
      this.$refs.form.className = 'was-validated';
      if (this.areValidFloats && this.isValidRange) {
        if (this.hasUnit) { // send value + unit
          const name = { value1: this.input1, value2:this.input2, unitCode: this.input3};
          this.$emit('valueChanged', name);
        } else {
          const name = { value1: this.input1, value2:this.input2};
          this.$emit('valueChanged', name);
        }
      }
    },
    isValid() {
      // console.log(this.input, Number.isInteger(this.input));
      const num = parseFloat(this.input);
      if (isNaN(num)) {
        return false;
      }   
      return Number.isFinite(num);
    },
    isValidRange() {
      // console.log(this.input, Number.isInteger(this.input));
      const num1 = parseFloat(this.input1);
      const num2 = parseFloat(this.input2);
      if (num2 > num1) {
        return true;
      } return false;
    },    
    selectedLanguageLabel(unit) {
      const activeUnitOption = _.filter(unit['http://www.w3.org/2004/02/skos/core#prefLabel'], u => u['@language'] === this.selected_language);
      if (!Array.isArray(activeUnitOption) || !activeUnitOption.length) {
        // array does not exist, is not an array, or empty - when selected_language string absent
        return unit['http://www.w3.org/2004/02/skos/core#prefLabel'][0]['@value'];
      } else {
        return activeUnitOption[0]['@value'];
      }
    }
  },
  computed: {
    areValidFloats() {
      if (this.isValid(this.input1) && this.isValid(this.input2)){
        return true;
      } return false;
    },
    hasUnit() {
      if (this.constraints['http://schema.org/unitCode'] || this.constraints["http://schema.repronim.org/unitOptions"]) {
        return true;
      } return false;
    },
    options() {
      if (this.constraints['http://schema.org/unitCode']) {
        if (this.constraints['http://schema.org/unitCode'].length > 1) {
          return _.map(this.constraints['http://schema.org/unitCode'], unit => unit['@value']);
        } else if (this.constraints['http://schema.org/unitCode'].length === 1) {
          return this.constraints['http://schema.org/unitCode'][0]['@value'];
        }
      }
      else if (this.constraints["http://schema.repronim.org/unitOptions"]) {
        if (this.constraints['http://schema.repronim.org/unitOptions'].length > 1) {
          return _.map(this.constraints['http://schema.repronim.org/unitOptions'], unit => {
            return this.selectedLanguageLabel(unit);
          });
        } else if (this.constraints['http://schema.repronim.org/unitOptions'].length === 1) {
          return this.selectedLanguageLabel(this.constraints['http://schema.repronim.org/unitOptions'][0])
        }
      } return ''; // no unit present
    },
  },
  mounted() {
    if (this.init) {
      if (this.hasUnit) {
        this.input1 = this.init.value1;
        this.input2 = this.init.value2;
        this.input3 = this.init.unitCode;
      } else {
        this.input1 = this.init.value1;
        this.input2 = this.init.value2;
      }
    }
  },
};
</script>
