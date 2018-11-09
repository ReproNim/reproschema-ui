<template>
  <svg
    :height="radius * 2"
    :width="radius * 2"
  >
    <!-- https://codepen.io/jeremenichelli/pen/vexMgW -->
    <circle
      stroke="lightgray"
      :stroke-width="stroke"
      fill="transparent"
      :r="normalizedRadius"
      :cx="radius"
      :cy="radius"
    />
    <circle
      :stroke="strokeColor"
      :stroke-dasharray="circumference + ' ' + circumference"
      :style="{ strokeDashoffset: strokeDashoffset }"
      :stroke-width="stroke"
      fill="transparent"
      :r="normalizedRadius"
      :cx="radius"
      :cy="radius"
    />

  </svg>
</template>

<style>
</style>

<script>
export default {
  props: {
    radius: Number,
    progress: Number,
    stroke: Number,
    strokeColor: String,
  },
  data() {
    const normalizedRadius = this.radius - (this.stroke * 2);
    const circumference = normalizedRadius * 2 * Math.PI;
    return {
      normalizedRadius,
      circumference,
    };
  },
  computed: {
    strokeDashoffset() {
      return this.circumference - ((this.progress / 100) * this.circumference);
    },
  },
};
</script>
