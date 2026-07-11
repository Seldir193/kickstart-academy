import type { NewsWithProvider } from "./newsList.types";

type Translate = (key: string, options?: Record<string, unknown>) => string;

export function clean(value: unknown) {
  return String(value ?? "").trim();
}

export function getNewsId(news: NewsWithProvider) {
  return clean(news._id);
}

export function isNewsRejected(news: NewsWithProvider) {
  return news.status === "rejected" || clean(news.rejectionReason).length > 0;
}

export function isNewsApproved(news: NewsWithProvider) {
  return news.status === "approved" || news.published === true;
}

export function getStatusLabel(news: NewsWithProvider, t: Translate) {
  if (isNewsApproved(news)) return t("common.admin.news.list.statusApproved");
  if (isNewsRejected(news)) return t("common.admin.news.list.statusRejected");
  return t("common.admin.news.list.statusToReview");
}

export function getStatusClass(news: NewsWithProvider) {
  if (isNewsApproved(news)) return "is-on";
  if (isNewsRejected(news)) return "is-rejected";
  return "is-off";
}

export function getProviderLabel(news: NewsWithProvider) {
  const name = clean(news.provider?.fullName);
  if (name) return name;
  const email = clean(news.provider?.email);
  if (email) return email;
  return clean(news.providerId);
}
