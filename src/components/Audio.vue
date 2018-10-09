<template>
  <div>
    <audio-recorder
      :attempts="3"
      :time="0.2"
      class="mx-auto"
      ref="audio"
    />
  </div>
</template>

<style>

</style>

<script>
import AudioRecorder from 'vue-audio-recorder';
import Vue from 'vue';

Vue.use(AudioRecorder);

export default {
  name: 'audio',
  data() {
    return {

    };
  },
};
</script>
