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
      const Response = this.$store.state.responses;
      const totalScores = this.$store.state.scores;
      const totalResponse = { response: Response, scores: totalScores };
      this.formatData(totalResponse);
    },
    formatData(data) {
      const jszip = new JSZip();
      const fileUploadData = {};
      const JSONdata = {};
      const JSONscores = {};
      // const jsonData = {};
      // sort out blobs from JSONdata
      _.map(data.response, (val, key) => {
        if (val instanceof Blob) {
          fileUploadData[key] = val;
        } else if (_.isObject(val)) {
          // make sure there aren't any Blobs here.
          // if there are, add them to fileUploadData
          _.map(val, (val2, key2) => {
            if (val2 instanceof Blob) {
              fileUploadData[`${key2}`] = val2;
            } else {
              // refill the object.
              if (!JSONdata[key]) {
                JSONdata[key] = {};
              }
              JSONdata[key][key2] = val2;
            }
          });
        } else {
          JSONdata[key] = val;
        }
      });
      _.map(data.scores, (val, key) => { // todo: check if score object not null?
        if (!_.isEmpty(val)) {
          JSONscores[key] = val;
        }
      });
      _.map(JSONdata, (val, key) => {
        jszip.folder('data/responses').file(`activity_${key}.json`, JSON.stringify(val, null, 4));
      });
      _.map(JSONscores, (val, key) => {
        jszip.folder('data/scores').file(`activity_${key}_score.json`, JSON.stringify(val, null, 4));
      });
      let f = 0;
      _.map(fileUploadData, (val) => {
        jszip.folder('data').file(`voice_item_${f + 1}.wav`, val);
        f += 1;
      });
      // jsonData.score = JSONscores[0];
      jszip.generateAsync({ type: 'blob' })
        .then((myzipfile) => {
          axios.post('http://localhost:8000/check', JSONscores[0], {
          // axios.post('https://sig.mit.edu/vb/check', JSONscores[0], {
            ContentType: 'application/json',
          })
            .then((response) => {
              const formData = new FormData();
              formData.append('file', myzipfile);
              formData.append('token', response.data.token);
              // formData.append('clientIP', this.ipAddress);
              axios.post('http://localhost:8000/submit', formData, {
              // axios.post('https://sig.mit.edu/vb/submit', formData, {
                'Content-Type': 'multipart/form-data',
              }).then((res) => {
                this.hasData = true;
                this.isUploading = false;
                // console.log('SUCCESS!!', res);
                this.$emit('valueChanged', { status: res.status });
              })
                // eslint-disable-next-line no-unused-vars
                .catch((e) => {
                  // console.log('FAILURE!!', e);
                });
            })
            // eslint-disable-next-line no-unused-vars
            .catch((error) => {
              // console.log(error);
            });
        });
    },
  },
};
</script>
