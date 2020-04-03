<template>
  <div>
    <b-alert :show="!supported">Oh no, your browser doesn't support audio</b-alert>
    <div v-if="supported">
      <div v-if="mode==='audioImageRecord'" class="mb-3">
        <img class="img-fluid" :src="constraints['http://schema.org/image'][0]['@value']" />
      </div>
      <div v-if="mode==='audioRecordNumberTask'" class="mb-3">
        <strong style="font-size:30px">{{ generateNumber }}</strong>
      </div>
      <b-button v-if="!isRecording && !hasRecording" @click="record" variant="danger">
        record
      </b-button>
      <b-button v-if="isRecording" @click="stop">stop</b-button>
      <div v-if="isRecording">
        <small>{{timeRemaining}} seconds left</small>
      </div>
      <b-button variant="success" v-if="hasRecording && !isPlaying" @click="play" ref="play">
        <span> play </span>
      </b-button>

      <b-button variant="secondary"
      v-if="hasRecording && isPlaying" @click="pause" ref="play">
        <span> pause </span>
      </b-button>

      <div v-if="hasRecording" class="mt-2">
        <a href="" @click="reset">Redo recording</a>
      </div>
    </div>
  </div>
</template>

<style>
</style>

<script>
import _ from 'lodash';

const MediaStreamRecorder = require('msr');

export default {
  name: 'audioRecord',
  props: {
    init: {
      type: [String, Blob],
    },
    mode: {
      type: String,
      default: 'audioRecord',
    },
    constraints: {
      type: Object,
    },
  },
  data() {
    return {
      recording: {},
      isRecording: false,
      hasRecording: false,
      audioCtx: {},
      audioConstraints: { audio: true, video: false },
      // chunks: [],
      mediaRecorder: {},
      supported: null,
      interval: {},
      timeRemaining: null,
      isPlaying: false,
    };
  },
  computed: {
    recordingTime() {
      return this.constraints['http://schema.org/maxValue'][0]['@value'];
    },
    generateNumber() {
      return 100000 + Math.floor(Math.random() * 900000); // random number of length 6
    },
  },
  methods: {
    record() {
      this.isRecording = true;
      this.mediaRecorder.start(this.recordingTime);
      this.interval = setInterval(this.countdown, 1000);
    },
    countdown() {
      if (this.timeRemaining <= 0) {
        clearInterval(this.interval);
      } else {
        this.timeRemaining -= 1;
      }
    },
    play() {
      this.recording.play();
      this.isPlaying = true;
    },
    pause() {
      this.recording.pause();
      this.endPlay();
    },
    endPlay() {
      this.isPlaying = false;
    },
    stop() {
      this.mediaRecorder.stop();
      this.hasRecording = true;
      this.isRecording = false;
      clearInterval(this.interval);
      this.timeRemaining = this.recordingTime / 1000;
      this.$emit('valueChanged', this.recording.blob);
    },
    reset(e) {
      e.preventDefault();
      this.hasRecording = false;
      this.isRecording = false;
    },
    initialize(audioStream) {
      this.mediaRecorder = new MediaStreamRecorder(audioStream);
      this.mediaRecorder.mimeType = 'audio/wav'; // check this line for audio/wav
      this.timeRemaining = this.recordingTime / 1000;
      window.mediaRecorder = this.mediaRecorder;
      const self = this;
      this.mediaRecorder.ondataavailable = (e) => {
        const blobURL = URL.createObjectURL(e);
        self.recording.src = blobURL;
        self.recording.blob = e;
        self.stop();
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
    this.recording.onended = this.endPlay;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();
    if (navigator.mediaDevices.getUserMedia) {
      this.supported = true;
      navigator.mediaDevices.getUserMedia(this.audioConstraints).then(this.initialize, this.error);
      if (this.init) {
        if (_.isString(this.init)) {
          if (this.init.startsWith('blob')) {
            this.recording.src = this.init;
            this.hasRecording = true;
          } else {
            this.hasRecording = false;
          }
        } else if (this.init instanceof Blob) {
          const blobURL = URL.createObjectURL(this.init);
          this.recording.src = blobURL;
          this.recording.blob = this.init;
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
