<template>
  <div class="radioInput container ml-3 pl-3">
    <div v-if="constraints.multipleChoice">
      <b-alert show variant="warning">
        Multiple Choice radio buttons are not implemented yet!
      </b-alert>
    </div>
    <div v-else>
      <b-form-group label="">
        <b-form-radio-group v-model="selected"
                            :options="options"
                            stacked
                            class="text-left"
                            @change="sendData"
        >
        </b-form-radio-group>
      </b-form-group>
    </div>
  </div>
</template>

<style scoped>
</style>

<script>
import _ from 'lodash';
// import { bus } from '../../main';

export default {
  name: 'radioInput',
  props: ['constraints', 'init', 'selected_language'],
  data() {
    return {
      selected: null,
    };
  },
  computed: {
    options() {
      return _.map(this.constraints['http://schema.org/itemListElement'][0]['@list'], (v) => {
        const activeValueChoices = _.filter(v['http://schema.org/name'], ac => ac['@language'] === this.selected_language);
        return {
          text: activeValueChoices[0]['@value'],
          value: v['http://schema.org/value'][0]['@value'],
        };
      });
    },
  },
  watch: {
    init: {
      handler() {
        if (this.init != null) {
          this.selected = this.init.value;
        } else {
          this.selected = false;
        }
      },
      deep: true,
    },
  },
  mounted() {
    if (this.init) {
      this.selected = this.init.value;
    }
    // console.log(65);
    // bus.$on('resetChild', this.resetChildMethod);
  },
  methods: {
    sendData(val) {
      this.$emit('valueChanged', val);
    },
  },
};
</script>
