<template>
  <div>
    <b-alert :show="!supported">{{ $t('audio-support-msg')}}</b-alert>
    <div v-if="supported">
      <b-button v-if="!isRecording && !hasRecording" @click="record" variant="danger">
        {{ $t('start-button') }}
      </b-button>
      <div v-if="isRecording" class="container-fluid">
        <div class="pids-wrapper">
          <div class="pid"></div>
          <div class="pid"></div>
          <div class="pid"></div>
          <div class="pid"></div>
          <div class="pid"></div>
          <div class="pid"></div>
          <div class="pid"></div>
          <div class="pid"></div>
          <div class="pid"></div>
          <div class="pid"></div>
        </div>
      </div>
<!--      <b-button v-if="isRecording" @click="stop">stop</b-button>-->
      <div v-if="isRecording">
        <small>{{timeRemaining}} {{ $t('x-seconds-left') }}</small>
      </div>
      <b-button variant="success" v-if="hasRecording && !isPlaying" @click="play" ref="play">
        <span> {{ $t('play-button') }} </span>
      </b-button>
    </div>
    <b-button variant="secondary"
                v-if="hasRecording && isPlaying" @click="pause" ref="play">
        <span> {{ $t('pause-button') }} </span>
      </b-button>

    <div v-if="hasRecording" class="mt-2">
        <a href="" @click="reset">{{ $t('redo-recording') }}</a>
      </div>
    <div v-if="hasRecording" class="mt-2">
        <a href="" @click="saveAndContinue">{{ $t('continue') }}</a>
      </div>
  </div>
</template>

<style>
  .pids-wrapper{
    width: 100%;
    background-color: white;
  }
  .pid{
    width: calc(8% - 10px);
    height: 10px;
    display: inline-block;
    margin: 5px;
  }
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
    saveAndContinue(e) {
      e.preventDefault();
      this.$emit('valueChanged', this.recording.blob);
    },
    stop() {
      this.mediaRecorder.stop();
      this.hasRecording = true;
      this.isRecording = false;
      clearInterval(this.interval);
      this.timeRemaining = this.recordingTime / 1000;
      // this.$emit('valueChanged', this.recording.blob);
    },
    reset(e) {
      e.preventDefault();
      this.hasRecording = false;
      this.isRecording = false;
      navigator.mediaDevices.getUserMedia(this.audioConstraints).then(this.initialize, this.error);
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

      // check audio level
      const audioContext = new AudioContext();
      const analyser = this.audioCtx.createAnalyser();
      const microphone = this.audioCtx.createMediaStreamSource(audioStream);
      const scriptNode = this.audioCtx.createScriptProcessor(2048, 1, 1);

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;

      microphone.connect(analyser);
      analyser.connect(scriptNode);
      scriptNode.connect(this.audioCtx.destination);
      scriptNode.onaudioprocess = () => {
        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        let values = 0;

        const length = array.length;
        for (let i = 0; i < length; i += 1) {
          values += (array[i]);
        }
        const average = values / length;

        // console.log(77, Math.round(average));
        const allPids = document.getElementsByClassName('pid');
        const amoutOfPids = Math.round(average / 10);
        for (let i = 0; i < allPids.length; i += 1) {
          allPids[i].style.backgroundColor = '#e6e7e8';
        }

        if (amoutOfPids <= allPids.length) {
          for (let i = 0; i < amoutOfPids; i += 1) {
            allPids[i].style.backgroundColor = '#69ce2b';
          }
        }
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

    // Older browsers might not implement mediaDevices at all, so we set an empty object first
    if (navigator.mediaDevices === undefined) {
      navigator.mediaDevices = {};
    }

    // Some browsers partially implement mediaDevices. We can't just assign an object
    // with getUserMedia as it would overwrite existing properties.
    // Here, we will just add the getUserMedia property if it's missing.
    if (navigator.mediaDevices.getUserMedia === undefined) {
      navigator.mediaDevices.getUserMedia = (constraints) => {
        // First get ahold of the legacy getUserMedia, if present
        const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia
          || navigator.msGetUserMedia;

        // Some browsers just don't implement it - return a rejected promise with an error
        // to keep a consistent interface
        if (!getUserMedia) {
          this.supported = false;
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }

        // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
        return new Promise(((resolve, reject) => {
          getUserMedia.call(navigator, constraints, resolve, reject);
        }));
      };
    }

    // set up forked web audio context, for multiple browsers
    // window. is needed otherwise Safari explodes
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
