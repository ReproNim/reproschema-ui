<template>
  <div class="SaveData ml-3 mr-3 pl-3 pr-3">
    <b-button v-if="!isUploading && !hasData" @click="record" variant="danger">
      Upload
    </b-button>
    <div v-if="isUploading" class="loader">
      <Loader />
    </div>
    <div style="width:800px; margin:0 auto;" v-bind:class="{ done: hasData}"></div>
  </div>
</template>

<style>
  .done {
    background: transparent url(/static/images/done.svg) center no-repeat;
    background-size: contain;
    width: 1.6rem;
    height: 1.6rem;
  }
</style>

<script>
import _ from 'lodash';
import JSZip from 'jszip';
import axios from 'axios';
import Loader from '../../Loader';

export default {
  name: 'SaveData',
  props: ['constraints', 'init', 'selected_language', 'ipAddress'],
  components: {
    Loader,
  },
  data() {
    return {
      recording: {},
      isUploading: false,
      hasData: false,
    };
  },
  computed: {
  },
  methods: {
    record() {
      this.isUploading = true;
      this.uploadZipData();
    },
    uploadZipData() {
      const Response = this.$store.state.exportResponses;
      const totalScores = this.$store.state.scores;
      const uId = this.$store.state.participantId;
      const totalResponse = { response: Response, scores: totalScores, participantId: uId };
      this.formatData(totalResponse);
    },
    formatData(data) {
      const TOKEN = this.$store.state.token;
      const expiryMinutes = this.$store.state.expiryMinutes;
      const jszip = new JSZip();
      // sort out blobs from JSONdata
      let key = 0;
      _.map(data.response, (eachActivityList) => {
        _.map(eachActivityList, (itemObj) => {
          if (itemObj['@type'] === 'reproterms:Response') {
            const voiceMap = {};
            _.map(itemObj, (value, key1) => {
              // console.log(294, value, key1);
              if (value instanceof Blob) {
                // fileUploadData[key1] = value;
                const keyStrings = (itemObj.isAbout.split('/items/')[1]);
                const rId = itemObj['@id'].split('uuid:')[1];
                jszip.folder('responses').file(`${keyStrings}-${rId}.wav`, value);
                // eslint-disable-next-line no-param-reassign
                voiceMap[key1] = `${keyStrings}-${rId}.wav`;
              }
              // todo: check if sections are present, they are no longer object but lists
              // else if (_.isObject(value)) {
              //   // make sure there aren't any Blobs here.
              //   // if there are, add them to fileUploadData
              //   _.map(value, (val2, key2) => {
              //     if (val2 instanceof Blob) {
              //       // console.log(322, val, key2, val2);
              //       fileUploadData[`${key2}`] = val2;
              //     }
              //     else {
              //       // refill the object.
              //       if (!JSONdata[key]) {
              //         JSONdata[key] = {};
              //       }
              //       JSONdata[key][key2] = val2;
              //     }
              //   });
              // }
              // else {
              //   JSONdata[key] = val;
              // }
            });
            _.map(voiceMap, (v, ky) => {
              if (ky in itemObj) {
                const newObj = itemObj;
                // console.log(327, itemObj);
                newObj[ky] = v;
              }
            });
          }
        });
        // write out the activity files
        if (eachActivityList.length) { // if activity is answered then write to file
          jszip.folder('responses').file(`activity_${key}.jsonld`, JSON.stringify(eachActivityList, null, 4));
          key += 1;
        }
      });

      // _.map(data.scores, (val, key) => { // todo: check if score object not null?
      //   if (!_.isEmpty(val)) {
      //     JSONscores[key] = val;
      //   }
      // });
      // _.map(JSONdata, (val, key) => {
      //   // console.log(342, (key));
      // jszip.folder('responses').file(`activity_${key}.json`, JSON.stringify(val, null, 4));
      // });
      // _.map(JSONscores, (val, key) => {
      // jszip.folder('scores').file(`activity_${key}_score.json`, JSON.stringify(val, null, 4));
      // });

      // let registrationURL = `https://sig.mit.edu/vb/token?token=${TOKEN}`;
      // if (expiryMinutes) {
      //   registrationURL = `https://sig.mit.edu/vb/token?token=${TOKEN}&expiry_minutes=${expiryMinutes}`;
      // }
      jszip.generateAsync({ type: 'blob' })
        .then((myzipfile) => {
          const formData = new FormData();
          formData.append('file', myzipfile, 'study-data.zip');
          formData.append('auth_token', `${TOKEN}`);
          formData.append('expires', `${expiryMinutes}`);
          // axios.post('http://localhost:8000/submit', formData, {
          axios.post('https://sig.mit.edu/vb/submit', formData, {
            'Content-Type': 'multipart/form-data',
          }).then((res) => {
            this.hasData = true;
            this.isUploading = false;
            console.log('SUCCESS!!', res);
            this.$emit('valueChanged', { status: res.status });
          })
            // eslint-disable-next-line no-unused-vars
            .catch((e) => {
              // console.log('FAILURE!!', e);
            });
        });
    },
  },
};
</script>
