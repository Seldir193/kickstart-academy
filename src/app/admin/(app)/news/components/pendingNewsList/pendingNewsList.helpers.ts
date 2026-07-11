import type { TFunction } from "i18next";
import { formatDateOnly } from "../../utils/dateFormat";
import type { PendingNews } from "./pendingNewsList.types";

export const clean = (value: unknown) => String(value ?? "").trim();

export function pickFirst(...values: unknown[]) {
  return values.map(clean).find(Boolean) ?? "";
}

export function providerLabel(news: PendingNews) {
  return pickFirst(
    news.provider?.fullName,
    news.provider?.email,
    news.providerId,
    "—",
  );
}

export function draftOf(news: PendingNews) {
  if (news.hasDraft !== true || !news.draft) return null;
  return typeof news.draft === "object" ? news.draft : null;
}

export function hasDraftAnyField(news: PendingNews) {
  const draft = draftOf(news);
  return Boolean(draft && Object.values(draft).some((value) => clean(value)));
}

export function isUpdateReview(news: PendingNews) {
  return Boolean(clean(news.approvedAt) && clean(news.submittedAt));
}

export function pendingDate(news: PendingNews) {
  if (isUpdateReview(news)) {
    return pickFirst(news.draftUpdatedAt, news.submittedAt, news.updatedAt);
  }
  return pickFirst(news.date, news.createdAt, news.submittedAt, news.updatedAt);
}

export function pendingDateLabel(news: PendingNews, lang: string, t: TFunction) {
  const date = formatDateOnly(pendingDate(news), lang);
  if (!date) return "";
  const key = isUpdateReview(news)
    ? "common.admin.news.pendingList.dateOfChange"
    : "common.admin.news.pendingList.date";
  return t(key, { date });
}
