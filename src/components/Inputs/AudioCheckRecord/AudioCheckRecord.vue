<template>
  <div class="container-fluid">
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
    reset(e) {
      e.preventDefault();
      this.hasRecording = false;
      this.isRecording = false;
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
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then((stream) => {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;

        microphone.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);
        javascriptNode.onaudioprocess = function () {
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
      })
      .catch((err) => {
        /* handle the error */
        console.log(err);
      });
  },
};
</script>
