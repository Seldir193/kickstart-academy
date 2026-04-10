// src/app/admin/(app)/coaches/utils.ts
import type { TFunction } from "i18next";
import type { Coach, SortKey } from "./types";
import { formatDateOnly } from "./utils/dateFormat";

type Translate = TFunction;

export function isAbortError(e: unknown) {
  return (
    (e instanceof DOMException && e.name === "AbortError") ||
    (typeof e === "object" &&
      e !== null &&
      "name" in e &&
      (e as any).name === "AbortError")
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
  const p = (c as any).provider;
  const name = cleanStr(p?.fullName);
  if (name) return name;
  const mail = cleanStr(p?.email);
  if (mail) return mail;
  return "—";
}

export function getSlug(c: Coach) {
  return cleanStr((c as any).slug);
}

export function msValue(v: unknown) {
  const s = cleanStr(v);
  const ms = s ? new Date(s).getTime() : 0;
  return Number.isFinite(ms) ? ms : 0;
}

export function everApproved(c: Coach) {
  return msValue((c as any).approvedAt) > 0;
}

export function isApproved(c: Coach) {
  return cleanStr((c as any).status) === "approved";
}

export function isRejected(c: Coach) {
  return cleanStr((c as any).status) === "rejected";
}

export function isPending(c: Coach) {
  return cleanStr((c as any).status) === "pending";
}

export function pendingReviewLabel(c: Coach, t: Translate) {
  return everApproved(c)
    ? t("common.admin.coaches.pending.review")
    : t("common.admin.coaches.pending.awaitingApproval");
}

export function displaySince(c: Coach) {
  const raw = cleanStr((c as any).since);
  if (!raw) return "—";
  return /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw.slice(0, 4) : raw;
}

export function canSubmitUpdate(c: Coach) {
  const draftAt = msValue((c as any).draftUpdatedAt);
  if (!draftAt) return false;
  if (isApproved(c)) return draftAt > msValue((c as any).liveUpdatedAt);
  if (isRejected(c)) return draftAt > msValue((c as any).rejectedAt);
  return false;
}

// export function fmtDateDE(value?: string | null, lang?: string) {
//   const s = cleanStr(value);
//   if (!s) return "";
//   const d = new Date(s);
//   if (Number.isNaN(d.getTime())) return s;
//   return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(d);
// }

export function fmtDateDE(value?: string | null, lang?: string) {
  const s = cleanStr(value);
  if (!s) return "";
  return formatDateOnly(s, lang);
}

export function tsValue(c: Coach) {
  const t = (c as any).createdAt || (c as any).updatedAt;
  const ms = t ? new Date(t).getTime() : 0;
  return Number.isFinite(ms) ? ms : 0;
}

export function matchCoach(c: Coach, q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return true;

  const hay = [
    fullName(c),
    cleanStr((c as any).slug),
    cleanStr((c as any).position),
    cleanStr((c as any).firstName),
    cleanStr((c as any).lastName),
    cleanStr((c as any).name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return hay.includes(s);
}

export function sortCoaches(items: Coach[], sort: SortKey) {
  const arr = [...items];

  if (sort === "newest") {
    arr.sort(
      (a, b) =>
        tsValue(b) - tsValue(a) ||
        String((b as any)._id || "").localeCompare(
          String((a as any)._id || ""),
        ),
    );
    return arr;
  }

  if (sort === "oldest") {
    arr.sort(
      (a, b) =>
        tsValue(a) - tsValue(b) ||
        String((a as any)._id || "").localeCompare(
          String((b as any)._id || ""),
        ),
    );
    return arr;
  }

  if (sort === "name_asc") {
    arr.sort((a, b) =>
      fullName(a).localeCompare(fullName(b), "de", { sensitivity: "base" }),
    );
    return arr;
  }

  arr.sort((a, b) =>
    fullName(b).localeCompare(fullName(a), "de", { sensitivity: "base" }),
  );
  return arr;
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
  const s = cleanStr((c as any).lastChangeSummary);
  if (s) return s;

  const legacy = cleanStr(
    (c as any).draftSummary || (c as any).changeTitle || (c as any).changeLine,
  );
  return legacy;
}
