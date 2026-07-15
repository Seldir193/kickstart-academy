import type { Booking } from "../../types";
import { formatDateOnlyDE } from "../../utils";
import type { MessageRow, Translate } from "../types";
import {
  buildKindLine,
  fallbackCampRange,
  goalkeeperLabel,
  row,
} from "./formatters";
import { messageToLines, splitLabelValue, toLabelMap } from "./messageLines";
import { hasRealValue, pickValue, safeText } from "./text";

type BookingMessageMeta = NonNullable<Booking["meta"]> & {
  holidayType?: unknown;
  holidayLabel?: unknown;
  mainTShirtSize?: unknown;
  mainGoalkeeperSchool?: unknown;
  childBirthDate?: string | null;
  voucher?: unknown;
  source?: unknown;
  siblingGender?: unknown;
  siblingBirthDate?: string | null;
  siblingFirstName?: unknown;
  siblingLastName?: unknown;
  siblingTShirtSize?: unknown;
  siblingGoalkeeperSchool?: unknown;
};

const META = (booking: Booking) => (booking?.meta ?? {}) as BookingMessageMeta;

export function buildHolidayRows(t: Translate, lang: string, booking: Booking) {
  const lines = messageToLines(booking.message);
  const map = toLabelMap(lines);
  const kind = detectHolidayKind(booking);
  if (kind === "camp") return buildCampRows(t, lang, map, booking);
  if (kind === "powertraining") return buildPowerRows(t, lang, map, booking);
  return buildFallbackRows(t, lines);
}

function detectHolidayKind(booking: Booking) {
  const haystack = buildHolidayHaystack(booking);
  if (haystack.includes("powertraining")) return "powertraining";
  if (haystack.includes("camp")) return "camp";
  return "holiday";
}

function buildHolidayHaystack(booking: Booking) {
  return [
    booking.offerType,
    booking.offerTitle,
    booking.message,
    META(booking).holidayType,
  ]
    .map(safeText)
    .join(" ")
    .toLowerCase();
}

function buildCampRows(
  t: Translate,
  lang: string,
  map: Record<string, string>,
  booking: Booking,
) {
  const rows = [...campIntroRows(t), ...campDetailRows(t, lang, map, booking)];
  return hasSiblingBooking(map, booking)
    ? [...rows, ...siblingRows(t, lang, map, booking)]
    : rows;
}

function campIntroRows(t: Translate): MessageRow[] {
  return [holidayRegistrationRow(t)];
}

function campDetailRows(
  t: Translate,
  lang: string,
  map: Record<string, string>,
  booking: Booking,
) {
  return [
    holidayRow(t, map, booking),
    periodRow(t, lang, map, booking),
    childShirtRow(t, map, booking),
    childGoalkeeperRow(t, map, booking),
    siblingBookingRow(t, map, booking),
    childRow(t, map, booking),
    birthDateRow(t, lang, map, booking),
    ...contactRows(t, map, booking),
  ];
}

function holidayRegistrationRow(t: Translate): MessageRow {
  return {
    value: t(
      "common.admin.onlineBookings.dialog.message.holidayProgramRegistration",
    ),
  };
}

function holidayRow(
  t: Translate,
  map: Record<string, string>,
  booking: Booking,
) {
  return row(
    t("common.admin.onlineBookings.dialog.message.holiday"),
    pickValue(map["ferien"], META(booking).holidayLabel),
  );
}

function periodRow(
  t: Translate,
  lang: string,
  map: Record<string, string>,
  booking: Booking,
) {
  return row(
    t("common.admin.onlineBookings.dialog.message.period"),
    pickValue(map["zeitraum"], fallbackCampRange(booking, lang)),
  );
}

function childShirtRow(
  t: Translate,
  map: Record<string, string>,
  booking: Booking,
) {
  return row(
    t("common.admin.onlineBookings.dialog.message.tShirtSizeChild"),
    pickValue(map["t-shirt-größe (kind)"], META(booking).mainTShirtSize),
  );
}

function childGoalkeeperRow(
  t: Translate,
  map: Record<string, string>,
  booking: Booking,
) {
  return row(
    t("common.admin.onlineBookings.dialog.message.goalkeeperSchoolChild"),
    goalkeeperLabel(
      t,
      pickValue(
        map["torwartschule (kind)"],
        META(booking).mainGoalkeeperSchool === true ? "Ja" : "Nein",
      ),
    ),
  );
}

function siblingBookingRow(
  t: Translate,
  map: Record<string, string>,
  booking: Booking,
) {
  const label = hasSiblingBooking(map, booking) ? "yes" : "no";
  return row(
    t("common.admin.onlineBookings.dialog.message.siblingBooking"),
    t(`common.admin.onlineBookings.dialog.${label}`),
  );
}

function childRow(t: Translate, map: Record<string, string>, booking: Booking) {
  return row(
    t("common.admin.onlineBookings.dialog.message.child"),
    buildKindLine(map, booking),
  );
}

function birthDateRow(
  t: Translate,
  lang: string,
  map: Record<string, string>,
  booking: Booking,
) {
  return row(
    t("common.admin.onlineBookings.dialog.message.birthDate"),
    pickValue(map["geburtstag"], formatChildBirth(booking, lang)),
  );
}

function formatChildBirth(booking: Booking, lang: string) {
  return formatDateOnlyDE(META(booking).childBirthDate, lang);
}

function contactRows(
  t: Translate,
  map: Record<string, string>,
  booking: Booking,
) {
  return [
    row(
      t("common.admin.onlineBookings.dialog.message.contact"),
      map["kontakt"],
    ),
    row(
      t("common.admin.onlineBookings.dialog.message.address"),
      map["adresse"],
    ),
    row(t("common.admin.onlineBookings.dialog.message.phone"), map["telefon"]),
    ...contactMetaRows(t, map, booking),
  ];
}

