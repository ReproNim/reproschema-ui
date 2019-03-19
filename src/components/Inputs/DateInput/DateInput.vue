<template>
  <div class="DateInput">
    testing
    <DateInput :value="input" name="uniquename"></DateInput>
    <!--<b-btn type="submit">Submit</b-btn>-->
  </div>
</template>

<script>
import Datepicker from 'vuejs-datepicker';

export default {
  name: 'DateInput',
  props: ['constraints', 'init'],
  components: {
    DateInput: Datepicker,
  },
  methods: {
    onSubmit(e) {
      e.preventDefault();
      this.$emit('valueChanged', this.input);
    },
  },
  data() {
    return {
      input: new Date(2016, 9, 16),
    };
  },
  mounted() {
    if (this.init) {
      this.input = this.init;
    }
  },
};
</script>
