import type { TFunction } from "i18next";
import type { Coach } from "../../types";
import {
  canSubmitUpdate,
  cleanStr,
  isApproved,
  isRejected,
  pendingReviewLabel,
  providerLabel,
} from "../../utils";
import type { CoachTableListProps, CoachRowMeta } from "./types";

type RowStatus = {
  approved: boolean;
  rejected: boolean;
  published: boolean;
};

export function effectiveCoachForDisplay(c: Coach, authorDash?: boolean) {
  if (!authorDash || !hasDraft(c)) return c;
  const draft = c.draft;
  if (!draft || typeof draft !== "object") return c;
  return { ...c, ...draft } as Coach;
}

function hasDraft(c: Coach) {
  return Boolean(c.hasDraft) && !!c.draft;
}

export function positionLabel(c: Coach, t: TFunction) {
  const value = cleanStr(c.position);
  return value || t("common.admin.coaches.table.positionFallback");
}

function normalizedPendingLabel(c: Coach, t: TFunction, authorDash?: boolean) {
  const raw = pendingReviewLabel(c, t);
  if (!authorDash) return raw;
  return raw === t("common.admin.coaches.pending.review")
    ? t("common.admin.coaches.table.underReview")
    : raw;
}

export function statusLabel(c: Coach, t: TFunction, authorDash?: boolean) {
  if (isApproved(c)) return t("common.admin.coaches.table.statusApproved");
  if (isRejected(c)) return t("common.admin.coaches.table.statusRejected");
  return normalizedPendingLabel(c, t, authorDash);
}

export function authorText(
  c: Coach,
  t: TFunction,
  authorDash?: boolean,
  meLabel?: string,
) {
  if (authorDash) {
    return cleanStr(meLabel) || t("common.admin.coaches.table.me");
  }
  return providerLabel(c);
}

export function buildCoachRowMeta(
  raw: Coach,
  args: CoachTableListProps,
  checked: boolean,
): CoachRowMeta {
  const approved = isApproved(raw);
  const rejected = isRejected(raw);
  return toRowMeta(raw, args, checked, approved, rejected);
}

function toRowMeta(
  raw: Coach,
  args: CoachTableListProps,
  checked: boolean,
  approved: boolean,
  rejected: boolean,
): CoachRowMeta {
  const slug = cleanStr(raw.slug);
  const published = Boolean(raw.published);
  const showSubmit = Boolean(args.onResubmit) && (rejected || approved);
  const status = { approved, rejected, published };
  return {
    ...rowIdentityMeta(raw, args, slug, checked),
    ...rowStateMeta(args, checked, status),
    ...rowActionMeta(args, raw, slug, showSubmit, status),
  };
}

function rowIdentityMeta(
  raw: Coach,
  args: CoachTableListProps,
  slug: string,
  checked: boolean,
) {
  return {
    raw,
    displayCoach: effectiveCoachForDisplay(raw, args.authorDash),
    slug,
    checked,
  };
}

function rowStateMeta(
  args: CoachTableListProps,
  checked: boolean,
  status: RowStatus,
) {
  return {
    hideActions: args.selectMode || checked,
    approved: status.approved,
    rejected: status.rejected,
    published: status.published,
  };
}

function rowActionMeta(
  args: CoachTableListProps,
  raw: Coach,
  slug: string,
  showSubmit: boolean,
  status: RowStatus,
) {
  return {
    isSwitchBusy: isSwitchBusy(args, slug),
    showSubmit,
    submitDisabled: submitDisabled(args, raw, showSubmit),
    statusClass: statusClass(
      status.rejected,
      status.approved,
      status.published,
    ),
  };
}

function isSwitchBusy(args: CoachTableListProps, slug: string) {
  return Boolean(args.publishedBusyId && args.publishedBusyId === slug);
}

function submitDisabled(
  args: CoachTableListProps,
  raw: Coach,
  showSubmit: boolean,
) {
  const allowed = showSubmit && isSubmitAllowed(raw, args.canResubmit);
  return args.busy || !allowed;
}

function isSubmitAllowed(c: Coach, canResubmit?: (c: Coach) => boolean) {
  if (typeof canResubmit === "function") return Boolean(canResubmit(c));
  return canSubmitUpdate(c);
}

function statusClass(rejected: boolean, approved: boolean, published: boolean) {
  if (rejected) return "is-rejected";
  if (!approved) return "is-off";
  return published ? "is-on" : "is-off";
}
