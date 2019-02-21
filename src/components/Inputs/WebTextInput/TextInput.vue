<template>
  <div class="textInput">
    <b-form @submit="onSubmit">
      <b-form-group>
        <b-form-input v-model="input">
        </b-form-input>
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
      this.$emit('valueChanged', this.input);
    },
  },
  data() {
    return {
      input: '',
    };
  },
  mounted() {
    if (this.init) {
      this.input = this.init;
    }
  },
};
</script>
