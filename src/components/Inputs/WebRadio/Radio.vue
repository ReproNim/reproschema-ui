<template>
  <div class="radioInput container ml-3 pl-3">
    <div v-if="isMultipleChoice">
      <b-form @submit="onSubmit">
        <b-form-group label="">
          <b-form-checkbox-group
            v-model="checkboxSelected"
            stacked
            plain
            class="text-left"
            ref="checkboxbutton"
          >
            <b-form-checkbox
              v-for="opt in options"
              :value="opt.value"
              :key="opt.value"
              class="mb-3"
              >
              {{ opt.text }}
              </b-form-checkbox>
          </b-form-checkbox-group>
        </b-form-group>
        <b-btn type="submit">{{ $t('submit-button')}}</b-btn>
      </b-form>
    </div>
    <div v-else>
      <b-form-group label="" v-if="!isImageSelect">
        <b-form-radio-group
          v-model="selected"
          :options="options"
          stacked
          class="text-left"
          @change="sendData"
          ref="radiobutton"
          style="line-height: 2.5em"
        >
        </b-form-radio-group>
      </b-form-group>
      <div class="text-center" v-else>
        <vue-select-image :dataImages="dataImages"
                          ref="imageSelect"
                          :selectedImages="selectedImages"
                          @onselectimage="onSelectImage"
                          useLabel>
        </vue-select-image>
      </div>
    </div>
  </div>
</template>

<style>
  .vue-select-image__img {
    height: 100px !important;
    width: 100px !important;
  }
  .vue-select-image__wrapper {
    width: fit-content !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
</style>

<script>
import _ from 'lodash';
import VueSelectImage from '../Utils/SelectImage';

export default {
  name: 'radioInput',
  props: ['constraints', 'init', 'selected_language', 'reprotermsUrl'],
  data() {
    return {
      selected: null,
      checkboxSelected: [],
      answerLanguage: this.selected_language,
    };
  },
  components: {
    VueSelectImage,
  },
  computed: {
    options() {
      let text = '';
      return _.map(this.constraints['http://schema.repronim.org/choices'], (v) => {
        const activeValueChoices = _.filter(v['http://schema.org/name'], ac => ac['@language'] === this.selected_language);
        if (!Array.isArray(activeValueChoices) || !activeValueChoices.length) {
          // array does not exist, is not an array, or empty - when selected_language string absent
          text = v['http://schema.org/name'][0]['@value'];
        } else {
          text = activeValueChoices[0]['@value'];
        }
        return {
          text, // ESLint object-shorthand
          value: v['http://schema.repronim.org/value'][0]['@value'],
          image: v['http://schema.org/image'] ? v['http://schema.org/image'][0]['@value'] : null,
        };
      });
    },
    isMultipleChoice() {
      if (this.constraints['http://schema.repronim.org/multipleChoice']) { // checkbox field
        return this.constraints['http://schema.repronim.org/multipleChoice'][0]['@value'];
      } return false; // default to radio
    },
    isImageSelect() {
      return _.filter(this.options, o => o.image).length === this.options.length;
    },
    dataImages() {
      return _.map(this.options, o => ({ src: o.image, id: o.value, alt: o.text }));
    },
    selectedImages() {
      return [this.dataImages[this.selected]];
    },
  },
  watch: {
    // init: {
    //   handler() {
    //     if (this.init != null) {
    //       this.selected = this.init.value;
    //     } else {
    //       this.selected = false;
    //     }
    //   },
    //   deep: true, // this watches all of the changes within an object. init: {value: 1}  not init: 1
    // },
    // selectedImages() {
    //   if (this.selectedImages) {
    //     this.$set(this.$refs.imageSelect.singleSelected, this.selectedImage[0]);
    //   }
    // },
  },
  mounted() {
    if (this.init !== undefined) {
      if (this.init instanceof Array) { // checkbox
        this.checkboxSelected = this.init;
      } else { // radio
        this.selected = this.init;
      }
      if (this.$refs.imageSelect) {
        this.$nextTick(() => {
          if (this.selectedImages[0]) {
            this.$set(this.$refs.imageSelect, 'singleSelected', this.selectedImages[0]);
          }
        });
      }
    }
  },
  methods: {
    onSubmit(e) {
      e.preventDefault();
      this.$emit('valueChanged', this.checkboxSelected);
    },
    sendData(val) {
      this.$emit('valueChanged', val);
    },
    onSelectImage(d) {
      this.selected = d.id;
      this.sendData(d.id);
    },
  },
};

// init --> selected; on radio button change emit(valueChanged) -->
// (in the parent, sets init) --> init has changed
// so then change this.selected = this.init
</script>
