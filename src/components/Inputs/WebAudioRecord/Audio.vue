<template>
  <div>
    <b-alert :show="!supported">Oh no, your browser doesn't support audio</b-alert>
    <b-button v-if="!isRecording && !hasRecording" @click="record" variant="danger">
      record
    </b-button>
    <b-button v-if="isRecording" @click="stop">stop</b-button>
    <b-button variant="success" v-if="hasRecording" @click="play">play</b-button>
    <div v-if="hasRecording" class="mt-2">
      <a href="" @click="reset">Redo recording</a>
    </div>
  </div>
</template>

<style>
</style>

<script>

export default {
  name: 'audioRecord',
  props: {
    init: {
      type: String,
    },
  },
  data() {
    return {
      recording: {},
      isRecording: false,
      hasRecording: false,
      audioCtx: {},
      audioConstraints: { audio: true, video: false },
      chunks: [],
      mediaRecorder: {},
      supported: null,
    };
  },
  methods: {
    record() {
      this.isRecording = true;
      this.mediaRecorder.start();
    },
    play() {
      this.recording.play();
    },
    stop() {
      this.mediaRecorder.stop();
    },
    reset(e) {
      e.preventDefault();
      this.hasRecording = false;
      this.isRecording = false;
    },
    initialize(audioStream) {
      this.mediaRecorder = new MediaRecorder(audioStream);
      const self = this;
      this.mediaRecorder.ondataavailable = (e) => {
        self.chunks.push(e.data);
      };
      this.mediaRecorder.onstop = () => {
        self.isRecording = false;
        const blob = new Blob(this.chunks, { type: 'audio/ogg; codecs=opus' });
        self.chunks = [];
        const audioURL = window.URL.createObjectURL(blob);
        self.recording.src = audioURL;
        self.hasRecording = true;
        this.$emit('valueChanged', audioURL);
      };
    },
    error() {
    },
  },
  watch: {
    init() {
      if (this.init === 'skip' || this.init === 'dontKnow') {
        this.hasRecording = false;
      }
    },
  },
  mounted() {
    this.recording = new Audio();
    const AudioContext = window.AudioContext || window.webKit.AudioContext;
    this.audioCtx = new AudioContext();
    if (navigator.mediaDevices.getUserMedia) {
      this.supported = true;
      navigator.mediaDevices.getUserMedia(this.audioConstraints).then(this.initialize, this.error);
      if (this.init) {
        if (this.init.startsWith('blob')) {
          this.recording.src = this.init;
          this.hasRecording = true;
        } else {
          this.hasRecording = false;
        }
      }
      // console.log('getUserMedia API supported');
    } else {
      this.supported = false;
      // console.log('Getusermedia API is not supported on this browser');
    }
  },
};
</script>