function contactMetaRows(
  t: Translate,
  map: Record<string, string>,
  booking: Booking,
) {
  return [
    row(
      t("common.admin.onlineBookings.dialog.message.voucher"),
      pickValue(map["gutschein"], META(booking).voucher),
    ),
    row(
      t("common.admin.onlineBookings.dialog.message.source"),
      pickValue(map["quelle"], META(booking).source),
    ),
  ];
}

function hasSiblingBooking(map: Record<string, string>, booking: Booking) {
  const meta = META(booking);
  return (
    safeText(map["geschwisterkind"]).toLowerCase() === "ja" ||
    hasSiblingMeta(meta)
  );
}

function hasSiblingMeta(meta: BookingMessageMeta) {
  return (
    siblingMetaValues(meta).some(hasRealValue) ||
    meta.siblingGoalkeeperSchool === true
  );
}

function siblingMetaValues(meta: BookingMessageMeta) {
  return [
    meta.siblingGender,
    meta.siblingBirthDate,
    meta.siblingFirstName,
    meta.siblingLastName,
    meta.siblingTShirtSize,
  ];
}

function siblingRows(
  t: Translate,
  lang: string,
  map: Record<string, string>,
  booking: Booking,
) {
  return [
    addSiblingRow(t),
    siblingGenderRow(t, map, booking),
    siblingBirthRow(t, lang, map, booking),
    siblingFirstRow(t, map, booking),
    siblingLastRow(t, map, booking),
    siblingShirtRow(t, map, booking),
    siblingGoalkeeperRow(t, map, booking),
  ];
}

function addSiblingRow(t: Translate): MessageRow {
  return {
    value: t("common.admin.onlineBookings.dialog.message.addSiblingBooking"),
  };
}

function siblingGenderRow(
  t: Translate,
  map: Record<string, string>,
  booking: Booking,
) {
  return row(
    t("common.admin.onlineBookings.dialog.message.genderSibling"),
    pickValue(map["geschlecht (geschwister)"], META(booking).siblingGender),
  );
}

function siblingBirthRow(
  t: Translate,
  lang: string,
  map: Record<string, string>,
  booking: Booking,
) {
  return row(
    t("common.admin.onlineBookings.dialog.message.birthDateSibling"),
    pickValue(
      map["geburtstag (geschwister)"],
      formatDateOnlyDE(META(booking).siblingBirthDate, lang),
    ),
  );
}

function siblingFirstRow(
  t: Translate,
  map: Record<string, string>,
  booking: Booking,
) {
  return row(
    t("common.admin.onlineBookings.dialog.message.firstNameSibling"),
    pickValue(map["vorname (geschwister)"], META(booking).siblingFirstName),
  );
}

function siblingLastRow(
  t: Translate,
  map: Record<string, string>,
  booking: Booking,
) {
  return row(
    t("common.admin.onlineBookings.dialog.message.lastNameSibling"),
    pickValue(map["nachname (geschwister)"], META(booking).siblingLastName),
  );
}

function siblingShirtRow(
  t: Translate,
  map: Record<string, string>,
  booking: Booking,
) {
  return row(
    t("common.admin.onlineBookings.dialog.message.tShirtSizeSibling"),
    pickValue(
      map["t-shirt-größe (geschwister)"],
      META(booking).siblingTShirtSize,
    ),
  );
}

function siblingGoalkeeperRow(
  t: Translate,
  map: Record<string, string>,
  booking: Booking,
) {
  return row(
    t("common.admin.onlineBookings.dialog.message.goalkeeperSchoolSibling"),
    goalkeeperLabel(
      t,
      pickValue(
        map["torwartschule (geschwister)"],
        META(booking).siblingGoalkeeperSchool === true ? "Ja" : "Nein",
      ),
    ),
  );
}

function buildPowerRows(
  t: Translate,
  lang: string,
  map: Record<string, string>,
  booking: Booking,
): MessageRow[] {
  return [
    holidayRegistrationRow(t),
    holidayRow(t, map, booking),
    periodRow(t, lang, map, booking),
    row(t("common.admin.onlineBookings.dialog.message.child"), map["kind"]),
    birthDateRow(t, lang, map, booking),
    ...contactRows(t, map, booking),
  ];
}

function buildFallbackRows(t: Translate, lines: string[]): MessageRow[] {
  return lines
    .filter((line) => !/^programm\s*:/i.test(line))
    .map((line) => buildFallbackRow(t, line));
}

function buildFallbackRow(t: Translate, line: string) {
  const { label, value } = splitLabelValue(line);
  return label
    ? { label: fallbackLabel(t, label), value: value || "—" }
    : { value: line };
}

function fallbackLabel(t: Translate, label?: string) {
  const key = safeText(label).toLowerCase();
  return key ? (fallbackLabelMap(t)[key] ?? label) : label;
}

function fallbackLabelMap(t: Translate) {
  return {
    kind: t("common.admin.onlineBookings.dialog.message.child"),
    geburtstag: t("common.admin.onlineBookings.dialog.message.birthDate"),
    kontakt: t("common.admin.onlineBookings.dialog.message.contact"),
    adresse: t("common.admin.onlineBookings.dialog.message.address"),
    telefon: t("common.admin.onlineBookings.dialog.message.phone"),
    gutschein: t("common.admin.onlineBookings.dialog.message.voucher"),
    quelle: t("common.admin.onlineBookings.dialog.message.source"),
    ferien: t("common.admin.onlineBookings.dialog.message.holiday"),
    zeitraum: t("common.admin.onlineBookings.dialog.message.period"),
  } as Record<string, string>;
}
