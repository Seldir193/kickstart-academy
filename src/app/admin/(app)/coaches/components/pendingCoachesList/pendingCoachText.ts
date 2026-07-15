import type { Coach } from "../../types";
import {
  cleanStr,
  draftSummary,
  everApproved,
  fmtDateDE,
  getSlug,
} from "../../utils";
import type { Translate } from "./types";

export function isFirstReviewText(s: string, t: Translate) {
  const value = cleanStr(s).toLowerCase();
  const localized = cleanStr(
    t("common.admin.coaches.pending.firstReview"),
  ).toLowerCase();

  return value === "first review" || value === localized;
}

export function changeText(c: Coach, t: Translate) {
  const s = cleanStr(draftSummary(c));

  return s && !isFirstReviewText(s, t) ? s : "";
}

export function changeDate(c: Coach, lang?: string) {
  const iso = cleanStr(c.draftUpdatedAt || c.lastChangeAt || "");

  return iso ? fmtDateDE(iso, lang) : "";
}

export function dateLine(c: Coach, date: string, t: Translate) {
  if (!date) return "";
  if (!everApproved(c))
    return `${t("common.admin.coaches.pending.date")}: ${date}`;

  return `${t("common.admin.coaches.pending.dateOfChange")}: ${date}`;
}

export function isRowBusy(
  busy: boolean,
  busySlug: string | null | undefined,
  c: Coach,
) {
  if (!busy) return false;

  return cleanStr(busySlug) === cleanStr(getSlug(c));
}
