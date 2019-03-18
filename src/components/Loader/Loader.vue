<template>
  <div class="layer-preloader">
    <div class="loading">
      <div class="loader firstColor">
        <div class="loader secondColor">
          <div class="loader thirdColor"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* @vikttor_  */
/* Loading SASS */
.layer-preloader {
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.85);
  top: 0;
  left: 0;
  z-index: 999;
}

.loading {
  position: relative;
  display: block;
  height: 100%;
}
.loading .loader {
  position: absolute;
  display: block;
  left: calc(50% - 75px);
  top: calc(50% - 75px);
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 4px solid transparent;
  animation: loading 2s;
  -webkit-animation: loading 2s;
  position: absolute;
  animation-iteration-count: infinite;
  -webkit-animation-iteration-count: infinite;
  animation-timing-function: linear;
}
.loading .loader.firstColor {
  border-top-color: #830025;
}
.loading .loader.secondColor {
  border-top-color: #f24f77;
  left: 7px;
  width: 127px;
  height: 127px;
  top: 7px;
}
.loading .loader.thirdColor {
  border-top-color: #c9c9c9;
  left: 8px;
  width: 103px;
  height: 103px;
  top: 8px;
}

@-webkit-keyframes loading {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes loading {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
/* ENDA Loading */

</style>

<script>
export default {

};
</script>
