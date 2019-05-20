<template>
  <div class="textInput">
    <label> {{ showResult }}</label>
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
  computed: {
    showResult() {
      if (this.result) {
        this.$emit('valueChanged', this.result);
        return 'Success';
      } return 'Fail';
    },
  },
};
</script>
