"use client";

import type { Booking, Status } from "./types";

export function safeText(v: unknown) {
  return String(v ?? "").trim();
}

function dateLocale(lang?: string) {
  if (lang === "tr") return "tr-TR";
  if (lang === "en") return "en-US";
  return "de-DE";
}

export function formatDateOnlyDE(value?: string | null, lang?: string) {
  if (!value) return "—";
  const s = String(value);
  const d = new Date(s.length === 10 ? `${s}T00:00:00` : s);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(dateLocale(lang), {
    dateStyle: "medium",
  }).format(d);
}

export function formatDateTimeDE(value?: string | null, lang?: string) {
  if (!value) return "—";
  const s = String(value);
  const d = new Date(s.length === 10 ? `${s}T00:00:00` : s);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(dateLocale(lang), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function asStatus(s?: Booking["status"]): Status {
  return (s ?? "confirmed") as Status;
}

function includesAny(text: string, parts: string[]) {
  return parts.some((p) => text.includes(p));
}

function holidayTypeOf(b: Booking) {
  return safeText((b as any)?.meta?.holidayType).toLowerCase();
}

function bookingProgramText(b: Booking) {
  return [
    (b as any)?.offerType,
    (b as any)?.offerTitle,
    b.level,
    (b as any)?.program,
    b.message,
    (b as any)?.meta?.holidayType,
    (b as any)?.meta?.holidayLabel,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function programAbbr(b: Booking): string {
  const holidayType = holidayTypeOf(b);

  if (holidayType === "powertraining") return "PWR";
  if (holidayType === "camp") return "CMP";
  if (holidayType === "holiday") return "CMP";

  const text = bookingProgramText(b);

  if (!text) return "—";
  if (includesAny(text, ["powertraining", "power training"])) return "PWR";
  if (includesAny(text, ["camp", "feriencamp", "holiday camp"])) return "CMP";
  return "—";
}
