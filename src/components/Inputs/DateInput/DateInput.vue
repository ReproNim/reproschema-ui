<template>
  <div class="DateInput">
    <!-- TODO: when the input value changes, make sure we tell our parent component that
    the value changed. -->

    <!-- TODO: some sort of validation on date (make sure its not a future date.)
    and this should be encoded in the jsonld -- in valueConstraints -->
    <datepicker v-model="input"></datepicker>
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
    onSubmit(e) {
      e.preventDefault();
      // this emit needs to be called whenever the input changes.
      this.$emit('valueChanged', this.input);
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
      input: new Date(2016, 9, 16),
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
