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
      <p>Please submit your locally exported zip file here: <a href="https://www.dropbox.com/request/KnfdziEjey8iGUPeocd3" target="_blank">Dropbox</a></p>
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
      // sort out blobs from JSONdata
      let key = 0;
      const voiceMap = {};
      const fileName = `${uuidv4()}-${this.participantId}`;
      _.map(data.response, (eachActivityList) => {
        const activityData = [];
        _.map(eachActivityList, (itemObj) => {
          const newObj = { ...itemObj };
          if (itemObj['@type'] === 'reproschema:Response') {
            // console.log(294, value, key1);
            if (itemObj.value instanceof Blob) {
              // fileUploadData[key1] = value;
              const keyStrings = (itemObj.isAbout.split('/'));
              const rId = itemObj['@id'].split('uuid:')[1];
              jszip.folder(fileName).file(`${keyStrings[keyStrings.length-1]}-${rId}.wav`, itemObj.value);
              newObj.value = `${keyStrings[keyStrings.length-1]}-${rId}.wav`;
              // eslint-disable-next-line no-param-reassign
              voiceMap[itemObj['@id']] = `${keyStrings[keyStrings.length-1]}-${rId}.wav`;
            }
            // filter out sub-activities only, the criteria inside if needs to be changed
            else if (itemObj.value.constructor === Object && !itemObj.value.hasOwnProperty('unitCode')) {
              _.map(itemObj.value, (valueList, fieldKey) => {
                const subActivityFieldData = [];
                _.map(valueList, eachItem => {
                  const newItem = { ...eachItem };
                  if (eachItem && eachItem['@type'] === 'reproschema:Response') {
                    if (eachItem.value instanceof Blob) {
                      const keyStrings = (eachItem.isAbout.split('/'));
                      const rId = eachItem['@id'].split('uuid:')[1];
                      jszip.folder(fileName).file(`${keyStrings[keyStrings.length-1]}-${rId}.wav`, eachItem.value);
                      newItem.value = `${keyStrings[keyStrings.length-1]}-${rId}.wav`;
                      voiceMap[eachItem['@id']] = `${keyStrings[keyStrings.length-1]}-${rId}.wav`;
                    }
                  }
                  subActivityFieldData.push(newItem);
                });
                itemObj.value[fieldKey] = subActivityFieldData;
              })
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
          jszip.folder(fileName).file(`activity_${key}.jsonld`, JSON.stringify(activityData, null, 4));
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
          if (this.downloadAndSubmit) {
            saveAs(myzipfile, `${fileName}.zip`);
          }
          const formData = new FormData();
          formData.append('file', myzipfile, `${fileName}.zip`);
          formData.append('auth_token', `${TOKEN}`);
          formData.append('expires', `${expiryMinutes}`);
          // console.log(179, `${config.backendServer}/submit`);
          const config1 = {
            onUploadProgress: function(progressEvent) {
              this.percentCompleted = parseInt(Math.round( (progressEvent.loaded * 100) / progressEvent.total ));
            }.bind(this),
            'Content-Type': 'multipart/form-data',
            timeout: 2000
          };
          axios.post(`${config.backendServer}/submit`, formData, config1).then((res) => {
              this.hasData = true;
              this.isUploading = false;
              console.log('SUCCESS!!', res.status);
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
