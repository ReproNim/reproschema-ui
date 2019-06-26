<template>
  <div>
    <nav class="basic">
      <div>Eligibility</div>
      <router-link to="/study/help">Need help?</router-link>
    </nav>    
    <div class="container">
      <div class="intro">
        <h2>Sorry, you are not eligible</h2>
        <p>You must be at least 18, live in the US, and be comfortable using a smartphone to participate. </p>
        <!--<p>You can still help by telling others about the study</p>-->
      </div>

      <div class="back-button">
        <router-link to="/">Go back</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import MainNav from "./MainNav.vue";

export default {
  name: "StudyOverview",
  components: { MainNav }
};
</script>

<style scoped>
.intro {
  padding: 0 0 1.5rem 0;
}
.intro h2,
.into h3,
.intro p {
  color: white;
  line-height: 1.3;
}
.intro h2 {
  font-size: 1.3rem;
}
.intro p {
  font-size: 0.9rem;
  text-align: center;
}
.share-icons {
  margin: 0 15%;
  display: flex;
  justify-content: space-around;
}
  .share-icons img {
    width: 11vw;
    height: 11vw;
    max-width: 68px;
    max-height: 68px;
  }
  .share-icons img {
    filter: brightness(97%);
  }
  .share-icons a:hover img, .share-icons a:active img {
    filter: brightness(103%);
  }
.back-button {
  margin-top: 3rem;
  margin-bottom: 3.5rem;
  text-align: center;
  font-weight: bold;
}
  .back-button a {
    background-color: white;
    border-radius: 6px;
    padding: 1rem 3rem;
  }
</style>
