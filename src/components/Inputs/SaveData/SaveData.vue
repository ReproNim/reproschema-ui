<template>
  <div class="SaveData ml-3 mr-3 pl-3 pr-3">
    <input type='file' id='input' @change="testUpload">
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
      <p>{{ $t('upload-message')}}</p>
      <b-progress :max="100" :striped="hasStripe">
        <b-progress-bar :value="percentCompleted" :label="`${((percentCompleted / 100) * 100)}%`" animated></b-progress-bar>
      </b-progress>
    </div>
    <div v-else-if="isUploading && percentCompleted === 0">
        <p>{{ $t('prepare-upload')}}</p>
        <Loader></Loader>
    </div>
    <b-modal v-model="timeout" ref="timeout-modal" ok-title="Done" ok-only title="Uh-oh! Upload unsuccessful!" @ok="timeoutOK"
             no-close-on-esc no-close-on-backdrop hide-header-close>
      <p v-if="dataUploadPath">Please submit your locally exported zip file <a :href=dataUploadPath target="_blank">here</a></p>
      <p v-else>Let researchers know with the <b>Help</b> button or by email to {{ contact }}</p>
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
import fs from 'fs';
// import splitFile from 'split-file';

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
    testUpload() {
      const TOKEN = this.$store.getters.getAuthToken;
      const expiryMinutes = this.$store.state.expiryMinutes;
      const file = document.getElementById('input').files[0];

        (async () => {
          console.log(17, 'in async !!!!');
          // .text() transforms the file into a stream and then into a string
          // const fileContent = await file;
          console.log(18, file.size);
          // logs "File content!"

          // .stream() returns a ReadableStream
          // const fileContentStream = await file.stream();
          // console.log(22, await streamToText(fileContentStream));
          // logs "File content!"

          // const buffer = await file.arrayBuffer();
          // console.log(26, bufferToText(buffer))
          // logs "File content!"

          // .slice() allows you to get slices of the file here we take a slice of the entire file
          if (file.slice(0, file.size/4)) {
            console.log(121);
          } else {
            console.log(122);
          }
           console.log(125, 'hi sanu');
          const fileSliceBlob1 = file.slice(0, file.size/4);
          const fileSliceBlob2 = file.slice(file.size/4, file.size/2);
          const fileSliceBlob3 = file.slice(file.size/2, file.size);
          // we convert to blob to a stream
          const fileSliceBlobStream1 = await fileSliceBlob1.arrayBuffer();
          console.log(33, fileSliceBlob1, await bufferToText(fileSliceBlobStream1));
          const fileSliceBlobStream2 = await fileSliceBlob2.arrayBuffer();
          console.log(34, fileSliceBlob2, await bufferToText(fileSliceBlobStream2));
          const fileSliceBlobStream3 = await fileSliceBlob3.arrayBuffer();
          console.log(35, fileSliceBlob3, await bufferToText(fileSliceBlobStream3));
          fileSliceBlobStream1.type = 'Blob';
          const formData = new FormData();
          formData.append('file', fileSliceBlobStream1, `test1-part1.zip`);
          formData.append('auth_token', `${TOKEN}`);
          formData.append('expires', `${expiryMinutes}`);
          const config1 = {
            // onUploadProgress: function(progressEvent) {
            //   this.percentCompleted = parseInt(Math.round( (progressEvent.loaded * 100) / progressEvent.total ));
            // }.bind(this),
            'Content-Type': 'multipart/form-data'
            // timeout: 420000
          };
          axios.post(`${config.backendServer}/submit`, formData, config1).then((res) => {
            this.hasData = true;
            this.isUploading = false;
            console.log('SUCCESS!!', res.status);
            this.$emit('valueChanged', { status: res.status });
          }).catch((e) => {
            if(e.code && e.code === 'ECONNABORTED') {
              this.timeout = true;
              this.showProgressBar = false;
            }
          });

        })();

        // We just use this function to convert streams to text
        // const streamToText = async (blob) => {
        //   console.log(143);
        //   const readableStream = await blob.getReader();
        //   const chunk = await readableStream.read();
        //   console.log(135, chunk, chunk.value);
        //   return new TextDecoder('utf-8').decode(chunk.value);
        // }

        // Not the best way to get text from a file!
        const bufferToText = (buffer) => {
          const bufferByteLength = buffer.byteLength;
          const bufferUint8Array = new Uint8Array(buffer, 0, bufferByteLength);
          return new TextDecoder().decode(bufferUint8Array);
        }

    },
    finish() {
      this.hasData = true;
      const zip = JSZip();
      zip.folder("sub").file("file.txt", "content");
      console.log(109, zip);
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
      // const jszip = new JSZip();
      let key = 0;
      const fileName = `${uuidv4()}-${this.participantId}`;
      _.map(data.response, (eachActivityList) => {
        const activityData = [];
        const jszip = new JSZip();
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
