<template>
  <div class="DocumentUpload">
    <input type="file" @change="onFileSelected">
    <button @click="onSubmit">Upload</button>

  </div>
</template>

<script>

export default {
  name: 'DocumentUpload',
  props: ['constraints', 'init'],
  watch: {
    input() {
      // if there is a change, emit it.
      this.$emit('valueChanged', this.input);
    },
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
  data() {
    return {
      selectedFile: null,
    };
  },
  mounted() {
    if (this.init) {
      this.selectedFile = this.init;
    }
  },
};
</script>
