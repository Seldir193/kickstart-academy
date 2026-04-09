// src/app/admin/(app)/franchise-locations/components/LocationsTableList.helpers.tsx
"use client";

import type React from "react";
import type { FranchiseLocation } from "../types";
import { canSubmitUpdate } from "../franchise_locations.utils";
import { formatDateOnly } from "../utils/dateFormat";
import { buildDraftHint, hasReviewChange } from "./LocationsTableList.hints";

export type RowMode =
  | "mine_pending"
  | "mine_approved"
  | "mine_rejected"
  | "provider_pending"
  | "provider_approved"
  | "provider_rejected";

export type Action = {
  key: string;
  icon: string;
  title: string;
  left?: boolean;
  disabled: boolean;
  tip?: string;
  run: () => void | Promise<void>;
};

type TFn = (key: string) => string;

export type StatusParts = {
  main: string;
  sub: string;
  hint: string;
};

export function clean(v: unknown) {
  return String(v ?? "").trim();
}

export function idOf(it: any) {
  return clean(it?.id || it?._id || it?.slug);
}

export function fullName(it: FranchiseLocation) {
  return `${clean(it.licenseeFirstName)} ${clean(it.licenseeLastName)}`.trim();
}

// export function fmtDateDe(value?: string) {
//   if (!value) return "—";
//   const d = new Date(value);
//   if (Number.isNaN(d.getTime())) return value;
//   return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(d);
// }

export function fmtDate(value?: string, lang?: string) {
  return formatDateOnly(value, lang);
}

function statusOf(it: any) {
  const s = clean(it?.status);
  if (s === "pending" || s === "approved" || s === "rejected") return s;
  return "";
}

function isApproved(it: any) {
  return statusOf(it) === "approved";
}

function isRejected(it: any) {
  if (statusOf(it) === "rejected") return true;
  return clean(it?.rejectionReason).length > 0;
}

function isPublished(it: any) {
  return it?.published === true;
}

export function statusClass(it: any) {
  if (isRejected(it)) return "is-rejected";
  if (hasReviewChange(it)) return "is-off";
  if (isApproved(it) && isPublished(it)) return "is-on";
  return "is-off";
}

function hintFor(it: any, rowMode: RowMode, t: TFn) {
  if (rowMode !== "provider_pending") return "";
  if (!hasReviewChange(it)) return "";
  return buildDraftHint(it, t);
}

function pendingMain(it: any, rowMode: RowMode, t: TFn) {
  const review = hasReviewChange(it);
  if (rowMode === "provider_pending")
    return review
      ? t("common.admin.franchiseLocations.status.pleaseReview")
      : t("common.admin.franchiseLocations.status.awaitingApproval");

  return review
    ? t("common.admin.franchiseLocations.status.underReview")
    : t("common.admin.franchiseLocations.status.awaitingApproval");
}

function approvedParts(it: any, rowMode: RowMode, t: TFn): StatusParts {
  const review = rowMode === "mine_approved" && hasReviewChange(it);
  if (review)
    return {
      main: t("common.admin.franchiseLocations.status.underReview"),
      sub: "",
      hint: "",
    };
  return {
    main: t("common.admin.franchiseLocations.status.approved"),
    sub: isPublished(it)
      ? t("common.admin.franchiseLocations.status.online")
      : t("common.admin.franchiseLocations.status.offline"),
    hint: "",
  };
}

export function statusParts(it: any, rowMode: RowMode, t: TFn): StatusParts {
  const hint = hintFor(it, rowMode, t);
  if (rowMode === "mine_pending" || rowMode === "provider_pending")
    return { main: pendingMain(it, rowMode, t), sub: "", hint };
  if (rowMode === "mine_rejected" || rowMode === "provider_rejected")
    return {
      main: t("common.admin.franchiseLocations.status.rejected"),
      sub: "",
      hint: "",
    };
  if (isApproved(it)) return approvedParts(it, rowMode, t);
  return { main: pendingMain(it, rowMode, t), sub: "", hint };
}

export function blurTarget(t: EventTarget | null) {
  const el = t as any;
  if (el && typeof el.blur === "function") el.blur();
}

export function stop(e: React.SyntheticEvent) {
  e.preventDefault();
  e.stopPropagation();
}

export function onActionKey(
  e: React.KeyboardEvent,
  run: () => void,
  disabled: boolean,
) {
  if (disabled) return;
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  e.stopPropagation();
  blurTarget(e.currentTarget);
  run();
}

export function buildOpenAction(
  it: FranchiseLocation,
  busy: boolean,
  onOpen: (it: FranchiseLocation) => void,
  t: TFn,
): Action {
  return {
    key: "open",
    icon: "/icons/edit.svg",
    title: t("common.admin.franchiseLocations.actions.edit"),
    disabled: busy,
    run: () => onOpen(it),
  };
}

export function buildInfoAction(
  it: FranchiseLocation,
  busy: boolean,
  onInfo: (it: FranchiseLocation) => void,
  t: TFn,
): Action {
  return {
    key: "info",
    icon: "/icons/info.svg",
    title: t("common.admin.franchiseLocations.actions.info"),
    disabled: busy,
    run: () => onInfo(it),
  };
}

