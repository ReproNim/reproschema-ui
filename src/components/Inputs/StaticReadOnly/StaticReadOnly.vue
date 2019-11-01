<template>
  <div class="staticReadOnly">
    <b-btn @click="onSubmit"> {{ input }} </b-btn>
  </div>
</template>

<style>
</style>

<script>
export default {
  name: 'StaticReadOnly',
  props: ['constraints', 'init', 'result', 'selected_language'],
  methods: {
    onSubmit(e) {
      e.preventDefault();
      if (this.result) {
        this.$emit('valueChanged', this.result);
        this.input = 'Success';
      } else this.input = 'Fail';
      // this.$emit('valueChanged', this.input);
    },
  },
  data() {
    return {
      input: 'show result',
    };
  },
  mounted() {
    if (this.init) {
      this.input = this.init;
    }
  },
};
</script>
