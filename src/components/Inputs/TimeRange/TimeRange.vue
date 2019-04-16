<template>
  <div class="TimeRangeInput container ml-3 pl-3">
    <b-row class="mt-2 mb-2">
      <b-col class="mt-2 mb-2">
        went to bed:
        {{yesterday}}
        <vue-timepicker v-model="slept" format="hh:mm A"></vue-timepicker>
      </b-col>
      <b-col class="mt-2 mb-2">
        woke up:
        {{today}}
        <vue-timepicker v-model="woke" format="hh:mm A"></vue-timepicker>
      </b-col>
    </b-row>

    <div class="mt-2 mb-2" v-if="timeSlept != null">
      <div class="mt-2 mb-2" v-if="timeSlept < 0">
        <b-alert show variant="danger">You can't sleep negative hours!</b-alert>
      </div>
      <b-button v-else @click="sendData">Submit {{timeSlept}} hours</b-button>
    </div>
  </div>
</template>

<style>
  .circumference {
    fill: #fff;
    stroke: #f2f2f2;
    stroke-width: 5px;
  }

  .dot circle:hover {
    cursor: pointer;
  }

  .dot circle {
    fill: lightsteelblue;
    stroke: steelblue;
    stroke-width: 1.5px;
  }

  .dot circle.dragging {
    fill: red;
    stroke: brown;
  }
</style>

<script>
// import VueClockPicker from '@pencilpix/vue2-clock-picker';
// import '@pencilpix/vue2-clock-picker/dist/vue2-clock-picker.min.css';

// import _ from 'lodash';
// import { bus } from '../../main';

import VueTimepicker from 'vue2-timepicker';
import moment from 'moment';

window.moment = moment;
// var VueTimepicker = require('vue2-timepicker')


export default {
  name: 'timeRangeInput',
  props: ['constraints', 'init', 'selected_language', 'id'],
  data() {
    return {
      slept: {
        hh: '08',
        mm: '00',
        A: 'PM',
      },
      woke: {
        A: 'AM',
        hh: '06',
        mm: '00',
      },
      today: null,
      yesterday: null,
    };
  },
  components: {
    VueTimepicker,
  },
  computed: {
    timeSlept() {
      const startTime = this.sleptAt;
      const endTime = this.wokeAt;

      const res = endTime.diff(startTime, 'hours');

      if (!isNaN(res)) {
        return parseInt(res, 0);
      }
      return null;
    },
    sleptAt() {
      const startTime = moment(`${this.slept.hh}:${this.slept.mm} ${this.slept.A}`, 'hh:mm A');
      const today = moment(new Date());
      const yesterday = moment(new Date()).add(-1, 'days');

      if (this.slept.A === 'AM') {
        // then its actually the next day
        startTime.set('date', today.get('date'));
        startTime.set('month', today.get('month'));
        startTime.set('year', today.get('year'));
      } else {
        startTime.set('date', yesterday.get('date'));
        startTime.set('month', yesterday.get('month'));
        startTime.set('year', yesterday.get('year'));
      }
      return startTime;
    },
    wokeAt() {
      const today = moment(new Date());
      const endTime = moment(`${this.woke.hh}:${this.woke.mm} ${this.woke.A}`, 'hh:mm A');
      endTime.set('date', today.get('date'));
      endTime.set('month', today.get('month'));
      endTime.set('year', today.get('year'));
      return endTime;
    },
  },
  methods: {
    sendData() {
      this.$emit('valueChanged', {
        startTime: this.sleptAt.toISOString(),
        endTime: this.wokeAt.toISOString(),
        difference: this.timeSlept,
      });
    },
  },
  watch: {
    init: {
      handler() {
        if (this.init != null) {
          // TODO: parse the input correctly
        } else {
          // TODO: parse the input correctly
        }
      },
      deep: true, // this watches all of the changes within an object. init: {value: 1}  not init: 1
    },
  },
  mounted() {
    if (this.init !== undefined || this.init != null) {
      // TODO: parse the input correctly
      const startTime = moment(this.init.startTime).format('hh:mm A');
      const endTime = moment(this.init.endTime).format('hh:mm A');
      this.slept.A = startTime.split(' ')[1];
      this.slept.hh = startTime.split(':')[0];
      this.slept.mm = startTime.split(':')[1].split(' ')[0];
      this.woke.A = endTime.split(' ')[1];
      this.woke.hh = endTime.split(':')[0];
      this.woke.mm = endTime.split(':')[1].split(' ')[0];
    }
  },
};

// init --> selected; on radio button change emit(valueChanged) -->
// (in the parent, sets init) --> init has changed
// so then change this.selected = this.init
</script>
