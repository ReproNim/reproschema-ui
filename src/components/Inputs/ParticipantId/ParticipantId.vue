<template>
  <div class="participantId">
    <b-form @submit="onSubmit">
      <b-form-group>
        <b-form-input v-model="input">
        </b-form-input>
      </b-form-group>
      <b-btn type="submit">{{ $t('submit-button')}}</b-btn>
    </b-form>
  </div>
</template>

<style>
</style>

<script>
import { v4 as uuidv4 } from 'uuid';

export default {
  name: 'ParticipantId',
  props: ['constraints', 'init'],
  methods: {
    onSubmit(e) {
      e.preventDefault();
      // console.log(25, 'submit', this.input);
      this.$emit('valueChanged', this.input);
    },
  },
  data() {
    return {
      input: '',
      p_uuid: '',
    };
  },
  computed: {
    getPId() {
      return this.$store.getters.getParticipantId;
    },
  },
  mounted() {
    if (this.getPId) {
      // console.log(43, 'store uuid ', this.getPId);
      this.input = this.getPId;
    } else {
      this.p_uuid = uuidv4();
      this.input = this.p_uuid; // initialize with the default uuid
    }
    if (this.init) {
      this.input = this.init;
    }
  },
};
</script>
