<template>
  <div class="mt-3 mb-3 h-100">
    <div class="mb-3 pt-3">
      <h1>Welcome to Voice Study</h1>
      <p class="lead">
        <!-- Mindlogger is an online data collection platform for scientific research. -->
        Participate in scientific research studies online!
      </p>
      <div>
        <p class="mt-3">
          To get started click Join
        </p>
        <p style="margin-top: 2rem">
          <router-link class="join-button" to="/study/intro">Join</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style></style>

<script>
export default {
  name: 'Landing',
};
</script>
