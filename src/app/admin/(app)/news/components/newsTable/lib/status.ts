import type { NewsWithProvider, RowMode, StatusParts, Translate } from "../types";
import { clean } from "./ids";
import { draftOf, getReviewStatus, isSubmitted, wasEverApproved } from "./review";

export function isRejected(item: unknown) {
  if (getReviewStatus(item) === "rejected") return true;
  const record = item as Record<string, unknown> | null;
  return clean(record?.rejectionReason).length > 0;
}

export function statusClass(item: unknown) {
  if (isRejected(item)) return "is-rejected";
  if (isApproved(item) && isPublished(item)) return "is-on";
  return "is-off";
}

export function providerLabel(item: NewsWithProvider) {
  const name = clean(item?.provider?.fullName);
  if (name) return name;
  const mail = clean(item?.provider?.email);
  if (mail) return mail;
  const pid = clean((item as Record<string, unknown>)?.providerId);
  return pid || "—";
}

export function getNeedsCorrection(item: unknown) {
  const record = item as Record<string, unknown> | null;
  const required = record?.correctionRequired === true;
  const fixedAt = clean(record?.correctionFixedAt);
  return required && !fixedAt;
}

export function getDraftDelta(item: unknown) {
  const draft = draftOf(item) as Record<string, unknown> | null;
  return {
    draftTitle: clean(draft?.title),
    draftExcerpt: clean(draft?.excerpt),
    draftCategory: clean(draft?.category),
  };
}

export function statusParts(
  item: unknown,
  rowMode: RowMode,
  t: Translate,
): StatusParts {
  if (isRejectedMode(rowMode)) return rejectedParts(t);
  if (rowMode === "mine_pending") return minePendingParts(item, t);
  if (isApproved(item)) return approvedParts(item, t);
  if (isSubmitted(item)) return pendingParts(t);
  return pendingParts(t);
}

export function canShowSwitch(rowMode: RowMode) {
  return rowMode === "mine_approved" || rowMode === "provider_approved";
}

export function filterItemsForView<T extends unknown>(items: T[], rowMode: RowMode) {
  if (!canShowSwitch(rowMode)) return items;
  return items.filter((item) => !isSubmitted(item));
}

function isApproved(item: unknown) {
  return getReviewStatus(item) === "approved" && !isSubmitted(item);
}

function isPublished(item: unknown) {
  const record = item as Record<string, unknown> | null;
  return record?.published === true;
}

function isRejectedMode(rowMode: RowMode) {
  return rowMode === "mine_rejected" || rowMode === "provider_rejected";
}

function isUpdateReview(item: unknown) {
  return isSubmitted(item) && wasEverApproved(item);
}

function minePendingParts(item: unknown, t: Translate) {
  return emptyParts(isUpdateReview(item) ? underReview(t) : awaitingApproval(t));
}

function approvedParts(item: unknown, t: Translate) {
  return {
    main: t("common.admin.news.table.approved"),
    sub: isPublished(item) ? online(t) : offline(t),
    hint: "",
    changeAt: "",
  };
}

function rejectedParts(t: Translate) {
  return emptyParts(t("common.admin.news.table.rejected"));
}

function pendingParts(t: Translate) {
  return emptyParts(awaitingApproval(t));
}

function emptyParts(main: string) {
  return { main, sub: "", hint: "", changeAt: "" };
}

function underReview(t: Translate) {
  return t("common.admin.news.table.underReview");
}

function awaitingApproval(t: Translate) {
  return t("common.admin.news.table.awaitingApproval");
}

function online(t: Translate) {
  return t("common.admin.news.table.online");
}

function offline(t: Translate) {
  return t("common.admin.news.table.offline");
}
