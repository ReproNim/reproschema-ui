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
        <Radio :constraints="valueConstraints"
        :init="init" :selected_language="selected_language" v-on:valueChanged="sendData"/>
    </div>

    <!-- If type is audio -->
    <!-- <div v-else-if="inputType==='audio'">
        <AudioRecord :constraints="valueConstraints" :init="init" v-on:valueChanged="sendData"/>
    </div> -->

    <!-- If type is text -->
    <div v-else-if="inputType==='text'">
        <TextInput :constraints="valueConstraints" :init="init" v-on:valueChanged="sendData"/>
    </div>

    <!-- If type is text -->
    <div v-else-if="inputType==='number'">
        <IntegerInput :constraints="valueConstraints" :init="init" v-on:valueChanged="sendData"/>
    </div>

    <!-- if we don't have a component built for this type, then show an error -->
    <div v-else>
      <b-alert show>
        no input type UI built for "{{inputType}}" yet!
      </b-alert>
    </div>

    <!-- you can skip this question if requiredValue is not true -->
    <div class="row float-right">
      <b-button class="" variant="default" @click="dontKnow">
        Don't Know
      </b-button>
      <b-button class="" variant="default" v-if="!valueConstraints.requiredValue" @click="skip">
        Skip
      </b-button>
    </div>

  </div>
</template>

<style></style>

<script>
import Radio from '../Inputs/WebRadio/';
import AudioRecord from '../Inputs/WebAudioRecord/';
import TextInput from '../Inputs/WebTextInput/';
import IntegerInput from '../Inputs/WebIntegerInput/';

export default {
  name: 'InputSelector',
  props: ['inputType', 'title', 'valueConstraints', 'init', 'selected_language'],
  components: {
    Radio,
    AudioRecord,
    TextInput,
    IntegerInput,
  },
  data() {
    return {

    };
  },
  methods: {
    skip(val) {
      this.$emit('skip', val);
    },
    dontKnow() {
      // this emits an event on the bus with optional 'data' param
      // bus.$emit('resetChild', this.index);
      this.$emit('dontKnow');
    },
    sendData(val) {
      this.$emit('valueChanged', val);
      this.$emit('next');
    },
  },
};
</script>
