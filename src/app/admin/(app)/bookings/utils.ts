//src\app\admin\(app)\bookings\utils.ts
"use client";

import type { Booking, ProgramFilter, Status, StatusOrAll } from "./types";

export function safeText(v: unknown) {
  return String(v ?? "").trim();
}

export function asStatus(s?: Booking["status"]): Status {
  return (s ?? "pending") as Status;
}

export function dateLocale(lang?: string) {
  if (lang === "tr") return "tr-TR";
  if (lang === "en") return "en-US";
  return "de-DE";
}

export function formatDateOnly(value?: string | null, lang?: string) {
  if (!value) return "—";
  const s = String(value);
  const d = new Date(s.length === 10 ? `${s}T00:00:00` : s);
  if (Number.isNaN(d.getTime())) return value;

  return new Intl.DateTimeFormat(dateLocale(lang), {
    dateStyle: "medium",
  }).format(d);
}

export function formatDateTime(value?: string | null, lang?: string) {
  if (!value) return "—";
  const s = String(value);
  const d = new Date(s.length === 10 ? `${s}T00:00:00` : s);
  if (Number.isNaN(d.getTime())) return value;

  return new Intl.DateTimeFormat(dateLocale(lang), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function programLabel(
  program: ProgramFilter,
  t: (key: string) => string,
) {
  const map: Record<ProgramFilter, string> = {
    all: t("common.admin.bookings.filters.program.all"),
    weekly_foerdertraining: t(
      "common.admin.bookings.filters.program.weeklyFoerdertraining",
    ),
    weekly_kindergarten: t(
      "common.admin.bookings.filters.program.weeklyKindergarten",
    ),
    weekly_goalkeeper: t(
      "common.admin.bookings.filters.program.weeklyGoalkeeper",
    ),
    weekly_development_athletik: t(
      "common.admin.bookings.filters.program.weeklyDevelopmentAthletik",
    ),
    ind_1to1: t("common.admin.bookings.filters.program.individual1to1"),
    ind_1to1_athletik: t(
      "common.admin.bookings.filters.program.individual1to1Athletik",
    ),
    ind_1to1_goalkeeper: t(
      "common.admin.bookings.filters.program.individual1to1Goalkeeper",
    ),
    club_rentacoach: t("common.admin.bookings.filters.program.clubRentACoach"),
    club_trainingcamps: t(
      "common.admin.bookings.filters.program.clubTrainingCamps",
    ),
    club_coacheducation: t(
      "common.admin.bookings.filters.program.clubCoachEducation",
    ),
  };
  return map[program] || t("common.admin.bookings.filters.program.all");
}

export function statusLabel(
  params: {
    status: StatusOrAll;
    total: number;
    totalAll: number | null;
    counts: Partial<Record<Status, number>>;
  },
  t: (key: string) => string,
) {
  const { status, total, totalAll, counts } = params;
  if (status === "all") {
    return `${t("common.admin.bookings.filters.status.all")} (${totalAll ?? total})`;
  }
  const map: Record<Status, string> = {
    pending: t("common.admin.bookings.filters.status.pending"),
    processing: t("common.admin.bookings.filters.status.processing"),
    confirmed: t("common.admin.bookings.filters.status.confirmed"),
    cancelled: t("common.admin.bookings.filters.status.cancelled"),
    deleted: t("common.admin.bookings.filters.status.deleted"),
  };
  const n = counts[status] ?? 0;
  return `${map[status]} (${n})`;
}

export function capitalize(s: string) {
  const t = String(s || "");
  return t ? t[0].toUpperCase() + t.slice(1) : t;
}

function messageProgramName(msg?: string) {
  const m = String(msg || "").match(/Programm:\s*(.+)/i);
  return m ? m[1].trim() : "";
}

export function programAbbr(b: Booking) {
  const raw =
    safeText(b.offerTitle) ||
    safeText(b.offerType) ||
    messageProgramName(b.message);

  const name = raw.split("•")[0].trim();
  const low = name.toLowerCase();

  if (!low) return "—";
  if (hasAny(low, ["fördertraining", "foerdertraining"])) return "FO";
  if (
    hasAny(low, ["kindergarten", "fußballkindergarten", "fussballkindergarten"])
  )
    return "KIN";
  if (hasAny(low, ["torwart", "goalkeeper"])) return "TOR";
  if (hasAny(low, ["athletik", "athletic"])) return "ATH";
  if (hasAny(low, ["1:1", "1to1", "personal training", "individual"])) {
    return "PER";
  }
  if (hasAny(low, ["rentacoach", "rent-a-coach"])) return "RAC";
  if (hasAny(low, ["coach education"])) return "EDU";
  if (hasAny(low, ["camp", "feriencamp", "holiday camp"])) return "CAM";
  if (hasAny(low, ["powertraining", "power training"])) return "PER";
  return cleanAbbr(name);
}
function hasAny(text: string, parts: string[]) {
  return parts.some((p) => text.includes(p));
}

function cleanAbbr(name: string) {
  const clean = name.replace(/[^a-zA-ZäöüÄÖÜß]/g, "").toUpperCase();
  if (!clean) return "—";
  return clean.slice(0, 3);
}
