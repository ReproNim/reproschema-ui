<template>
  <div class="radioInput container ml-3 pl-3">
    <div v-if="constraints.multipleChoice">
      <b-form @submit="onSubmit">
        <b-form-group label="">
          <b-form-checkbox-group
            v-model="checkboxSelected"
            :options="options"
            stacked
            class="text-left"
            ref="checkboxbutton"
          ></b-form-checkbox-group>
        </b-form-group>
        <b-btn type="submit">Submit</b-btn>
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
  props: ['constraints', 'init', 'selected_language'],
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
      // console.log(64, this.constraints['http://schema.org/itemListElement'][0]['@list']);
      return _.map(this.constraints['http://schema.org/itemListElement'][0]['@list'], (v) => {
        const activeValueChoices = _.filter(v['http://schema.org/name'], ac => ac['@language'] === this.selected_language);
        if (!Array.isArray(activeValueChoices) || !activeValueChoices.length) {
          // value not present for the selected_language hence
          // select value in default language
          text = v['http://schema.org/name'][0]['@value'];
          // this.$store.dispatch('setAnsweredLanguage', v['http://schema.org/name'][0]['@language']);
        } else {
          text = activeValueChoices[0]['@value'];
          // this.$store.dispatch('setAnsweredLanguage', this.selected_language);
        }
        return {
          text, // ESLint object-shorthand
          value: v['http://schema.org/value'][0]['@value'],
          image: v['http://schema.org/image'] ? v['http://schema.org/image'][0]['@value'] : null,
        };
      });
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
    init: {
      handler() {
        if (this.init != null) {
          this.selected = this.init.value;
        } else {
          this.selected = false;
        }
      },
      deep: true, // this watches all of the changes within an object. init: {value: 1}  not init: 1
    },
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
