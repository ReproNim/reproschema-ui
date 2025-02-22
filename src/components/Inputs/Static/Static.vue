<template>
  <div class="static">
  </div>
</template>

<style>
</style>

<script>
export default {
  name: 'Static',
  props: {
    'constraints': {},
    'init': {},
    'result': {},
    'selected_language': {}
  },
  data() {
    return {
      input: 'show result',
    };
  },
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
  mounted() {
    if (this.init) {
      this.input = this.init;
    }
  },
};
</script>
