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

export default {
  name: 'radioInput',
  props: ['constraints', 'init'],
  data() {
    return {
      selected: null,
    };
  },
  computed: {
    options() {
      /* eslint-disable */
      return _.map(this.constraints.literals, (v) => {
        return {
          text: v.label,
          value: v['@value'],
        };
      });
      /* eslint-ensable */
    },
  },
  watch: {
    init: {
      handler() {
        if (this.init) {
          this.selected = this.init.value;
        }
      },
      deep: true,
    }
  },
  mounted() {
    if (this.init) {
      this.selected = this.init.value;
    }
  },
  methods: {
    sendData(val) {
      this.$emit('valueChanged', val);
    },
  }
};
</script>
