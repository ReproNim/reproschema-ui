<template>
  <div>
    <b-alert :show="!supported">{{ $t('audio-support-msg')}}</b-alert>
    <div v-if="supported">
      <div v-if="mode==='audioImageRecord'" class="mb-3">
        <img class="img-fluid" :src="fieldData['http://schema.org/image'][0]['@id']" />
      </div>
    <!--Added by Veronika - trying to open a select menu if audio input type not indicated-->
    <div v-if="(!audioStreamDevice)" onload="getDevices">
      <label>Please select the type of microphone you wish to use.</label>
      <select @change="nameDevice">
        <option v-for="device in devices" :key="device" :value="device">{{ device }}</option>
      </select>
    </div>
      <div v-if="mode==='audioRecordNumberTask'" class="mb-3">
        <strong style="font-size:30px">{{ generateNumber }}</strong>
      </div>
      <div v-if="mode==='audioRecordAudioTask'" class="mb-3">
        <audio controls>
          <source :src="getAudioSource" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
      </div>
      <b-button v-if="!isRecording && !hasRecording" @click="record" variant="danger">
        {{ $t('record-button')}}
      </b-button>
      <div v-if="mode!='audioRecordNoStop'" class="mb-3">
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
        <a href="" @click="reset">{{ $t('redo-recording') }}</a>
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
        type: [String, Blob, Array],
      },
      mode: {
        type: String,
        default: 'audioRecord',
      },
      constraints: {
        type: Object,
      },
      fieldData: {
        type: Object,
      },
    },
    data() {
      return {
        recording: {},
        isRecording: false,
        hasRecording: false,
        audioCtx: {},
        audioConstraints: {
          audio: {
            deviceId:{exact:this.audioStreamDevice},
          },
          video: false },
        // chunks: [],
        mediaRecorder: {},
        supported: null,
        interval: {},
        timeRemaining: null,
        isPlaying: false,
        devices: null,
        tempDeviceName: null,
      };
    },
    methods: {
      getDevices() {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          const audioInputDevices = devices.filter((device) => device.kind === 'audioinput');
          this.devices = audioInputDevices.map((device) => device.label || `Microphone ${device.deviceId}`);
          this.tempDeviceName = devices[0]
        }).catch((err) => {
          console.error("Error enumerating devices:", err);
        });
      },
      selectAudioDevice(deviceId){
        this.audioStreamDevice = deviceId;
      },
      nameDevice(e){
        this.tempDeviceName = e.target.value
      },
      setDevice(){
        this.$store.state.selectedAudioInput = this.tempDeviceName;
      },
      record() {
        if (!this.audioStreamDevice){
          this.setDevice();
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
      finish() {
        this.mediaRecorder.stop();
        this.hasRecording = true;
        this.isRecording = false;
        clearInterval(this.interval);
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
          this.$emit('valueChanged', this.recording.blob);
          self.finish();
        };
      },
      error() {
      },
    },
    computed: {
      audioStreamDevice(){
        return this.$store.state.selectedAudioInput;
      },
      recordingTime() {
        return this.constraints['http://schema.org/maxValue'][0]['@value'];
      },
      generateNumber() {
        return 100000 + Math.floor(Math.random() * 900000); // random number of length 6
      },
      getAudioSource() {
        if (this.fieldData['http://schema.org/audio']) {
          return this.fieldData['http://schema.org/audio'][0]['http://schema.org/contentUrl'][0]['@id'];
        }
        return '';
      }
    },
    mounted() {
      this.recording = new Audio();
      this.recording.onended = this.endPlay;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
      this.getDevices()
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
    watch: {
      init() {
        if (this.init === 'skip' || this.init === 'dontKnow') {
          this.hasRecording = false;
        }
      }
    },
  };
</script>
