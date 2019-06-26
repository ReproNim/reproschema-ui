<template>
  <footer>
    <div>
      <button v-bind:style="{visibility: viewBack}" @click="back">Back</button>
      <button v-if="step < totalSteps" :disabled="!nextEnabled" @click="next">Next</button>
      <button v-if="step >= totalSteps" :disabled="!nextEnabled" 
        @click="submit">{{submitLabel || 'Submit'}}</button>
    </div>
    <div>
      <div class="label">Step {{(step <= totalSteps) ? step : totalSteps}} of {{totalSteps}}</div>
      <div class="meter-holder">
        <div class="metering">
          <div class="progress" ref="progress" v-bind:style="{ width: meterWidth }"></div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "StudyFooter",
  props: {
    step: Number,
    totalSteps: Number,
    nextEnabled: Boolean,
    submitLabel: String,
    doNotAdvanceOnSubmit: Boolean
  },
  computed: {
    meterWidth: function() {
      return (this.step-1) / this.totalSteps * 100 + "%";
    },
    viewBack() {
      return this.step > 1 ? "visible" : "hidden";
    }
  },
  methods: {
    back() {
      this.$emit("back");
    },
    next() {
      this.$emit("next");
    },
    submit() {
      if (this.doNotAdvanceOnSubmit === true) {
        this.$emit("submit");
      } else {
        this.$refs.progress.style.width = "100%";
        setTimeout(() => this.$emit("submit"), 300);
      }
    },
    animateSubmit() {
        this.$refs.progress.style.width = "100%";
        setTimeout(() => this.$emit("animateSubmitDone"), 300);
    }
  }
};
</script>

<style scoped>
footer {
  background-color: #fafafa;
  box-shadow: 0 -2px 4px 0 rgba(0, 0, 0, 0.12);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0.5rem;
}
.label {
  font-size: 0.7rem;
  color: #6c7a89;
  margin-bottom: 0.25rem;
  white-space: nowrap; 
}
footer > div:first-child {
  order: 2;
}
footer > div:last-child {
  order: 1;
  flex: 1;
}
.meter-holder {
  margin-right: 1rem;
}
.metering {
  width: 100%;
  height: 10px;
  border-radius: 0.25rem;
  background-color: #eeeeee;
  position:relative;
}
.progress {
  height: 10px;
  transition: width 0.25s linear;
  border-radius: 0.25rem;
  background-color: #5A478F;
  position: absolute;
  top:0; bottom: 0; left: 0; right: 0;
}
button {
  font-size: 1rem;
  margin: 0;
  padding: 0.25rem 2rem;
  border-radius: 100px;
  background-color: #F5B33C;
  transition: opacity 0.1s linear;
  font-weight: bold;
}
button:disabled {
  opacity: 0.5;
}
@media screen and (max-width: 50em) {
  footer {
    display: block;
  }
  footer > div {
    width: 100%;
  }
  footer div:first-child {
    text-align: center;
    margin-bottom: .25rem;
  }
  footer div:last-child {
    padding-left: 0;
    display: flex;
    align-items: center;
  }
  .meter-holder {
    margin-left: 1rem;
    margin-right: 0;
    width: 100%;
  }
  .metering {
    width: 100%;
  }
  .label {
    margin-right: .5rem;
  }
  button {
    font-size: 1.3rem;
  }
  button:last-child {
    margin-left: 2vw;
  }
}
</style>