export function buildRejectAction(
  it: FranchiseLocation,
  busy: boolean,
  onAskReject?: (it: FranchiseLocation) => void | undefined,
  t: TFn,
): Action {
  return {
    key: "reject",
    icon: "/icons/arrow_right_alt.svg",
    title: t("common.admin.franchiseLocations.actions.reject"),
    left: true,
    disabled: busy,
    run: () => onAskReject?.(it),
  };
}

export function buildDeleteAction(
  it: FranchiseLocation,
  busy: boolean,
  onDeleteOne?: (it: FranchiseLocation) => void | undefined,
  t: TFn,
): Action {
  return {
    key: "delete",
    icon: "/icons/delete.svg",
    title: t("common.admin.franchiseLocations.actions.delete"),
    disabled: busy,
    run: () => onDeleteOne?.(it),
  };
}

function submitBase(it: FranchiseLocation, busy: boolean, t: TFn) {
  const ok = canSubmitUpdate(it);
  return {
    disabled: busy || !ok,
    tip: ok
      ? undefined
      : t("common.admin.franchiseLocations.actions.updateFirst"),
  };
}

export function buildResubmitAction(
  it: FranchiseLocation,
  busy: boolean,
  onResubmit?: (it: FranchiseLocation) => void | undefined,
  t: TFn,
): Action {
  const base = submitBase(it, busy, t);
  return {
    key: "resubmit",
    icon: "/icons/arrow_right_alt.svg",
    title: t("common.admin.franchiseLocations.actions.resubmit"),
    left: true,
    disabled: base.disabled,
    tip: base.tip,
    run: () => onResubmit?.(it),
  };
}

export function buildSubmitForReviewAction(
  it: FranchiseLocation,
  busy: boolean,
  onSubmitForReview?: (it: FranchiseLocation) => void | undefined,
  t: TFn,
): Action {
  const base = submitBase(it, busy, t);
  return {
    key: "submit",
    icon: "/icons/arrow_right_alt.svg",
    title: t("common.admin.franchiseLocations.actions.submitForReview"),
    left: true,
    disabled: base.disabled,
    tip: base.tip,
    run: () => onSubmitForReview?.(it),
  };
}

function addIf<T>(arr: T[], item: T | null) {
  if (item) arr.push(item);
  return arr;
}

export function actionsFor(args: {
  it: FranchiseLocation;
  rowMode: RowMode;
  busy: boolean;
  onOpen: (it: FranchiseLocation) => void;
  onInfo?: (it: FranchiseLocation) => void;
  onResubmit?: (it: FranchiseLocation) => void;
  onSubmitForReview?: (it: FranchiseLocation) => void;
  onDeleteOne?: (it: FranchiseLocation) => void;
  onAskReject?: (it: FranchiseLocation) => void;
  t: TFn;
}) {
  const {
    it,
    rowMode,
    busy,
    onOpen,
    onInfo,
    onResubmit,
    onSubmitForReview,
    onDeleteOne,
    onAskReject,
    t,
  } = args;

  if (rowMode === "mine_pending") {
    const a: Action[] = [buildOpenAction(it, busy, onOpen, t)];
    return addIf(
      a,
      onDeleteOne ? buildDeleteAction(it, busy, onDeleteOne, t) : null,
    );
  }

  if (rowMode === "mine_approved") {
    const a: Action[] = [buildOpenAction(it, busy, onOpen, t)];
    addIf(a, onInfo ? buildInfoAction(it, busy, onInfo, t) : null);
    addIf(
      a,
      onSubmitForReview
        ? buildSubmitForReviewAction(it, busy, onSubmitForReview, t)
        : null,
    );
    addIf(a, onDeleteOne ? buildDeleteAction(it, busy, onDeleteOne, t) : null);
    return a;
  }

  if (rowMode === "mine_rejected") {
    const a: Action[] = [buildOpenAction(it, busy, onOpen, t)];
    addIf(a, onInfo ? buildInfoAction(it, busy, onInfo, t) : null);
    addIf(a, onResubmit ? buildResubmitAction(it, busy, onResubmit, t) : null);
    addIf(a, onDeleteOne ? buildDeleteAction(it, busy, onDeleteOne, t) : null);
    return a;
  }

  if (rowMode === "provider_pending") {
    const a: Action[] = [];
    addIf(a, onInfo ? buildInfoAction(it, busy, onInfo, t) : null);
    addIf(a, onAskReject ? buildRejectAction(it, busy, onAskReject, t) : null);
    addIf(a, onDeleteOne ? buildDeleteAction(it, busy, onDeleteOne, t) : null);
    return a;
  }

  if (rowMode === "provider_approved") {
    const a: Action[] = [];
    addIf(a, onInfo ? buildInfoAction(it, busy, onInfo, t) : null);
    a.push(buildOpenAction(it, busy, onOpen, t));
    addIf(a, onAskReject ? buildRejectAction(it, busy, onAskReject, t) : null);
    addIf(a, onDeleteOne ? buildDeleteAction(it, busy, onDeleteOne, t) : null);
    return a;
  }

  if (rowMode === "provider_rejected") {
    const a: Action[] = [];
    addIf(a, onInfo ? buildInfoAction(it, busy, onInfo, t) : null);
    a.push(buildOpenAction(it, busy, onOpen, t));
    addIf(a, onDeleteOne ? buildDeleteAction(it, busy, onDeleteOne, t) : null);
    return a;
  }

  return [buildOpenAction(it, busy, onOpen, z)];
}
