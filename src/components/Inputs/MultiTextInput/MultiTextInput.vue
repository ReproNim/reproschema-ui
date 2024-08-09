<template>
  <div class="textInput">
    <b-form @submit="onSubmit">
      <b-row>
        <b-col lg="4">
          <b-input-group>
            <b-form-input placeholder="first name" v-model="input1" required></b-form-input>
          </b-input-group>
        </b-col>

        <b-col lg="4">
          <b-input-group>
            <b-form-input placeholder="middle name" v-model="input2"></b-form-input>
          </b-input-group>
        </b-col>
        <b-col lg="4">
          <b-input-group>
            <b-form-input placeholder="family name" v-model="input3" required></b-form-input>
          </b-input-group>
        </b-col>
      </b-row>
      <br>
      <b-btn type="submit">{{ $t('submit-button')}}</b-btn>
    </b-form>
  </div>
</template>

<style>
</style>

<script>
export default {
  name: 'TextInput',
  props: ['constraints', 'init'],
  methods: {
    onSubmit(e) {
      e.preventDefault();
      const name = { "schema:givenName": this.input1,
        "schema:additionalName": this.input2,
        "schema:familyName": this.input3,
        "@type": "schema:Person" };
      this.$emit('valueChanged', name);
    },
  },
  data() {
    return {
      input1: '',
      input2: '',
      input3: '',
    };
  },
  mounted() {
    if (this.init) {
      this.input1 = this.init.first_name;
      this.input2 = this.init.middle_name;
      this.input3 = this.init.last_name;
    }
  },
};
</script>
