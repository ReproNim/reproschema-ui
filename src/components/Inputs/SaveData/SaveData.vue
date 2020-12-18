<template>
  <div class="SaveData ml-3 mr-3 pl-3 pr-3">
    <div v-if="!isUploading && !hasData">
      <div v-if="shouldUpload">
        <p>{{ $t('save-data')}}</p>
        <b-button @click="upload" variant="danger">
          {{ $t('upload-button')}}
        </b-button>
      </div>
      <div v-else>
        <p v-if="exportOption">{{ $t('export-and-finish')}}</p>
        <p v-else>{{ $t('finish')}}</p>
        <b-button @click="finish" variant="danger">
          {{ $t('finish-button')}}
        </b-button>
      </div>
    </div>
    <div v-if="isUploading" class="loader">
      <Loader></Loader>
      <p>{{ $t('upload-message')}}</p>
    </div>
    <div style="width:800px; margin:0 auto;" v-bind:class="{ done: hasData}"></div>
  </div>
</template>

<style>
  .done {
    background: transparent url(/src/assets/Check-Mark.svg) center no-repeat;
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
import config from '../../../config';
import { v4 as uuidv4 } from 'uuid';

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
    shouldUpload() {
      return !!(config.backendServer && this.$store.getters.getAuthToken);
    },
    participantId() {
      return this.$store.getters.getParticipantId;
    },
    exportOption() {
      return this.$store.getters.getHasExport;
    }
  },
  methods: {
    finish() {
      this.hasData = true;
      this.$emit('valueChanged', 'completed');
    },
    upload() {
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
      const TOKEN = this.$store.getters.getAuthToken;
      const expiryMinutes = this.$store.state.expiryMinutes;
      const jszip = new JSZip();
      // sort out blobs from JSONdata
      let key = 0;
      const voiceMap = {};
      _.map(data.response, (eachActivityList) => {
        const activityData = [];
        _.map(eachActivityList, (itemObj) => {
          const newObj = { ...itemObj };
          if (itemObj['@type'] === 'reproschema:Response') {
            // console.log(294, value, key1);
            if (itemObj.value instanceof Blob) {
              // fileUploadData[key1] = value;
              const keyStrings = (itemObj.isAbout.split('/items/')[1]);
              const rId = itemObj['@id'].split('uuid:')[1];
              jszip.folder('responses').file(`${keyStrings}-${rId}.wav`, itemObj.value);
              newObj.value = `${keyStrings}-${rId}.wav`;
              // eslint-disable-next-line no-param-reassign
              voiceMap[itemObj['@id']] = `${keyStrings}-${rId}.wav`;
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
          }
          activityData.push(newObj);
        });
        // write out the activity files
        if (activityData.length) { // if activity is answered then write to file
          jszip.folder('responses').file(`activity_${key}.jsonld`, JSON.stringify(activityData, null, 4));
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
      jszip.generateAsync({ type: 'blob' })
        .then((myzipfile) => {
          const fileName = `${uuidv4()}-${this.participantId}.zip`;
          const formData = new FormData();
          formData.append('file', myzipfile, fileName);
          formData.append('auth_token', `${TOKEN}`);
          formData.append('expires', `${expiryMinutes}`);
            // console.log(148, `${config.backendServer}/submit`);
          axios.post(`${config.backendServer}/submit`, formData, {
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
