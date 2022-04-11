import i18n from "i18next";
import { initReactI18next } from "react-i18next";
// eslint-disable-next-line import/no-namespace
import * as Sentry from "@sentry/react";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "../../../../public/locales/en/translation.en.i18n.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    fallbackLng: "en",
    defaultNS: "translation",
    debug: true,
    lng: "en",
    resources: { en: { translation: en } },

    keySeparator: ".", // we do not use keys in form messages.welcome
    interpolation: {
      escapeValue: false // react already safes from xss
    },
    react: {
      bindI18n: "languageChanged",
      bindI18nStore: "",
      transEmptyNodeValue: "",
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ["b", "br", "strong", "i"],
      useSuspense: true
    },
    saveMissing: true,

    // Method triggered client-side when a token is missing
    // It will still respect your fallback language,
    // but let you add a side-effect like calling Sentry
    missingKeyHandler: (
      ngs,
      ns,
      key,
      fallbackValue,
      updateMissing,
      options
    ) => {
      Sentry.captureException(
        new Error(
          `i18n: Missing ${ns} for key: ${key} in lng : ${ngs.join(",")}`
        ),
        {
          extra: { ngs, ns, key, fallbackValue, updateMissing, options }
        }
      );
    }

    // I don't get it working:
    // backend: {
    //   // for all available options read the backend's repository readme file
    //   loadPath: "/i18n/{{ns}}.{{lng}}.i18n.json"
    // }
  });

export default i18n;
