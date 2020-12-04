import Vue from 'vue';
import VueI18n from 'vue-i18n';
import config from './config';

Vue.use(VueI18n);

function loadLocaleMessages () {
  const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i);
  console.log(8, locales.keys());
  const messages = {};
  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    console.log(12, matched);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      console.log(15, key, locale, locales(key));
      locales(key)['join-button'] = config.startButton[locale];
      locales(key)['banner-message'] = config.banner[locale];
      messages[locale] = locales(key)
    }
  });
  console.log(17, messages);
  return messages
}

export default new VueI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || 'en',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: loadLocaleMessages()
})
