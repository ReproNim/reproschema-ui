<template>
  <div class="DateInput">
    <datepicker placeholder="Select Year" v-model="input" lang="en"
                :disabledDates="dateParam.disabledDates" :format="customFormatter"
                :minimumView="'year'" :maximumView="'year'" :initialView="'year'"
                ></datepicker>
  </div>
</template>

<script>
import Datepicker from 'vuejs-datepicker';
import moment from 'moment';

export default {
  name: 'DateInput',
  props: ['constraints', 'init'],
  components: {
    Datepicker,
  },
  watch: {
    input() {
      // if there is a change, emit it.
      this.$emit('valueChanged', this.input);

      // make sure you validate the date based on this.constraints.
    },
  },
  methods: {
    sendData(val) {
      this.$emit('valueChanged', val.getFullYear());
    },
    customFormatter(date) {
      return moment(date).format('YYYY');
    },
  },
  data() {
    return {
      // a proxy. It should initialize to this.init. when its changed,
      // we should tell the parent that its changed, with then changes this.input
      input: null,
      dateParam: {
        disabledDates: {
          from: new Date(), // Disable all dates after today
        },
      },
    };
  },
  mounted() {
    if (this.init) {
      this.input = this.init;
    }
  },
};
</script>
