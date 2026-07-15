import type { Booking } from "../../types";
import { formatDateOnlyDE } from "../../utils";

import type { Translate } from "../types";
import { pickValue, safeText } from "./text";

type BookingDisplayMeta = NonNullable<Booking["meta"]> & {
  holidayFrom?: unknown;
  holidayTo?: unknown;
  childGender?: unknown;
};

const META = (booking: Booking) => (booking?.meta ?? {}) as BookingDisplayMeta;

export function stripProgramTitle(raw?: string) {
  const text = safeText(raw);
  if (!text) return "—";
  return text.split("•")[0]?.trim() || text;
}

export function fallbackCampRange(booking: Booking, lang?: string) {
  const from = safeText(META(booking).holidayFrom);
  const to = safeText(META(booking).holidayTo);
  return formatRange(from, to, lang);
}

function formatRange(from: string, to: string, lang?: string) {
  if (!from && !to) return "—";
  const a = formatDateOnlyDE(from || null, lang);
  const b = formatDateOnlyDE(to || null, lang);
  if (a !== "—" && b !== "—") return `${a} – ${b}`;
  return a !== "—" ? a : b;
}

export function goalkeeperLabel(t: Translate, value: unknown) {
  const raw = safeText(value).toLowerCase();
  if (!raw || raw === "-" || raw === "—") return goalkeeperNo(t);
  if (raw === "nein" || raw === "false" || raw === "0") return goalkeeperNo(t);
  if (raw === "ja" || raw === "ja (+40€)") return goalkeeperYes(t);
  if (raw === "true" || raw === "1") return goalkeeperYes(t);
  return safeText(value);
}

function goalkeeperNo(t: Translate) {
  return t("common.admin.onlineBookings.dialog.goalkeeper.no");
}

function goalkeeperYes(t: Translate) {
  return t("common.admin.onlineBookings.dialog.goalkeeper.yesExtra");
}

export function row(label: string, value?: string) {
  return { label, value: safeText(value) || "—" };
}

export function buildKindLine(map: Record<string, string>, booking: Booking) {
  const raw = safeText(map["kind"]);
  if (!raw) return buildFallbackKind(booking);
  return formatRawKind(raw, booking);
}

function buildFallbackKind(booking: Booking) {
  const name =
    [booking.firstName, booking.lastName].filter(Boolean).join(" ").trim() ||
    "-";
  const gender = safeText(META(booking).childGender);
  return gender ? `${name} (${gender})` : name;
}

function formatRawKind(raw: string, booking: Booking) {
  const match = raw.match(/^(.*)\((.*)\)$/);
  if (!match) return raw;
  return formatKindMatch(match, booking);
}

function formatKindMatch(match: RegExpMatchArray, booking: Booking) {
  const finalName = safeText(match[1]) || buildFallbackKind(booking);
  const finalGender = pickValue(match[2], META(booking).childGender);
  return finalGender === "—" ? finalName : `${finalName} (${finalGender})`;
}
