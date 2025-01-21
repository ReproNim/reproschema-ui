<template>
  <div class="DateInput">
    <datepicker placeholder="Select Date" v-model="input" lang=selected_language
                :disabledDates="dateParam.disabledDates" :format="customFormatter"
                :minimumView=inputType :maximumView="'year'" :initialView=inputType
                ></datepicker>
  </div>
</template>

<script>
import Datepicker from 'vuejs-datepicker';
import moment from 'moment';

export default {
  name: 'DateInput',
  props: {
    'constraints': {},
    'init': {},
    'inputType': {},
    'selected_language': {}
  },
  components: {
    Datepicker,
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
  methods: {
    customFormatter(date) {
      if (this.inputType === 'year') {
        return moment(date).format('YYYY');
      } else if (this.inputType === 'date') {
        return moment(date).format('YYYY MMM DD');
      } return date;
    },
  },
  mounted() {
    if (this.init) {
      if (this.inputType === 'year') {
        this.input = new Date(this.init, 0, 365);
      } else this.input = this.init;
    }
  },
  watch: {
    input() {
      // if there is a change, emit it.
      this.$emit('valueChanged', this.customFormatter(this.input));
      // make sure you validate the date based on this.constraints.
    },
  },
};
</script>
