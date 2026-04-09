// src/app/admin/(app)/franchise-locations/components/LocationsTableList.helpers.tsx
"use client";

import type React from "react";
import type { FranchiseLocation } from "../types";
import { canSubmitUpdate } from "../franchise_locations.utils";
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

export function fmtDateDe(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(d);
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

function hintFor(it: any, rowMode: RowMode) {
  if (rowMode !== "provider_pending") return "";
  if (!hasReviewChange(it)) return "";
  return buildDraftHint(it);
}

function pendingMain(it: any, rowMode: RowMode) {
  const review = hasReviewChange(it);
  if (rowMode === "provider_pending")
    return review ? "Please review" : "Awaiting approval";
  return review ? "Under review" : "Awaiting approval";
}

function approvedParts(it: any, rowMode: RowMode): StatusParts {
  const review = rowMode === "mine_approved" && hasReviewChange(it);
  if (review) return { main: "Under review", sub: "", hint: "" };
  return {
    main: "Approved",
    sub: isPublished(it) ? "Online" : "Offline",
    hint: "",
  };
}

export function statusParts(it: any, rowMode: RowMode): StatusParts {
  const hint = hintFor(it, rowMode);
  if (rowMode === "mine_pending" || rowMode === "provider_pending")
    return { main: pendingMain(it, rowMode), sub: "", hint };
  if (rowMode === "mine_rejected" || rowMode === "provider_rejected")
    return { main: "Rejected", sub: "", hint: "" };
  if (isApproved(it)) return approvedParts(it, rowMode);
  return { main: pendingMain(it, rowMode), sub: "", hint };
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
): Action {
  return {
    key: "open",
    icon: "/icons/edit.svg",
    title: "Edit",
    disabled: busy,
    run: () => onOpen(it),
  };
}

export function buildInfoAction(
  it: FranchiseLocation,
  busy: boolean,
  onInfo: (it: FranchiseLocation) => void,
): Action {
  return {
    key: "info",
    icon: "/icons/info.svg",
    title: "Info",
    disabled: busy,
    run: () => onInfo(it),
  };
}

export function buildRejectAction(
  it: FranchiseLocation,
  busy: boolean,
  onAskReject?: (it: FranchiseLocation) => void,
): Action {
  return {
    key: "reject",
    icon: "/icons/arrow_right_alt.svg",
    title: "Reject",
    left: true,
    disabled: busy,
    run: () => onAskReject?.(it),
  };
}

export function buildDeleteAction(
  it: FranchiseLocation,
  busy: boolean,
  onDeleteOne?: (it: FranchiseLocation) => void,
): Action {
  return {
    key: "delete",
    icon: "/icons/delete.svg",
    title: "Delete",
    disabled: busy,
    run: () => onDeleteOne?.(it),
  };
}

function submitBase(it: FranchiseLocation, busy: boolean) {
  const ok = canSubmitUpdate(it);
  return {
    disabled: busy || !ok,
    tip: ok ? undefined : "Please update first",
  };
}

export function buildResubmitAction(
  it: FranchiseLocation,
  busy: boolean,
  onResubmit?: (it: FranchiseLocation) => void,
): Action {
  const base = submitBase(it, busy);
  return {
    key: "resubmit",
    icon: "/icons/arrow_right_alt.svg",
    title: "Resubmit",
    left: true,
    disabled: base.disabled,
    tip: base.tip,
    run: () => onResubmit?.(it),
  };
}

export function buildSubmitForReviewAction(
  it: FranchiseLocation,
  busy: boolean,
  onSubmitForReview?: (it: FranchiseLocation) => void,
): Action {
  const base = submitBase(it, busy);
  return {
    key: "submit",
    icon: "/icons/arrow_right_alt.svg",
    title: "Submit for review",
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
  } = args;

  if (rowMode === "mine_pending") {
    const a: Action[] = [buildOpenAction(it, busy, onOpen)];
    return addIf(
      a,
      onDeleteOne ? buildDeleteAction(it, busy, onDeleteOne) : null,
    );
  }

  if (rowMode === "mine_approved") {
    const a: Action[] = [buildOpenAction(it, busy, onOpen)];
    addIf(a, onInfo ? buildInfoAction(it, busy, onInfo) : null);
    addIf(
      a,
      onSubmitForReview
        ? buildSubmitForReviewAction(it, busy, onSubmitForReview)
        : null,
    );
    addIf(a, onDeleteOne ? buildDeleteAction(it, busy, onDeleteOne) : null);
    return a;
  }

  if (rowMode === "mine_rejected") {
    const a: Action[] = [buildOpenAction(it, busy, onOpen)];
    addIf(a, onInfo ? buildInfoAction(it, busy, onInfo) : null);
    addIf(a, onResubmit ? buildResubmitAction(it, busy, onResubmit) : null);
    addIf(a, onDeleteOne ? buildDeleteAction(it, busy, onDeleteOne) : null);
    return a;
  }

  if (rowMode === "provider_pending") {
    const a: Action[] = [];
    addIf(a, onInfo ? buildInfoAction(it, busy, onInfo) : null);
    addIf(a, onAskReject ? buildRejectAction(it, busy, onAskReject) : null);
    addIf(a, onDeleteOne ? buildDeleteAction(it, busy, onDeleteOne) : null);
    return a;
  }

  if (rowMode === "provider_approved") {
    const a: Action[] = [];
    addIf(a, onInfo ? buildInfoAction(it, busy, onInfo) : null);
    a.push(buildOpenAction(it, busy, onOpen));
    addIf(a, onAskReject ? buildRejectAction(it, busy, onAskReject) : null);
    addIf(a, onDeleteOne ? buildDeleteAction(it, busy, onDeleteOne) : null);
    return a;
  }

  if (rowMode === "provider_rejected") {
    const a: Action[] = [];
    addIf(a, onInfo ? buildInfoAction(it, busy, onInfo) : null);
    a.push(buildOpenAction(it, busy, onOpen));
    addIf(a, onDeleteOne ? buildDeleteAction(it, busy, onDeleteOne) : null);
    return a;
  }

  return [buildOpenAction(it, busy, onOpen)];
}
