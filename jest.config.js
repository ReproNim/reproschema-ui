module.exports = {
  preset: "@vue/cli-plugin-unit-jest",
  // Used to avoid JEST trying to parse .css files as JavaScript
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "vue"],
  moduleNameMapper: {
    ".+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2|gif)$": "identity-obj-proxy"
  },
  transform: {
    ".*\\.(vue)$": "vue-jest",
    ".*\\.(js)$": "babel-jest"
  }
};
