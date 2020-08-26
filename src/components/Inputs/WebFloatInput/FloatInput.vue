<template>
  <div class="FloatInput">
    <b-form ref="form" @submit="onSubmit" :novalidate="true">
      <b-form-group>
        <b-form-input ref="floatInput" v-model="input"
                      :class="{'is-invalid': !isValidFloat, 'is-valid': isValidFloat}">
        </b-form-input>
        <div class="invalid-feedback">
          Please enter a number
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
  name: 'FloatInput',
  props: ['constraints', 'init'],
  methods: {
    onSubmit(e) {
      e.preventDefault();
      this.$refs.form.className = 'was-validated';
      if (this.isValidFloat) {
        this.$emit('valueChanged', this.input);
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
  },
  computed: {
    isValidFloat() {
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
      this.input = this.init;
    }
  },
};
</script>
