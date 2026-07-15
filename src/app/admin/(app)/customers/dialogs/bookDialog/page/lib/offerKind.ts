import type { Offer } from "../../../../types";
import type { OfferKind } from "../types";
import { normalizeKey, safeText } from "./text";

export function getBookDialogOfferKind(offer: Offer | null): OfferKind {
  if (isCampOffer(offer)) return "camp";
  if (isPowertrainingOffer(offer)) return "powertraining";
  if (isOneTimeOffer(offer)) return "one_time";
  return "default";
}

export function resolveHolidayLabel(offer: Offer | null) {
  return (
    getOfferField(offer, holidayLabelKeys()) ||
    findOfferValueByPatterns(offer, ["holiday"], ["from", "to", "date"]) ||
    findOfferValueByPatterns(offer, ["ferien"], ["von", "bis", "datum"]) ||
    ""
  );
}

export function holidayFromOf(offer: Offer | null) {
  return (
    getOfferField(offer, [
      "holidayDateFrom",
      "holidayFrom",
      "dateFrom",
      "startDate",
      "ferienVon",
      "ferienStart",
    ]) || findOfferValueByPatterns(offer, ["holiday", "from"])
  );
}

export function holidayToOf(offer: Offer | null) {
  return (
    getOfferField(offer, [
      "holidayDateTo",
      "holidayTo",
      "dateTo",
      "endDate",
      "ferienBis",
      "ferienEnde",
    ]) || findOfferValueByPatterns(offer, ["holiday", "to"])
  );
}

function isCampOffer(offer: Offer | null) {
  const values = offerValues(offer);
  if (isExcludedCampCategory(values)) return false;
  if (
    values.subType.includes("clubprogram") ||
    values.subType.includes("rentacoach")
  )
    return false;
  if (
    values.subType.includes("coacheducation") ||
    values.subType.includes("powertraining")
  )
    return false;
  return (
    values.category === "holiday" ||
    values.category === "holidayprograms" ||
    values.type === "camp" ||
    values.legacyType === "camp" ||
    values.title.includes("camp")
  );
}

function isPowertrainingOffer(offer: Offer | null) {
  const values = offerValues(offer);
  if (values.category === "clubprograms" || values.category === "rentacoach")
    return false;
  return (
    values.type.includes("powertraining") ||
    values.subType.includes("powertraining") ||
    values.legacyType.includes("powertraining") ||
    values.title.includes("powertraining")
  );
}

function isOneTimeOffer(offer: Offer | null) {
  const category = safeText((offer as any)?.category);
  const subType = safeText((offer as any)?.sub_type).toLowerCase();
  return (
    category === "RentACoach" ||
    category === "ClubPrograms" ||
    category === "Individual" ||
    subType.includes("clubprogram") ||
    subType.includes("rentacoach") ||
    subType.includes("coacheducation")
  );
}

function offerValues(offer: Offer | null) {
  return {
    category: safeText((offer as any)?.category).toLowerCase(),
    type: safeText((offer as any)?.type).toLowerCase(),
    subType: safeText((offer as any)?.sub_type).toLowerCase(),
    legacyType: safeText((offer as any)?.legacy_type).toLowerCase(),
    title: safeText((offer as any)?.title).toLowerCase(),
  };
}

function isExcludedCampCategory(values: ReturnType<typeof offerValues>) {
  return (
    values.category === "clubprograms" ||
    values.category === "rentacoach" ||
    values.category === "individual"
  );
}

function getOfferField(offer: Offer | null, keys: string[]) {
  const direct = directOfferField(offer, keys);
  return direct || fuzzyOfferField(offer, keys);
}

function directOfferField(offer: Offer | null, keys: string[]) {
  const src = (offer || {}) as Record<string, unknown>;
  for (const key of keys) if (safeText(src[key])) return safeText(src[key]);
  return "";
}

function fuzzyOfferField(offer: Offer | null, keys: string[]) {
  const wanted = new Set(keys.map(normalizeKey));
  for (const [key, raw] of Object.entries(
    (offer || {}) as Record<string, unknown>,
  ))
    if (wanted.has(normalizeKey(key)) && safeText(raw)) return safeText(raw);
  return "";
}

function findOfferValueByPatterns(
  offer: Offer | null,
  include: string[],
  exclude: string[] = [],
) {
  for (const [key, raw] of Object.entries(
    (offer || {}) as Record<string, unknown>,
  ))
    if (matchesPatterns(key, raw, include, exclude)) return safeText(raw);
  return "";
}

function matchesPatterns(
  key: string,
  raw: unknown,
  include: string[],
  exclude: string[],
) {
  const normalized = normalizeKey(key);
  return (
    Boolean(safeText(raw)) &&
    include.map(normalizeKey).every((part) => normalized.includes(part)) &&
    !exclude.map(normalizeKey).some((part) => normalized.includes(part))
  );
}

function holidayLabelKeys() {
  return [
    "holidayWeekName",
    "holidayLabel",
    "holidayWeek",
    "holiday_name",
    "holidayName",
    "holiday",
    "ferien",
    "ferienName",
    "ferienLabel",
    "holiday_title",
    "holidayTitle",
  ];
}
