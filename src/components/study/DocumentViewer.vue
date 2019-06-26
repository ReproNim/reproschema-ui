<template>
  <div class="consent-viewer">
    <div ref="consentDoc" class="consent-doc">
      <slot></slot>
    </div>
    <div class="consent-max">
      <div ref="minMaxControl" @mousedown="toggleMax" class="min-max-control opener"></div>
    </div>
  </div>
</template>

<script>

function makeHighlighter(target) {
  target = target || document.body
  return function(newVal, oldVal) {
    if (oldVal) {
      var oldEl = target.querySelector("."+oldVal)
      if (oldEl) {
        oldEl.classList.remove("highlighted")
      }
    }
    var newEl = target.querySelector("."+newVal)
    if (newEl) {
      newEl.classList.add("highlighted")
      newEl.scrollIntoView({ behavior: "smooth", alignToTop: true })
    }
  }
}

export default {
  name: "DocumentViewer",
  components: { /*ConsentContent*/ },
  props: ["highlightId"],
  data() {
    return {
      selectedId: ""
    };
  },
  watch: {
    highlightId: makeHighlighter()
  },
  methods: {
    toggleMax() {
      var div = document.createElement("div");
      div.classList.add("maximized");
      var toggle = document.createElement("div");
      toggle.classList.add("min-max-control");
      toggle.classList.add("closer");
      toggle.addEventListener(
        "mousedown",
        function() {
          div.parentNode.removeChild(div);
        },
        false
      );
      div.appendChild(toggle);
      div.appendChild(this.$refs.consentDoc.cloneNode(true));
      document.body.appendChild(div);

      let highlighter = makeHighlighter(div)
      highlighter(this.highlightId)
    }
  }
};
</script>

<style scoped>
.consent-viewer {
  overflow: hidden;
  position: relative;
  height: 100%;
}
.consent-doc {
  padding: 0;
  font-size: .8rem;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}
.consent-viewer h2 {
  margin-top: 0;
}
</style>
