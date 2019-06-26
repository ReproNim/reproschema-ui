<template>
  <div class="consent-viewer">
    <div ref="consentDoc" class="consent-doc">
      <section class="preamble-section">
        <div class="preamble container">
          <div>
            <h2>mPower 2.0</h2>
            <h3>Consent Signature</h3>
          </div>
        </div>
      </section>
      <section></section> <!-- flip zebra striping -->
      <section>
        <div class="assertion container">
          <div>I know and agree that:</div>
        </div>
      </section>
      <section>
        <div class="will-use container">
          <object data="/static/images/Step1.svg" type="image/svg+xml"></object>
          <div>I will use the mPower app to answer questions and do short physical and cognitive activities. The app will help me track my symptoms, triggers and medications.</div>
        </div>
      </section>
      <section>
        <div class="privacy container">
          <object data="/static/images/Step2.svg" type="image/svg+xml"></object>
          <div>My study data and personal information (Data) will be encrypted and transferred from my phone. It will be stored in Sage Bionetworks’ secure cloud-based database.</div>
        </div>
      </section>
      <section>
        <div class="research container">
          <object data="/static/images/Step3.svg" type="image/svg+xml"></object>
          <div>My Data will be used for research as described in the study information.</div>
        </div>
      </section>
      <section>
        <div class="sharing-scope container">
          <object data="/static/images/Step4.svg" type="image/svg+xml"></object>
          <div>I have the option to share my coded study data for future research. It is up to me. I can say yes or no.</div>
        </div>
      </section>
      <section>
        <div class="risks-benefits container">
          <object data="/static/images/Step5.svg" type="image/svg+xml"></object>
          <div>The main risk of participating in mPower study is to my privacy. This is risk is low but not zero. The main benefit is seeing my trends over time.</div>
        </div>
      </section>
      <section>
        <div class="not-medical container">
          <object data="/static/images/Step6.svg" type="image/svg+xml"></object>
          <div>I will not get paid for participating in this study. I will not receive any profit from use of my Data in this or future research study.</div>
        </div>
      </section>
      <section>
        <div class="unpaid container">
          <object data="/static/images/Step7.svg" type="image/svg+xml"></object>
          <div>mPower is a research study. The mPower app shouldn’t be used for diagnosis or treatment decisions.</div>
        </div>
      </section>
      <section>
        <div class="voluntary container">
          <object data="/static/images/Step8.svg" type="image/svg+xml"></object>
          <div>I can withdraw (quit) at any time for any reason. There is no penalty if I withdraw.</div>
        </div>
      </section>
    </div>
    <!--
    <div class="consent-max">
      <div @mousedown="toggleMax" class="min-max-control opener"></div>
    </div>
    -->
  </div>
</template>

<script>
export default {
  name: "ConsentSummaryViewer",
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
  font-size: 1rem;
  height: 100%;
  overflow: hidden;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
}
.container {
  padding: .75rem;
}
.consent-doc h2, .consent-doc h3 {
  text-align: left;
}
.container {
  box-sizing: border-box;
}
.preamble-section {
  background-color: #51417b;
}
.preamble h2, .preamble h3 {
  color: white;
  margin: 0;
}
.preamble.container object {
  width: 7rem;
  height: 7rem;
  margin-bottom: -1rem;
  margin-top: -1rem;
  margin-left: 0rem;
}
.container {
  display: flex;
  align-items: center;
  justify-content: center;
}
.container object {
  width: 4rem;
  height: 4rem;
  margin-left: .75rem;
}
.container div {
  flex: 1;
  padding-left: .75rem;
  padding-right: .5rem;
}
.assertion {
  color: #51417B;
  padding-left: 0;
}
</style>
