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
import deFranchiseLocations from "../locales/de/common/franchise-locations.json";
import deCoaches from "../locales/de/common/coaches.json";
import dePlaces from "../locales/de/common/places.json";
import deDatev from "../locales/de/common/datev.json";
import deRevenue from "../locales/de/common/revenue.json";
import deVoucher from "../locales/de/common/voucher.json";
import deMembers from "../locales/de/common/members.json";
import deHome from "../locales/de/common/home.json";
import deProfile from "../locales/de/common/profile.json";
import deFooter from "../locales/de/common/footer.json";
import deImprint from "../locales/de/common/imprint.json";
import dePrivacy from "../locales/de/common/privacy.json";
import deAgb from "../locales/de/common/agb.json";
import deCoachDialog from "../locales/de/common/coach-dialog.json";
import dePayClient from "../locales/de/common/pay-client.json";
import deWeeklyCancel from "../locales/de/common/weekly-cancel.json";
import deWeeklyContract from "../locales/de/common/weekly-contract.json";
import deWeeklyRevoke from "../locales/de/common/weekly-revoke.json";

import enCommonBase from "../locales/en/common/common.json";
import enBookings from "../locales/en/common/bookings.json";
import enOnlineBookings from "../locales/en/common/online-bookings.json";
import enTraining from "../locales/en/common/training.json";
import enOffers from "../locales/en/common/offers.json";
import enInvoices from "../locales/en/common/invoices.json";
import enCustomers from "../locales/en/common/customers.json";
import enNews from "../locales/en/common/news.json";
import enFranchiseLocations from "../locales/en/common/franchise-locations.json";
import enCoaches from "../locales/en/common/coaches.json";
import enPlaces from "../locales/en/common/places.json";
import enDatev from "../locales/en/common/datev.json";
import enRevenue from "../locales/en/common/revenue.json";
import enVoucher from "../locales/en/common/voucher.json";
import enMembers from "../locales/en/common/members.json";
import enHome from "../locales/en/common/home.json";
import enProfile from "../locales/en/common/profile.json";
import enFooter from "../locales/en/common/footer.json";
import enImprint from "../locales/en/common/imprint.json";
import enPrivacy from "../locales/en/common/privacy.json";
import enAgb from "../locales/en/common/agb.json";
import enCoachDialog from "../locales/en/common/coach-dialog.json";
import enPayClient from "../locales/en/common/pay-client.json";
import enWeeklyCancel from "../locales/en/common/weekly-cancel.json";
import enWeeklyContract from "../locales/en/common/weekly-contract.json";
import enWeeklyRevoke from "../locales/en/common/weekly-revoke.json";

import trCommonBase from "../locales/tr/common/common.json";
import trBookings from "../locales/tr/common/bookings.json";
import trOnlineBookings from "../locales/tr/common/online-bookings.json";
import trTraining from "../locales/tr/common/training.json";
import trOffers from "../locales/tr/common/offers.json";
import trInvoices from "../locales/tr/common/invoices.json";
import trCustomers from "../locales/tr/common/customers.json";
import trNews from "../locales/tr/common/news.json";
import trFranchiseLocations from "../locales/tr/common/franchise-locations.json";
import trCoaches from "../locales/tr/common/coaches.json";
import trPlaces from "../locales/tr/common/places.json";
import trDatev from "../locales/tr/common/datev.json";
import trRevenue from "../locales/tr/common/revenue.json";
import trVoucher from "../locales/tr/common/voucher.json";
import trMembers from "../locales/tr/common/members.json";
import trHome from "../locales/tr/common/home.json";
import trProfile from "../locales/tr/common/profile.json";
import trFooter from "../locales/tr/common/footer.json";
import trImprint from "../locales/tr/common/imprint.json";
import trPrivacy from "../locales/tr/common/privacy.json";
import trAgb from "../locales/tr/common/agb.json";
import trCoachDialog from "../locales/tr/common/coach-dialog.json";
import trPayClient from "../locales/tr/common/pay-client.json";
import trWeeklyCancel from "../locales/tr/common/weekly-cancel.json";
import trWeeklyContract from "../locales/tr/common/weekly-contract.json";
import trWeeklyRevoke from "../locales/tr/common/weekly-revoke.json";

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
      ...deFranchiseLocations,
      ...deCoaches,
      ...dePlaces,
      ...deDatev,
      ...deRevenue,
      ...deVoucher,
      ...deMembers,
      ...deHome,
      ...deProfile,
      ...deFooter,
      ...deImprint,
      ...dePrivacy,
      ...deAgb,
      ...deCoachDialog,
      ...dePayClient,
      ...deWeeklyCancel,
      ...deWeeklyContract,
      ...deWeeklyRevoke,
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
      ...enFranchiseLocations,
      ...enCoaches,
      ...enPlaces,
      ...enDatev,
      ...enRevenue,
      ...enVoucher,
      ...enMembers,
      ...enHome,
      ...enProfile,
      ...enFooter,
      ...enImprint,
      ...enPrivacy,
      ...enAgb,
      ...enCoachDialog,
      ...enPayClient,
      ...enWeeklyCancel,
      ...enWeeklyContract,
      ...enWeeklyRevoke,
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
      ...trFranchiseLocations,
      ...trCoaches,
      ...trPlaces,
      ...trDatev,
      ...trRevenue,
      ...trVoucher,
      ...trMembers,
      ...trHome,
      ...trProfile,
      ...trFooter,
      ...trImprint,
      ...trPrivacy,
      ...trAgb,
      ...trCoachDialog,
      ...trPayClient,
      ...trWeeklyCancel,
      ...trWeeklyContract,
      ...trWeeklyRevoke,
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
