<template>
  <div class="textInput">
    <b-form @submit="onSubmit">
      <b-form-group>
        <b-form-input v-model="input1"></b-form-input>
        <b-form-input v-model="input2"></b-form-input>
        <b-form-input v-model="input3"></b-form-input>
      </b-form-group>
      <b-btn type="submit">Submit</b-btn>
    </b-form>
  </div>
</template>

<style>
</style>

<script>
export default {
  name: 'TextInput',
  props: ['constraints', 'init'],
  methods: {
    onSubmit(e) {
      e.preventDefault();
      console.log(24, [this.input1, this.input2, this.input3]);
      this.$emit('valueChanged', [this.input1, this.input2, this.input3]);
    },
  },
  data() {
    return {
      input1: '',
      input2: '',
      input3: '',
    };
  },
  mounted() {
    if (this.init) {
      this.input1 = this.init;
      this.input2 = this.init;
      this.input3 = this.init;
    }
  },
};
</script>
