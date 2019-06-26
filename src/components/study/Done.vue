<template>
  <div>
    <nav class="basic">
      <div>Register</div>
			<router-link to="/study/help">Need help?</router-link>
    </nav>
    <div class="container">
			<div class="intro">
        <BridgeImage src="/static/images/Register.svg" style="transform: translateX(17%)"/>
				<h2>Your link is on its way!</h2>

				<p>We sent you a link via a SMS text message to</p>
        <p style="font-size:larger">{{formattedPhone}}<br>
          <router-link style="color:white; font-size:.8rem" to="/study/registration">
            (change mobile number)
          </router-link>
        </p>
				<p>This will expire in 24 hours, so be sure to tap on the link in your messages soon!</p>
			</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Done",
  data() {
    return {
			phone: this.$store.getPhone()
		};
	},
  computed: { 
    formattedPhone() {
      let phone = this.$store.getPhone()
      phone = phone.replace(/^1-/g,'')
      phone = phone.replace(/^\+1/g,'')
      let phone2 = (""+phone).replace(/\D/g, '')
      let m = phone2.match(/^(\d{3})(\d{3})(\d{4})$/)
      let result = (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3]
      return result || phone
    }
  }
};
</script>

<style scoped>
img {
	max-width: 25%; 
	display: block; 
	margin: 1rem auto;
}
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
.back-button {
  margin-top: 5rem;
  text-align: center;
}
  .back-button a {
    border-radius: 6px;
    padding: 1rem 3rem;
  }
</style>
