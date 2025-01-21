<template>
  <div class="DocumentUpload">
    <input type="file" @change="onFileSelected">
    <button @click="onSubmit">{{ $t('upload-button')}}</button>

  </div>
</template>

<script>

export default {
  name: 'DocumentUpload',
  props: ['constraints', 'init'],
  data() {
    return {
      selectedFile: null,
    };
  },
  methods: {
    onFileSelected(event) {
      this.selectedFile = event.target.files[0];
    },
    onSubmit(e) {
      e.preventDefault();
      this.$emit('valueChanged', this.selectedFile);
    },
  },
  computed: {
    c() {
      return this.a + this.b;
    },
  },
  mounted() {
    if (this.init) {
      this.selectedFile = this.init;
    }
  },
  watch: {
    input() {
      // if there is a change, emit it.
      this.$emit('valueChanged', this.input);
    },
  }
};
</script>
