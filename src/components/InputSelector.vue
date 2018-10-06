<template>
  <div class="inputContent">

    <p class="lead" v-if="title">
      {{title}}
      <span v-if="valueConstraints.requiredValue" class="text-danger">*</span>
    </p>

    <b-alert variant="danger" show v-else>
      This item does not have a title defined
    </b-alert>

    <div v-if="inputType==='radio'">
        <Radio :constraints="valueConstraints" v-on:valueChanged="sendData"/>
    </div>

    <div v-else>
      <b-alert show>
        no input type UI built for "{{inputType}}" yet!
      </b-alert>
    </div>

    <div class="row float-right">
      <b-button class="" variant="default" v-if="!valueConstraints.requiredValue" @click="skip">
        Skip
      </b-button>
    </div>

  </div>
</template>

<style></style>

<script>
import Radio from './Radio';

export default {
  name: 'InputSelector',
  props: ['inputType', 'title', 'valueConstraints'],
  components: {
    Radio,
  },
  data() {
    return {

    };
  },
  methods: {
    skip() {
      this.$emit('skip');
    },
    sendData(val) {
      this.$emit('valueChanged', val);
      this.skip();
    },
  },
};
</script>
