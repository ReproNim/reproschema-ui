import Vue from 'vue';
import VueI18n from 'vue-i18n';
import config from './config';

Vue.use(VueI18n);

function loadLocaleMessages () {
  const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i);
  const messages = {};
  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      if (config.startButton instanceof Object) {
        locales(key)['join-button'] = config.startButton[locale];
      } else {
        locales(key)['join-button'] = config.startButton;
      }
      if (config.banner instanceof Object) {
        locales(key)['banner-message'] = config.banner[locale];
      } else {
        locales(key)['banner-message'] = config.banner;
      }

      messages[locale] = locales(key)
    }
  });
  return messages
}

export default new VueI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || 'en',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: loadLocaleMessages()
})
