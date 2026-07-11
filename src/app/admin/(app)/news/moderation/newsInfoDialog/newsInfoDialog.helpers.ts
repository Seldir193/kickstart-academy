import type { TFunction } from "i18next";
import type { News } from "../../types";
import { formatDateTime } from "../../utils/dateFormat";
import type { NewsInfoDialogData } from "./newsInfoDialog.types";

export function clean(value: unknown) {
  return String(value ?? "").trim();
}

function valueOrDash(value: unknown) {
  return clean(value) || "—";
}

function getTitle(item: News, t: TFunction) {
  return clean(item.title) || t("common.admin.news.infoDialog.defaultTitle");
}

function getStatus(item: News) {
  if (clean(item.rejectionReason)) return "common.admin.news.infoDialog.statusRejected";
  if (clean(item.submittedAt)) return "common.admin.news.infoDialog.statusPending";
  return item.published
    ? "common.admin.news.infoDialog.statusPublished"
    : "common.admin.news.infoDialog.statusOffline";
}

function getTags(item: News) {
  if (!Array.isArray(item.tags)) return [];
  return item.tags.map(clean).filter(Boolean);
}

function format(value: string | null | undefined, language: string) {
  return formatDateTime(value, language);
}

export function getStatusClass(status: string) {
  if (status.endsWith("statusRejected")) return "dialog-status--danger";
  if (status.endsWith("statusPending")) return "dialog-status--warning";
  return "dialog-status--success";
}

export function buildNewsInfoData(item: News, t: TFunction, language: string): NewsInfoDialogData {
  return {
    title: getTitle(item, t),
    status: getStatus(item),
    category: valueOrDash(item.category),
    slug: valueOrDash(item.slug),
    tags: getTags(item),
    approvedAt: format(item.approvedAt, language),
    liveUpdatedAt: format(item.liveUpdatedAt, language),
    submittedAt: format(item.submittedAt, language),
    lastProviderEditAt: format(item.lastProviderEditAt, language),
    lastSuperEditAt: format(item.lastSuperEditAt, language),
  };
}
