<template>
  <div class="radio-holder">
    <!-- the mdc radio control had a couple of issues, so I've pulled out the HTML/CSS -->
    <div class="mdc-radio">
      <input class="mdc-radio__native-control" @change="sendEvent"
        type="radio" :id="id" :value="value" :name="name">
      <div class="mdc-radio__background">
        <div class="mdc-radio__outer-circle"></div>
        <div class="mdc-radio__inner-circle"></div>
      </div>
    </div>
    <label :id="labelId" :for="id" :style="{color: color}"><slot></slot></label>
  </div>
</template>

<script>
export default {
  name: 'RadioButton',
  props: ['name','value','color'],
  data() {
    return {
    }
  },
  methods: {
    sendEvent(e) {
      this.$emit('change', e.target.name, e.target.value)
    }
  },
  computed: {
    id: function() {
      return this.name + '-' + this.value.toLowerCase()
    },
    labelId: function() {
      return this.name + '-label-' + this.value.toLowerCase()
    }
  }
}
</script>

<style scoped>
.radio-holder {
  display: flex;
  align-items: center;
  margin-bottom: .25rem;
}
.radio-holder label {
  font-size: .9rem;
  padding-left: .4rem;
  cursor: pointer;
}
.mdc-radio__outer-circle {
  border-color: #5A478F!important;
}
.mdc-radio__inner-circle {
  background-color: #402D72!important;
}

</style>