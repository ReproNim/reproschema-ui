<template>
  <div>
    <b-alert :show="!supported">{{ $t('media-support-msg') }}</b-alert>
    <div v-if="hasError">
      <b-alert show variant="danger">{{ $t('media-error-msg') }}</b-alert>
    </div>
    <div v-if="supported && !hasError">
      <div v-if="mode==='audioImageRecord' || mode==='videoImageRecord'" class="mb-3">
        <img class="img-fluid" :src="fieldData['http://schema.org/image'][0]['@id']" />
      </div>
      <div v-if="video">
        <video v-show="!hasRecording" ref="live" id="live_recording" playsinline autoplay muted></video>
        <video v-show="hasRecording && isPlaying" ref="recorded" id="recorded-footage" playsinline autoplay></video>
      </div>
      <div v-if="audio && visualizer" class="container-fluid">
        <div class="pids-wrapper">
          <div v-for="i in 10" :key="i" class="pid"></div>
        </div>
      </div>
      <div v-if="audio && !audioStreamDevice" class="mt-2">
        <label>{{ $t('select-microphone') }}</label>
        <select v-model="tempDeviceName" class="form-control">
          <option v-for="device in devices" :key="device.deviceId" :value="device.deviceId">{{ device.label }}</option>
        </select>
      </div>
      <div v-if="mode==='audioRecordNumberTask' || mode==='videoRecordNumberTask'" class="mb-3">
        <strong style="font-size:30px">{{ generateNumber }}</strong>
      </div>
      <div v-if="mode==='audioRecordAudioTask' || mode==='videoRecordAudioTask'" class="mb-3">
        <audio controls>
          <source :src="getAudioSource" type="audio/mp4">
          Your browser does not support the audio element.
        </audio>
      </div>
      <b-button v-if="!isRecording && !hasRecording" @click="record" variant="danger">
        {{ $t('record-button')}}
      </b-button>
      <div v-if="mode!='audioRecordNoStop' && mode!='videoRecordNoStop'" class="mb-3">
        <b-button v-if="isRecording" @click="finish">{{ $t('stop-button') }}</b-button>
      </div>
      <div v-if="isRecording">
        <small>{{timeRemaining}} {{ $t('x-seconds-left')}}</small>
      </div>
      <b-button variant="success" v-if="hasRecording && !isPlaying" @click="play" ref="play">
        <span> {{ $t('play-button') }} </span>
      </b-button>
      <b-button variant="secondary"
                v-if="hasRecording && isPlaying" @click="pause" ref="play">
        <span> {{ $t('pause-button') }} </span>
      </b-button>

      <div v-if="hasRecording" class="mt-2">
        <a href="" @click.prevent="reset">{{ $t('redo-recording') }}</a>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
const MediaStreamRecorder = require('msr');

function handleInit(newInit) {
  if (newInit === 'skip' || newInit === 'dontKnow') {
    this.hasRecording = false;
  } else if (newInit) {
    if (_.isString(newInit) && newInit.startsWith('blob')) {
      if (this.video) {
        this.recording.src = newInit;
      } else {
        this.recording = new Audio(newInit);
        this.recording.onended = this.endPlay;
      }
      this.hasRecording = true;
    } else if (newInit instanceof Blob) {
      const blobURL = URL.createObjectURL(newInit);
      this.blobURLs.push(blobURL); // Track for cleanup
      if (this.video) {
        this.recording.src = blobURL;
      } else {
        this.recording = new Audio(blobURL);
        this.recording.onended = this.endPlay;
      }
      this.recording.blob = newInit;
      this.hasRecording = true;
    }
  }
}

