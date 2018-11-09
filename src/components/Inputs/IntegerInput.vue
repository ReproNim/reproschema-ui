<template>
  <div class="IntegerInput">
    <b-form ref="form" @submit="onSubmit" :novalidate="true">
      <b-form-group>
        <b-form-input ref="integerInput" v-model="input"
                      :class="{'is-invalid': !isValidInt, 'is-valid': isValidInt}">
        </b-form-input>
        <div class="invalid-feedback">
          Please enter an integer
        </div>
      </b-form-group>
      <b-btn type="submit">Submit</b-btn>
    </b-form>
  </div>
</template>

<style>
</style>

<script>
// import _ from 'lodash';
// window._ = _;
export default {
  name: 'IntegerInput',
  props: ['constraints', 'init'],
  methods: {
    onSubmit(e) {
      e.preventDefault();
      this.$refs.form.className = 'was-validated';
      if (this.isValidInt) {
        this.$emit('valueChanged', this.input);
      }
    },
    isValid() {
      // console.log(this.input, Number.isInteger(this.input));
      const num = parseFloat(this.input);
      if (isNaN(num)) {
        return false;
      }
      return Number.isInteger(num);
    },
  },
  computed: {
    isValidInt() {
      return this.isValid(this.input);
    },
  },
  data() {
    return {
      input: null,
    };
  },
  mounted() {
    if (this.init) {
      this.input = this.init.value;
    }
  },
};
</script>
