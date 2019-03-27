<template>
  <div class="DateInput">
    <!-- TODO: some sort of validation on date (make sure its not a future date.)
    and this should be encoded in the jsonld -- in valueConstraints -->
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
  computed: {
    c() {
      return this.a + this.b;
    },
  },
  data() {
    return {
      // a proxy. It should initialize to this.init. when its changed,
      // we should tell the parent that its changed, with then changes this.input
      input: new Date(),
      a: 1,
      b: 2,
    };
  },
  mounted() {
    if (this.init) {
      this.input = this.init;
    }
  },
};
</script>
