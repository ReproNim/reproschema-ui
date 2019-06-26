<template>
  <footer>
    <button @click="exec">{{label}}</button>
  </footer>
</template>

<script>
export default {
  name: "NavFooter",
  props: ['label'],
  methods: {
    exec() {
      this.$emit('click')
    }
  }
};
</script>

<style scoped>
footer {
  background-color: #fafafa;
  box-shadow: 0 -2px 4px 0 rgba(0, 0, 0, 0.12);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: .5rem;
}
button {
  background-color: #F5B33C;
  color: #1A1C29;
  border-radius: 100px;
  border: none;
  display: inline-block;
  margin: .2rem 0;
  padding: .4rem 1.6rem;
  text-decoration: none;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
}
</style>
