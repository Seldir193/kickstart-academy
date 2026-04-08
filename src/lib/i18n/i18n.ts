import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import deCommonBase from "../locales/de/common/common.json";
import deBookings from "../locales/de/common/bookings.json";
import deOnlineBookings from "../locales/de/common/online-bookings.json";
import deTraining from "../locales/de/common/training.json";
import deOffers from "../locales/de/common/offers.json";
import deInvoices from "../locales/de/common/invoices.json";
import deCustomers from "../locales/de/common/customers.json";
import deNews from "../locales/de/common/news.json";

import enCommonBase from "../locales/en/common/common.json";
import enBookings from "../locales/en/common/bookings.json";
import enOnlineBookings from "../locales/en/common/online-bookings.json";
import enTraining from "../locales/en/common/training.json";
import enOffers from "../locales/en/common/offers.json";
import enInvoices from "../locales/en/common/invoices.json";
import enCustomers from "../locales/en/common/customers.json";
import enNews from "../locales/en/common/news.json";

import trCommonBase from "../locales/tr/common/common.json";
import trBookings from "../locales/tr/common/bookings.json";
import trOnlineBookings from "../locales/tr/common/online-bookings.json";
import trTraining from "../locales/tr/common/training.json";
import trOffers from "../locales/tr/common/offers.json";
import trInvoices from "../locales/tr/common/invoices.json";
import trCustomers from "../locales/tr/common/customers.json";
import trNews from "../locales/tr/common/news.json";

import deBook from "../locales/de/book.json";
import enBook from "../locales/en/book.json";
import trBook from "../locales/tr/book.json";
import { defaultLanguage } from "./settings";

const resources = {
  de: {
    common: {
      ...deCommonBase,
      ...deBookings,
      ...deOnlineBookings,
      ...deTraining,
      ...deOffers,
      ...deInvoices,
      ...deCustomers,
      ...deNews,
    },
    book: deBook,
  },
  en: {
    common: {
      ...enCommonBase,
      ...enBookings,
      ...enOnlineBookings,
      ...enTraining,
      ...enOffers,
      ...enInvoices,
      ...enCustomers,
      ...enNews,
    },
    book: enBook,
  },
  tr: {
    common: {
      ...trCommonBase,
      ...trBookings,
      ...trOnlineBookings,
      ...trTraining,
      ...trOffers,
      ...trInvoices,
      ...trCustomers,
      ...trNews,
    },
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
// import deBook from "../locales/de/book.json";
// import enBook from "../locales/en/book.json";
// import trBook from "../locales/tr/book.json";
// import { defaultLanguage } from "./settings";

// const resources = {
//   de: {
//     common: deCommon,
//     book: deBook,
//   },
//   en: {
//     common: enCommon,
//     book: enBook,
//   },
//   tr: {
//     common: trCommon,
//     book: trBook,
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
//       ns: ["common", "book"],
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
