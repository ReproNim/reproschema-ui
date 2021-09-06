<template>
  <div class="textArea">
    <b-form ref="form" @submit="onSubmit">
      <b-row class="mt-2">
        <b-col>
          <b-form-textarea
                  id="textarea-default"
                  rows="10"
                  v-model="input1"
          ></b-form-textarea>
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
  name: 'TextArea',
  props: ['constraints', 'init', 'inputType', 'selected_language'],
  components: {
  },
  data() {
    return {
      input1: '',
    };
  },
  methods: {
    onSubmit(e) {
      e.preventDefault();
      this.$refs.form.className = 'was-validated';
      this.$emit('valueChanged', this.input1);
    },
  },
  computed: {
  },
  mounted() {
    if (this.init) {
      this.input1 = this.init;
    }
  },
};
</script>
