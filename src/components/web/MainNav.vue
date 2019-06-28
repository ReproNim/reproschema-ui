<template>
  <nav>
    <div class="left">
      <BridgeImage src="/static/images/logo.svg"/>
    </div>
    <div class="center">
      <router-link to="/your-story">Your Story</router-link>
      <router-link to="/about">About</router-link>
      <router-link to="/team">Team</router-link>
    </div>
    <div class="right">
      <router-link class="join-button" to="/study/intro">Join</router-link>
    </div>
  </nav>
</template>

<script>
export default {
  name: "MainNav"
};
</script>

<style scoped>
nav {
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 2px 3px 0 rgba(141, 141, 141, 0.5);
  margin-bottom: 2px;
}
  nav > div {
    padding: 0.3rem;
  }
  .left {
    margin-left: 3vw;
  }
    .left img {
       width: 12vw;
       transform: translateY(2px);
    }
  .center {
    flex: 1;
    white-space: nowrap;
  }
    .center a {
      padding: 0.2rem 1vw;
    }
  .right {
    margin-right: 3vw;
  }
a.router-link-active {
  border-bottom: 5px solid #B2A5D1;
}
@media screen and (max-width: 30em) {
  a.router-link-active {
    transform: translateY(1px);
    border-bottom: 2px solid #B2A5D1;
  }
  nav {
    display: block;
  }
    .left img {
      display: block;
      width: 30vw;
      margin: 0 auto;
    }
  .center {
    display: flex;
    margin-left: 3vw;
    float: left;
    align-items: center;
    height: 10vw;
  }
  .right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 10vw;
  }
}
</style>
