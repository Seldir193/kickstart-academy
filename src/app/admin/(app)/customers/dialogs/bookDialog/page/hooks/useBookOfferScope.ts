import { useEffect, useMemo, useState } from "react";
import {
  GROUPED_COURSE_OPTIONS,
  offerMatchesCourse,
} from "@/app/lib/courseOptions";
import type { Offer } from "../../../../types";
import {
  fmtDE,
  fmtEUR,
  getOfferScheduleLabel,
  getOfferScheduleLine,
  isNum,
  isWeeklyOffer,
} from "../../bookDialogFormatters";
import { useBookDialogOffers } from "../../hooks/useBookDialogOffers";
import {
  getBookDialogOfferKind,
  holidayFromOf,
  holidayToOf,
  resolveHolidayLabel,
} from "../lib/offerKind";
import { safeText } from "../lib/text";
import type { BookOfferScope, TFunc } from "../types";

export function useBookOfferScope(t: TFunc, language: string): BookOfferScope {
  const base = useOfferBaseState();
  const remote = useBookDialogOffers();
  const derived = useOfferDerivedState(remote.offers, base, t, language);
  useEnsureSelectedOffer(base, derived.ensuredOfferId);
  return { ...remote, ...base, ...derived };
}

function useOfferBaseState() {
  const [courseValue, setCourseValue] = useState("");
  const [selectedOfferId, setSelectedOfferId] = useState("");
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  return {
    courseValue,
    setCourseValue,
    selectedOfferId,
    setSelectedOfferId,
    selectedDate,
    setSelectedDate,
  };
}

function useOfferDerivedState(
  offers: Offer[],
  base: ReturnType<typeof useOfferBaseState>,
  t: TFunc,
  language: string,
) {
  const filteredOffers = useMemo(
    () => offers.filter((offer) => offerMatchesCourse(base.courseValue, offer)),
    [offers, base.courseValue],
  );
  const selectedOffer = useSelectedOffer(filteredOffers, base.selectedOfferId);
  const labels = useOfferLabels(filteredOffers, base, t, language);
  const details = useOfferDetails(selectedOffer, t, language);
  return { filteredOffers, selectedOffer, ...labels, ...details };
}

function useSelectedOffer(filteredOffers: Offer[], selectedOfferId: string) {
  return useMemo(
    () => filteredOffers.find((offer) => offer._id === selectedOfferId) || null,
    [filteredOffers, selectedOfferId],
  );
}

function useOfferLabels(
  filteredOffers: Offer[],
  base: ReturnType<typeof useOfferBaseState>,
  t: TFunc,
  language: string,
) {
  const ensuredOfferId = useMemo(
    () => ensuredOffer(filteredOffers, base.selectedOfferId),
    [filteredOffers, base.selectedOfferId],
  );
  const selectedCourseLabel = useMemo(
    () => courseLabel(base.courseValue, t),
    [base.courseValue, t],
  );
  const selectedOfferLabel = useMemo(
    () => offerLabel(filteredOffers, base.selectedOfferId, t, language),
    [filteredOffers, base.selectedOfferId, language, t],
  );
  return { ensuredOfferId, selectedCourseLabel, selectedOfferLabel };
}

function useOfferDetails(
  selectedOffer: Offer | null,
  t: TFunc,
  language: string,
) {
  const isWeekly = useMemo(() => isWeeklyOffer(selectedOffer), [selectedOffer]);
  const offerKind = useMemo(
    () => getBookDialogOfferKind(selectedOffer),
    [selectedOffer],
  );
  const scheduleLine = useMemo(
    () => getOfferScheduleLine(selectedOffer),
    [selectedOffer],
  );
  const scheduleLabel = useMemo(
    () => getOfferScheduleLabel(selectedOffer),
    [selectedOffer],
  );
  return {
    isWeekly,
    ...kindFlags(offerKind),
    scheduleLine,
    scheduleLabel,
    ...holidayDetails(selectedOffer, t, language, isWeekly, scheduleLine),
  };
}

function useEnsureSelectedOffer(
  base: ReturnType<typeof useOfferBaseState>,
  ensuredOfferId: string,
) {
  useEffect(() => {
    if (ensuredOfferId !== base.selectedOfferId)
      base.setSelectedOfferId(ensuredOfferId);
  }, [ensuredOfferId, base.selectedOfferId]);
}

function ensuredOffer(filteredOffers: Offer[], selectedOfferId: string) {
  if (!filteredOffers.length) return "";
  return filteredOffers.some((offer) => offer._id === selectedOfferId)
    ? selectedOfferId
    : filteredOffers[0]._id;
}

function courseLabel(courseValue: string, t: TFunc) {
  if (!courseValue) return t("common.admin.customers.bookDialog.allCourses");
  return (
    GROUPED_COURSE_OPTIONS.flatMap((group) => group.items).find(
      (option) => option.value === courseValue,
    )?.label || t("common.admin.customers.bookDialog.allCourses")
  );
}

function offerLabel(
  filteredOffers: Offer[],
  selectedOfferId: string,
  t: TFunc,
  language: string,
) {
  if (!filteredOffers.length)
    return t("common.admin.customers.bookDialog.noOffersInSelection");
  const found =
    filteredOffers.find((offer) => offer._id === selectedOfferId) ||
    filteredOffers[0];
  return [
    found.title || "—",
    isNum(found.price) ? fmtEUR(found.price, language) : undefined,
  ]
    .filter(Boolean)
    .join(" — ");
}

function kindFlags(offerKind: string) {
  return {
    isCamp: offerKind === "camp",
    isPowertraining: offerKind === "powertraining",
    isOneTimeVoucherOffer: offerKind === "one_time",
  };
}

function holidayDetails(
  selectedOffer: Offer | null,
  t: TFunc,
  language: string,
  isWeekly: boolean,
  scheduleLine: string,
) {
  return {
    regularCourseLine: safeText(scheduleLine).replace(/^jeden\s+/i, ""),
    weeklyHolidayNotice: isWeekly
      ? t("common.admin.customers.bookDialog.weeklyHolidayNotice")
      : "",
    holidayLabel: resolveHolidayLabel(selectedOffer),
    holidayRange: holidayRange(selectedOffer, language),
  };
}

function holidayRange(selectedOffer: Offer | null, language: string) {
  const from = safeText(holidayFromOf(selectedOffer))
    ? fmtDE(safeText(holidayFromOf(selectedOffer)), language)
    : "";
  const to = safeText(holidayToOf(selectedOffer))
    ? fmtDE(safeText(holidayToOf(selectedOffer)), language)
    : "";
  if (!from && !to) return "";
  return from && to ? `${from} – ${to}` : from || to;
}
