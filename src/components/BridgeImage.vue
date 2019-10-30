<template>
    <img v-on="listeners">
</template>
<script>
export default {
  name: 'BridgeImage',
  computed: {
    listeners() {
      const { error, ...listeners } = this.$listeners;
      return listeners;
    },
  },
  mounted() {
    this.$el.addEventListener('error', () => this.$el.style.display = 'none');
  },
};
</script>
