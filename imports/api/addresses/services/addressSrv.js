import countries from "i18n-iso-countries";

// register all locales you want (add a file e.g. fr, etc)
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

export const addressSrv = {
  countryName(countryCode) {
    return countries.getName(countryCode.toUpperCase(), "en");
  }
};
