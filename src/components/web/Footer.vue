<template>
  <footer>
    <div>
      <div>2018 mPower</div>
      <router-link to="/privacy-policy">Privacy Policy</router-link>
      <div>|</div>
      <router-link to="/license">License</router-link>
      <div>|</div>
      <router-link to="/faq">FAQ</router-link>
      <div>|</div>
      <router-link to="/contact">Contact</router-link>
    </div>
    <div>
      mPower is for research use only and does not provide medical advice, diagnosis or treatment.
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
}
</script>

<style scoped>
footer {
  align-items: baseline;
  background-color: #5A478F;
  color: white;
  display: flex;
  flex-wrap: wrap;
  font-size: .6rem;
  justify-content: space-around;
  padding: .25rem .75rem .5rem .75rem;
}
footer > div {
  display: flex;
  align-items: baseline;
  justify-content: space-around;
  text-align: center;
}
a {
  color: white;
}
footer > div:first-child > * {
  padding: .5vw;
  line-height: 1.3;
}
@media screen and (max-width: 50em) {
  footer {
    font-size: 3vw;
  }
}
</style>
