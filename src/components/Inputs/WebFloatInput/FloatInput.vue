<template>
  <div class="FloatInput">
    <b-form ref="form" @submit="onSubmit" :novalidate="true">
      <b-row>
        <b-col lg="4" class="col-4 col-md-4">
          <b-form-group>
            <b-form-input ref="floatInput" v-model="input"
                          :class="{'is-invalid': !isValidFloat, 'is-valid': isValidFloat}">
            </b-form-input>
            <div class="invalid-feedback">
              Please enter a number
            </div>
          </b-form-group>
        </b-col>
        <b-col lg="4" v-if="hasUnit && Array.isArray(options)">
          <multiselect v-model="input2"
                       :options="this.options" :searchable="false" :show-labels="false"
                       :allowEmpty="false" placeholder="unit">
          </multiselect>
        </b-col>
        <div v-else-if="hasUnit && !Array.isArray(options)">
          <p class="singleUnit"> {{ options }}</p>
        </div>
      </b-row>
      <b-btn type="submit">Submit</b-btn>
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
  name: 'FloatInput',
  props: ['constraints', 'init'],
  components: {
    Multiselect,
  },
  data() {
    return {
      input1: '',
      input2: '',
    };
  },
  methods: {
    onSubmit(e) {
      e.preventDefault();
      this.$refs.form.className = 'was-validated';
      if (this.isValidFloat) {
        if (this.hasUnit) { // send value + unit
          const name = { value: this.input1, unitCode: this.input2 };
          this.$emit('valueChanged', name);
        } this.$emit('valueChanged', this.input1);
      }
    },
    isValid() {
      // console.log(this.input, Number.isInteger(this.input));
      const num = parseFloat(this.input1);
      if (isNaN(num)) {
        return false;
      }
      return Number.isFinite(num);
    },
  },
  computed: {
    isValidFloat() {
      return this.isValid(this.input1);
    },
    hasUnit() {
      if (this.constraints['http://schema.org/unitCode']) {
        return true;
      } return false;
    },
    options() {
      if (this.constraints['http://schema.org/unitCode'].length > 1) {
        return _.map(this.constraints['http://schema.org/unitCode'], unit => unit['@value']);
      } else if (this.constraints['http://schema.org/unitCode'].length === 1) {
        return this.constraints['http://schema.org/unitCode'][0]['@value'];
      } return ''; // no unit present
    },
  },
  mounted() {
    if (this.init) {
      if (this.hasUnit) {
        this.input1 = this.init.value;
        this.input2 = this.init.unitCode;
      } else this.input1 = this.init;
    }
  },
};
</script>
