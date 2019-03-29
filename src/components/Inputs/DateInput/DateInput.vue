<template>
  <div class="DateInput">
    <datepicker v-model="input" lang="en" :not-before="new Date()"
                :minimumView="'day'" :maximumView="'year'" :initialView="'year'"
                @change="sendData"></datepicker>
  </div>
</template>

<script>
import Datepicker from 'vuejs-datepicker';

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
      this.$emit('valueChanged', val);
    },
  },
  data() {
    return {
      // a proxy. It should initialize to this.init. when its changed,
      // we should tell the parent that its changed, with then changes this.input
      input: new Date(),
    };
  },
  mounted() {
    if (this.init) {
      this.input = this.init;
    }
  },
};
</script>
