<template>
  <div class="inputContent">

    <p class="lead" v-if="title">
      {{title}}
      <span v-if="valueConstraints.requiredValue" class="text-danger">*</span>
    </p>

    <b-alert variant="danger" show v-else>
      This item does not have a title defined
    </b-alert>

    <!-- If type is radio -->
    <div v-if="inputType==='radio'">
        <Radio :constraints="valueConstraints" v-on:valueChanged="sendData"/>
    </div>

    <!-- If type is audio -->
    <div v-else-if="inputType==='audio'">
        <AudioRecord :constraints="valueConstraints" v-on:valueChanged="sendData"/>
    </div>

    <!-- if we don't have a component built for this type, then show an error -->
    <div v-else>
      <b-alert show>
        no input type UI built for "{{inputType}}" yet!
      </b-alert>
    </div>

    <!-- you can skip this question if requiredValue is not true -->
    <div class="row float-right">
      <b-button class="" variant="default" v-if="!valueConstraints.requiredValue" @click="skip(1)">
        Skip
      </b-button>
    </div>

  </div>
</template>

<style></style>

<script>
import Radio from './Radio';
import AudioRecord from './Audio';

export default {
  name: 'InputSelector',
  props: ['inputType', 'title', 'valueConstraints'],
  components: {
    Radio,
    AudioRecord,
  },
  data() {
    return {

    };
  },
  methods: {
    skip(val) {
      this.$emit('skip', val);
    },
    sendData(val) {
      this.$emit('valueChanged', val);
      this.skip(0);
    },
  },
};
</script>
