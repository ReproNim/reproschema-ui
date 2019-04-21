<template>
  <div :class="rootClass">
    <ul :class="rootClass + '__wrapper'">

      <li v-for="(dataImage, index) in dataImagesLocal" :key="index"
        :class="rootClass + '__item'">

        <div
          :class="classThumbnail[index]"
          @click="onSelectImage(dataImage)"
          v-if="!isMultiple">
          <img :src="dataImage.src"
               :alt="dataImage.alt"
               :height="h"
               :width="w"
               :class="rootClass + '__img'">

          <label v-if="useLabel"
                :class="rootClass + '__lbl'">
                {{dataImage.alt}}
          </label>
        </div>

        <div
          :class="classThumbnailMultiple(dataImage.id)"
          @click="onSelectMultipleImage(dataImage)"
          v-if="isMultiple">

          <img :src="dataImage.src"
               :alt="dataImage.alt"
               :height="h"
               :width="w"
               :class="rootClass + '__img'">

          <label v-if="useLabel"
                :class="rootClass + '__lbl'">
                {{dataImage.alt}}
          </label>
        </div>

      </li>
    </ul>
  </div>
</template>

<script>
import _ from 'lodash';
/* eslint-disable */
export default {
  name: 'vue-select-image',
  props: {
    dataImages: {
      type: Array,
      default: () => []
    },
    selectedImages: {
      type: Array,
      default: () => []
    },
    isMultiple: {
      type: Boolean,
      default: false
    },
    useLabel: {
      type: Boolean,
      default: false
    },
    rootClass: {
      type: String,
      default: 'vue-select-image'
    },
    activeClass: {
      type: String,
      default: '--selected'
    },
    h: {
      type: String,
      default: 'auto'
    },
    w: {
      type: String,
      default: 'auto'
    }
  },
  data () {
    return {
      singleSelected: {
        id: ''
      },
      multipleSelected: []
    }
  },
  watch: {
    // selectedImages() {
    //   this.setInitialSelection();
    // },
  },
  computed: {
    dataImagesLocal: function () {
      return this.dataImages || []
    },
    classThumbnail() {
      return _.map(this.dataImagesLocal, (imageId) => {
        const baseClass = `${this.rootClass}__thumbnail`;
        if (this.singleSelected.id === imageId.id) {
          return `${baseClass} ${baseClass}${this.activeClass}`
        }
        return `${baseClass}`});
    },
  },
  mounted () {
    // set initial selectedImage
    this.setInitialSelection()
  },
  methods: {
    classThumbnailMultiple(id) {
      const baseClass = `${this.rootClass}__thumbnail`
      const baseMultipleClass = `${baseClass} is--multiple`
      if (this.isExistInArray(id)) {
        return `${baseMultipleClass} ${baseClass}${this.activeClass}`
      }
      return `${baseMultipleClass}`
    },
    onSelectImage(objectImage) {
      this.singleSelected = Object.assign({}, this.singleSelected, objectImage)
      this.$emit('onselectimage', objectImage)
    },
    isExistInArray (id) {
      return this.multipleSelected.find((item) => {
        return id === item.id
      })
    },
    removeFromSingleSelected () {
      this.singleSelected = {}
      this.$emit('onselectimage', {})
    },
    removeFromMultipleSelected (id, dontFireEmit) {
      this.multipleSelected = this.multipleSelected.filter((item) => {
        return id !== item.id
      })
      if (!dontFireEmit) {
        this.$emit('onselectmultipleimage', this.multipleSelected)
      }
    },
    resetMultipleSelection () {
      this.multipleSelected = []
    },
    onSelectMultipleImage(objectImage) {
      if (!this.isExistInArray(objectImage.id)) {
        this.multipleSelected.push(objectImage)
      } else {
        this.removeFromMultipleSelected(objectImage.id, true)
      }

      this.$emit('onselectmultipleimage', this.multipleSelected)
    },
    setInitialSelection () {
      if (this.selectedImages) {
        if (!this.isMultiple && this.selectedImages.length === 1) {
            this.singleSelected = Object.assign({}, this.selectedImages[0])
            this.$forceUpdate();
        } else {
          this.multipleSelected = [].concat(this.selectedImages)
        }
      }
    }
  }
}
</script>

<style>

.vue-select-image__wrapper {
  overflow: auto;
  list-style-image: none;
  list-style-position: outside;
  list-style-type: none;
  padding: 0px;
  margin: 0px;
}

.vue-select-image__item {
  margin: 0px 12px 12px 0px;
  float: left;
}

.vue-select-image__thumbnail {
  cursor: pointer;
}

.vue-select-image__thumbnail:hover {
  background: #c7c7c7d0;
  color: white;
}

.vue-select-image__thumbnail{
  padding: 6px;
  border: 1px solid #dddddd;

  display: block;
  padding: 4px;
  line-height: 20px;
  border: 1px solid #ddd;

  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;

  -webkit-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.055);
  -moz-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.055);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.055);

  -webkit-transition: all 0.2s ease-in-out;
  -moz-transition: all 0.2s ease-in-out;
  -o-transition: all 0.2s ease-in-out;
  transition: all 0.2s ease-in-out;
}

.vue-select-image__thumbnail--selected{
  background: #0088cc;
  color: white;
}

.vue-select-image__img{
  -webkit-user-drag: none;
  display: block;
  max-width: 100%;
  margin-right: auto;
  margin-left: auto;
}

.vue-select-image__lbl{
  line-height: 3;
}

@media only screen and (min-width: 1200px) {
  .vue-select-image__item {
    margin-left: 30px;
  }
}
</style>