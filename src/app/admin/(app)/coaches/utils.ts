import type { TFunction } from "i18next";
import type { Coach, SortKey } from "./types";
import { formatDateOnly } from "./utils/dateFormat";

type Translate = TFunction;

type CoachWithLegacySummary = Coach & {
  draftSummary?: unknown;
  changeTitle?: unknown;
  changeLine?: unknown;
};

export function isAbortError(e: unknown) {
  return (
    (e instanceof DOMException && e.name === "AbortError") ||
    (typeof e === "object" &&
      e !== null &&
      "name" in e &&
      e.name === "AbortError")
  );
}

export function cleanStr(v: unknown) {
  return String(v ?? "").trim();
}

export function fullName(c: Coach) {
  return (
    cleanStr(c.name) ||
    [cleanStr(c.firstName), cleanStr(c.lastName)].filter(Boolean).join(" ") ||
    "—"
  ).trim();
}

export function providerLabel(c: Coach) {
  const p = c.provider;
  const name = cleanStr(p?.fullName);
  if (name) return name;
  const mail = cleanStr(p?.email);
  if (mail) return mail;
  return "—";
}

export function getSlug(c: Coach) {
  return cleanStr(c.slug);
}

export function msValue(v: unknown) {
  const s = cleanStr(v);
  const ms = s ? new Date(s).getTime() : 0;
  return Number.isFinite(ms) ? ms : 0;
}

export function everApproved(c: Coach) {
  return msValue(c.approvedAt) > 0;
}

export function isApproved(c: Coach) {
  return cleanStr(c.status) === "approved";
}

export function isRejected(c: Coach) {
  return cleanStr(c.status) === "rejected";
}

export function isPending(c: Coach) {
  return cleanStr(c.status) === "pending";
}

export function pendingReviewLabel(c: Coach, t: Translate) {
  return everApproved(c)
    ? t("common.admin.coaches.pending.review")
    : t("common.admin.coaches.pending.awaitingApproval");
}

export function displaySince(c: Coach) {
  const raw = cleanStr(c.since);
  if (!raw) return "—";
  return /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw.slice(0, 4) : raw;
}

export function canSubmitUpdate(c: Coach) {
  const draftAt = msValue(c.draftUpdatedAt);
  if (!draftAt) return false;
  if (isApproved(c)) return draftAt > msValue(c.liveUpdatedAt);
  if (isRejected(c)) return draftAt > msValue(c.rejectedAt);
  return false;
}

export function fmtDateDE(value?: string | null, lang?: string) {
  const s = cleanStr(value);
  if (!s) return "";
  return formatDateOnly(s, lang);
}

export function tsValue(c: Coach) {
  const t = c.createdAt || c.updatedAt;
  const ms = t ? new Date(t).getTime() : 0;
  return Number.isFinite(ms) ? ms : 0;
}

export function matchCoach(c: Coach, q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return coachSearchText(c).includes(s);
}

function coachSearchText(c: Coach) {
  return [
    fullName(c),
    cleanStr(c.slug),
    cleanStr(c.position),
    cleanStr(c.firstName),
    cleanStr(c.lastName),
    cleanStr(c.name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function sortCoaches(items: Coach[], sort: SortKey) {
  return [...items].sort(coachComparator(sort));
}

function coachComparator(sort: SortKey) {
  if (sort === "newest") return compareNewest;
  if (sort === "oldest") return compareOldest;
  if (sort === "name_asc") return compareNameAsc;
  return compareNameDesc;
}

function compareNewest(a: Coach, b: Coach) {
  return (
    tsValue(b) - tsValue(a) ||
    String(b._id || "").localeCompare(String(a._id || ""))
  );
}

function compareOldest(a: Coach, b: Coach) {
  return (
    tsValue(a) - tsValue(b) ||
    String(a._id || "").localeCompare(String(b._id || ""))
  );
}

function compareNameAsc(a: Coach, b: Coach) {
  return fullName(a).localeCompare(fullName(b), "de", {
    sensitivity: "base",
  });
}

function compareNameDesc(a: Coach, b: Coach) {
  return fullName(b).localeCompare(fullName(a), "de", {
    sensitivity: "base",
  });
}

export function paginate<T>(items: T[], page: number, limit: number) {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), pages);
  const start = (safePage - 1) * limit;

  return {
    slice: items.slice(start, start + limit),
    pages,
    page: safePage,
    total,
  };
}

export function toSet(ids: string[]) {
  return new Set(ids.map(String).filter(Boolean));
}

export function draftSummary(c: Coach) {
  const s = cleanStr(c.lastChangeSummary);
  if (s) return s;

  const legacyCoach = c as CoachWithLegacySummary;
  const legacy = cleanStr(
    legacyCoach.draftSummary ||
      legacyCoach.changeTitle ||
      legacyCoach.changeLine,
  );
  return legacy;
}
