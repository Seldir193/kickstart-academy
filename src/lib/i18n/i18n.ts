import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import deCommon from "../locales/de/common.json";
import enCommon from "../locales/en/common.json";
import trCommon from "../locales/tr/common.json";
import deBook from "../locales/de/book.json";
import enBook from "../locales/en/book.json";
import trBook from "../locales/tr/book.json";
import { defaultLanguage } from "./settings";

const resources = {
  de: {
    common: deCommon,
    book: deBook,
  },
  en: {
    common: enCommon,
    book: enBook,
  },
  tr: {
    common: trCommon,
    book: trBook,
  },
};

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: defaultLanguage,
      supportedLngs: ["de", "en", "tr"],
      ns: ["common", "book"],
      defaultNS: "common",
      detection: {
        order: ["localStorage", "navigator"],
        caches: ["localStorage"],
      },
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18n;

// import i18n from "i18next";
// import LanguageDetector from "i18next-browser-languagedetector";
// import { initReactI18next } from "react-i18next";

// import deCommon from "../locales/de/common.json";
// import enCommon from "../locales/en/common.json";
// import trCommon from "../locales/tr/common.json";
// import { defaultLanguage } from "./settings";

// const resources = {
//   de: {
//     common: deCommon,
//   },
//   en: {
//     common: enCommon,
//   },
//   tr: {
//     common: trCommon,
//   },
// };

// if (!i18n.isInitialized) {
//   i18n
//     .use(LanguageDetector)
//     .use(initReactI18next)
//     .init({
//       resources,
//       fallbackLng: defaultLanguage,
//       supportedLngs: ["de", "en", "tr"],
//       ns: ["common"],
//       defaultNS: "common",
//       detection: {
//         order: ["localStorage", "navigator"],
//         caches: ["localStorage"],
//       },
//       interpolation: {
//         escapeValue: false,
//       },
//       react: {
//         useSuspense: false,
//       },
//     });
// }

// export default i18n;
