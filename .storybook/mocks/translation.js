const nestedGet = require("lodash.get");
const translations = require("../../private/translations/locales/en/translation.en.i18n.json");

const translate = translationId => {
  return nestedGet(translations, translationId) || "missing!! add : " +translationId ;
};

module.exports = {
  TAPi18n: {
    __: translate
  }
};