export default {
  name: 'MediaRecord',
  props: {
    init: {
      type: [String, Blob, Array],
    },
    mode: {
      type: String,
      default: 'audioVideoRecord',
    },
    constraints: {
      type: Object,
    },
    fieldData: {
      type: Object,
    },
    audio: {
      type: Boolean,
      default: true,
    },
    video: {
      type: Boolean,
      default: true,
    },
    visualizer: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      recording: {},
      isRecording: false,
      hasRecording: false,
      mediaRecorder: {},
      supported: null,
      interval: {},
      timeRemaining: null,
      isPlaying: false,
      hasError: false,
      devices: [],
      tempDeviceName: null,
      blobURLs: [], // Track blob URLs for cleanup
    };
  },
  computed: {
    audioStreamDevice() {
      return this.$store.state.selectedAudioInput;
    },
    recordingTime() {
      return this.constraints['http://schema.org/maxValue'][0]['@value'];
    },
    mediaConstraints() {
      const constraints = {};
      if (this.video) {
        constraints.video = true;
      }
      if (this.audio) {
        constraints.audio = {
          echoCancellation: true,
          noiseSuppression: true,
        };
        if (this.audioStreamDevice) {
          constraints.audio.deviceId = { exact: this.audioStreamDevice };
        }
      } else {
        constraints.audio = false;
      }
      return constraints;
    },
    generateNumber() {
      return 100000 + Math.floor(Math.random() * 900000);
    },
    getAudioSource() {
      if (this.fieldData && this.fieldData['http://schema.org/audio']) {
        return this.fieldData['http://schema.org/audio'][0]['http://schema.org/contentUrl'][0]['@id'];
      }
      return '';
    },
  },
  watch: {
    init: handleInit,
  },
  mounted() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      this.supported = true;
      if (this.audio) {
        this.getDevices();
      }
      this.initializeMedia();
    } else {
      this.supported = false;
    }
    handleInit.call(this, this.init);
  },
  beforeDestroy() {
    // Clean up blob URLs when component is destroyed
    this.cleanupBlobURLs();
    // Stop any active media streams
    if (this.mediaRecorder && this.mediaRecorder.stream) {
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  },
  methods: {
    getDevices() {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        this.devices = devices.filter((device) => device.kind === 'audioinput');
        if (this.devices.length > 0) {
          this.tempDeviceName = this.devices[0].deviceId;
        }
      }).catch(() => {
        this.hasError = true;
      });
    },
    record() {
      if (this.audio && !this.audioStreamDevice) {
        this.$store.commit('setSelectedAudioInput', this.tempDeviceName);
      }
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
      this.isPlaying = true;
      if (this.video) {
        this.$refs.recorded.src = this.recording.src;
        this.$refs.recorded.play();
        this.$refs.recorded.onended = this.endPlay;
      } else {
        this.recording.play();
      }
    },
    pause() {
      if (this.video) {
        this.$refs.recorded.pause();
      } else {
        this.recording.pause();
      }
      this.endPlay();
    },
    endPlay() {
      this.isPlaying = false;
    },
    finish() {
      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
      this.hasRecording = true;
      this.isRecording = false;
      clearInterval(this.interval);
    },
    reset() {
      this.cleanupBlobURLs();
      this.hasRecording = false;
      this.isRecording = false;
      this.initializeMedia();
    },
    cleanupBlobURLs() {
      // Clean up all blob URLs to prevent memory leaks
      this.blobURLs.forEach(url => {
        URL.revokeObjectURL(url);
      });
      this.blobURLs = [];
    },
    initializeMedia() {
      navigator.mediaDevices.getUserMedia(this.mediaConstraints).then(this.initializeRecorder).catch(() => {
        this.hasError = true;
      });
    },
    initializeRecorder(stream) {
      const options = {};
      if (this.video) {
        options.mimeType = 'video/mp4';
        options.codecs = 'avc1.42E01E';
      } else {
        options.mimeType = 'audio/wav';
      }
      this.mediaRecorder = new MediaStreamRecorder(stream, options);
      if (this.video) {
        this.$refs.live.srcObject = stream;
      }
      this.timeRemaining = this.recordingTime / 1000;
      this.mediaRecorder.ondataavailable = (e) => {
        const blobURL = URL.createObjectURL(e);
        this.blobURLs.push(blobURL); // Track for cleanup
        if (this.video) {
          this.recording.src = blobURL;
        } else {
          this.recording = new Audio(blobURL);
          this.recording.onended = this.endPlay;
        }
        this.recording.blob = e;
        this.$emit('valueChanged', this.recording.blob);
        this.finish();
      };

      if (this.audio && this.visualizer) {
        this.initializeAudioVisualizer(stream);
      }
    },
    initializeAudioVisualizer(stream) {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const microphone = audioCtx.createMediaStreamSource(stream);
      const scriptNode = audioCtx.createScriptProcessor(2048, 1, 1);

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;

      microphone.connect(analyser);
      analyser.connect(scriptNode);
      scriptNode.connect(audioCtx.destination);
      scriptNode.onaudioprocess = () => {
        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        let values = 0;

        const length = array.length;
        for (let i = 0; i < length; i += 1) {
          values += (array[i]);
        }
        const average = values / length;
        const allPids = this.$el.querySelectorAll('.pid');
        const amoutOfPids = Math.round(average / 10);
        for (let i = 0; i < allPids.length; i += 1) {
          allPids[i].style.backgroundColor = '#e6e7e8';
        }
        for (let i = 0; i < amoutOfPids; i += 1) {
          if (allPids[i]) {
            allPids[i].style.backgroundColor = '#69ce2b';
          }
        }
      };
    },
  },
};
</script>

<style scoped>
.pids-wrapper {
  width: 100%;
  background-color: white;
  padding: 10px 0;
}

.pid {
  width: calc(8% - 10px);
  height: 10px;
  display: inline-block;
  margin: 5px;
  background-color: #e6e7e8;
  transition: background-color 0.1s ease;
}
</style>
