<template>
  <div class="SaveD`ata ml-3 mr-3 pl-3 pr-3">
    <div v-if="!isUploading && !hasData && !hasTimedOut">
      <div v-if="shouldUpload">
        <p>{{ $t('save-data')}}</p>
        <b-button v-if="downloadAndSubmit" @click="upload" variant="danger" ref="upload">
          {{ $t('download-and-submit-button')}}
        </b-button>
        <b-button v-else @click="upload" variant="danger" ref="upload">
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
    <div v-if="isUploading && percentCompleted >0 && showProgressBar" class="loader">
      <b-progress :max="100" :striped="hasStripe">
        <b-progress-bar :value="percentCompleted" :label="`${((percentCompleted / 100) * 100)}%`" animated></b-progress-bar>
      </b-progress>
    </div>
    <div v-else-if="isUploading && percentCompleted === 0">
        <p>{{ $t('upload-message')}}</p>
        <Loader></Loader>
    </div>
    <b-modal v-model="timeout" ref="timeout-modal" ok-title="Done" ok-only title="Uh-oh! Upload unsuccessful!" @ok="timeoutOK"
             no-close-on-esc no-close-on-backdrop hide-header-close>
      <p>Please submit your locally exported zip file <a :href=dataUploadPath target="_blank">here</a></p>
    </b-modal>
    <div style="width:800px; margin:0 auto;" v-bind:class="{ done: hasData}"></div>
  </div>
</template>

<style>
  .done {
    background: transparent url(../../../assets/Check-Mark.svg) center no-repeat;
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
import {saveAs} from "file-saver";

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
      percentCompleted: 0,
      timeout: false,
      uploadFailed: false,
      showProgressBar: true,
      invalidToken: false,
      downloadAndSubmit: config.downloadAndSubmit,
      dataUploadPath: config.dataUploadPath,
      contact: config.contact
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
    },
    hasStripe() {
      return !(this.percentCompleted === 100);
    },
    hasTimedOut() {
      return this.timeout;
    },
  },
  methods: {
    finish() {
      this.hasData = true;
      this.$emit('valueChanged', 'completed');
    },
    timeoutOK() {
        this.$emit('valueChanged', 'timeout');
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
      let key = 0;
      const fileName = `${uuidv4()}-${this.participantId}`;
      _.map(data.response, (eachActivityList) => {
        const activityData = [];
        _.map(eachActivityList, (itemObj) => {
          const newObj = { ...itemObj };
          if (itemObj['@type'] === 'reproschema:Response') {
            if (itemObj.value instanceof Blob) {
              const keyStrings = (itemObj.isAbout.split('/'));
              const rId = itemObj['@id'].split('uuid:')[1];
              jszip.folder(fileName).file(`${keyStrings[keyStrings.length-1]}-${rId}.wav`, itemObj.value);
              newObj.value = `${keyStrings[keyStrings.length-1]}-${rId}.wav`;
            }
          }
          activityData.push(newObj);
        });
        // write out the activity files
        if (activityData.length) { // if activity is answered then write to file
          jszip.folder(fileName).file(`activity_${key}.jsonld`, JSON.stringify(activityData, null, 4));
          key += 1;
        }
      });
      jszip.generateAsync({ type: 'blob' })
        .then((myzipfile) => {
          if (this.downloadAndSubmit) {
            saveAs(myzipfile, `${fileName}.zip`);
          }
          const formData = new FormData();
          formData.append('file', myzipfile, `${fileName}.zip`);
          formData.append('auth_token', `${TOKEN}`);
          formData.append('expires', `${expiryMinutes}`);
          const config1 = {
            onUploadProgress: function(progressEvent) {
              this.percentCompleted = parseInt(Math.round( (progressEvent.loaded * 100) / progressEvent.total ));
            }.bind(this),
            'Content-Type': 'multipart/form-data',
            timeout: 420000
          };
          axios.post(`${config.backendServer}/submit`, formData, config1).then((res) => {
              this.hasData = true;
              this.isUploading = false;
              // console.log('SUCCESS!!', res.status);
              this.$emit('valueChanged', { status: res.status });
            })
          .catch((e) => {
            if(e.code && e.code === 'ECONNABORTED') {
              this.timeout = true;
              this.showProgressBar = false;
            }
          });
        });
    },
  },
};
</script>
