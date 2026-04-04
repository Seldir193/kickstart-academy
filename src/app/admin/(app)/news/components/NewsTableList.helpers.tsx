// src/app/admin/(app)/news/components/NewsTableList.helpers.tsx
"use client";

import type React from "react";
import type { News } from "../types";

type ProviderInfo = { id?: string; fullName?: string; email?: string } | null;

export type NewsWithProvider = News & {
  provider?: ProviderInfo;
  providerId?: any;
};

export type RowMode =
  | "mine_pending"
  | "mine_approved"
  | "mine_rejected"
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
  changeAt: string;
};

const DRAFT_FIELDS = [
  "title",
  "excerpt",
  "content",
  "category",
  "tags",
  "media",
  "date",
  "slug",
];

export function clean(v: unknown) {
  return String(v ?? "").trim();
}

export function idOf(n: any) {
  return clean(n?._id || n?.id || n?.slug);
}

function statusOf(n: any) {
  const s = clean(n?.status);
  if (s === "pending" || s === "approved" || s === "rejected") return s;
  return "";
}

export function isSubmitted(n: any) {
  return Boolean(clean(n?.submittedAt));
}

function everApproved(n: any) {
  return Boolean(clean(n?.approvedAt));
}

function isApproved(n: any) {
  return statusOf(n) === "approved" && !isSubmitted(n);
}

function isPublished(n: any) {
  return (n as any)?.published === true;
}

export function isRejected(n: any) {
  if (statusOf(n) === "rejected") return true;
  return clean(n?.rejectionReason).length > 0;
}

export function hasDraftObject(n: any) {
  return n?.hasDraft === true && n?.draft && typeof n.draft === "object";
}

export function draftOf(n: any) {
  return hasDraftObject(n) ? (n.draft as any) : null;
}

function timeOf(v: any) {
  const s = clean(v);
  if (!s) return 0;
  const t = new Date(s).getTime();
  return Number.isFinite(t) ? t : 0;
}

function backendCanSubmitForReview(it: any) {
  const status = clean(it?.status);
  const draftUpdatedAt = timeOf(it?.draftUpdatedAt);
  const liveUpdatedAt = timeOf(it?.liveUpdatedAt);
  const rejectedAt = timeOf(it?.rejectedAt);

  if (status === "rejected")
    return Boolean(draftUpdatedAt && rejectedAt && draftUpdatedAt > rejectedAt);
  if (status === "approved")
    return Boolean(
      draftUpdatedAt && (!liveUpdatedAt || draftUpdatedAt > liveUpdatedAt),
    );
  return (
    Boolean(
      draftUpdatedAt && (!liveUpdatedAt || draftUpdatedAt > liveUpdatedAt),
    ) || Boolean(it?.hasDraft)
  );
}

function normStr(v: any) {
  const s = clean(v);
  return s.length ? s : null;
}

function normTags(v: any) {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => normStr(x))
    .filter(Boolean)
    .sort();
}

function normMedia(v: any) {
  if (!Array.isArray(v)) return [];
  const norm = v
    .map((m) => {
      if (!m || typeof m !== "object") return null;
      const url = normStr((m as any).url);
      const type = normStr((m as any).type);
      const name = normStr((m as any).name);
      const mime = normStr((m as any).mime);
      const out: any = { url };
      if (type) out.type = type;
      if (name) out.name = name;
      if (mime) out.mime = mime;
      return url ? out : null;
    })
    .filter(Boolean) as any[];

  return norm.sort((a, b) => String(a.url).localeCompare(String(b.url)));
}

function normComparableByField(field: string, v: any) {
  if (field === "tags") return normTags(v);
  if (field === "media") return normMedia(v);
  if (field === "date") return normStr(v);
  if (typeof v === "string") return normStr(v);
  if (v == null) return null;
  return v;
}

function hasDraftChanges(n: any) {
  const d = draftOf(n);
  if (!d) return false;

  return DRAFT_FIELDS.some((k) => {
    const a = normComparableByField(k, (d as any)[k]);
    const b = normComparableByField(k, (n as any)[k]);
    return JSON.stringify(a) !== JSON.stringify(b);
  });
}

export function hasDraftAnyField(n: any) {
  return hasDraftChanges(n);
}

export function canSubmitForReview(n: any) {
  return backendCanSubmitForReview(n);
}

export function statusClass(n: any) {
  if (isRejected(n)) return "is-rejected";
  if (isApproved(n) && isPublished(n)) return "is-on";
  return "is-off";
}

export function providerLabel(n: NewsWithProvider) {
  const p = n?.provider;
  const name = clean(p?.fullName);
  if (name) return name;
  const mail = clean(p?.email);
  if (mail) return mail;
  const pid = clean((n as any)?.providerId);
  return pid || "—";
}

export function fmtDateDe(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(d);
}

export function getNeedsCorrection(n: any) {
  const required = (n as any)?.correctionRequired === true;
  const fixedAt = clean((n as any)?.correctionFixedAt);
  return required && !fixedAt;
}

export function getDraftDelta(n: any) {
  const d = draftOf(n);
  return {
    draftTitle: clean(d?.title),
    draftExcerpt: clean(d?.excerpt),
    draftCategory: clean(d?.category),
  };
}

function isUpdateReview(n: any) {
  return isSubmitted(n) && everApproved(n);
}

function minePendingLabel(n: any) {
  return isUpdateReview(n) ? "Under review" : "Awaiting approval";
}

export function statusParts(n: any, rowMode: RowMode): StatusParts {
  if (rowMode === "mine_rejected" || rowMode === "provider_rejected") {
    return { main: "Rejected", sub: "", hint: "", changeAt: "" };
  }

  if (rowMode === "mine_pending") {
    return { main: minePendingLabel(n), sub: "", hint: "", changeAt: "" };
  }

  if (isApproved(n)) {
    return {
      main: "Approved",
      sub: isPublished(n) ? "Online" : "Offline",
      hint: "",
      changeAt: "",
    };
  }

  if (isSubmitted(n)) {
    return { main: "Awaiting approval", sub: "", hint: "", changeAt: "" };
  }

  return { main: "Awaiting approval", sub: "", hint: "", changeAt: "" };
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
  n: NewsWithProvider,
  busy: boolean,
  onOpen: (n: News) => void,
): Action {
  return {
    key: "open",
    icon: "/icons/edit.svg",
    title: "Edit",
    disabled: busy,
    run: () => onOpen(n),
  };
}

export function buildInfoAction(
  n: NewsWithProvider,
  busy: boolean,
  onInfo: (n: News) => void,
): Action {
  return {
    key: "info",
    icon: "/icons/info.svg",
    title: "Info",
    disabled: busy,
    run: () => onInfo(n),
  };
}

export function buildRejectAction(
  n: NewsWithProvider,
  busy: boolean,
  onAskReject?: (n: News) => void,
): Action {
  return {
    key: "reject",
    icon: "/icons/arrow_right_alt.svg",
    title: "Reject",
    left: true,
    disabled: busy,
    run: () => onAskReject?.(n),
  };
}

export function buildDeleteAction(
  n: NewsWithProvider,
  busy: boolean,
  onDeleteOne?: (n: News) => void,
): Action {
  return {
    key: "delete",
    icon: "/icons/delete.svg",
    title: "Delete",
    disabled: busy,
    run: () => onDeleteOne?.(n),
  };
}

function submitBase(n: NewsWithProvider, busy: boolean) {
  const ok = canSubmitForReview(n);
  return {
    ok,
    disabled: busy || !ok,
    tip: ok ? undefined : "Please update first",
  };
}

export function buildResubmitAction(
  n: NewsWithProvider,
  busy: boolean,
  onResubmit?: (n: News) => void,
): Action {
  const base = submitBase(n, busy);
  return {
    key: "resubmit",
    icon: "/icons/arrow_right_alt.svg",
    title: "Resubmit",
    left: true,
    disabled: base.disabled,
    tip: base.tip,
    run: () => onResubmit?.(n),
  };
}

export function buildSubmitForReviewAction(
  n: NewsWithProvider,
  busy: boolean,
  onSubmitForReview?: (n: News) => void,
): Action {
  const base = submitBase(n, busy);
  return {
    key: "submit",
    icon: "/icons/arrow_right_alt.svg",
    title: "Submit for review",
    left: true,
    disabled: base.disabled,
    tip: base.tip,
    run: () => onSubmitForReview?.(n),
  };
}

export function actionsFor(args: {
  n: NewsWithProvider;
  rowMode: RowMode;
  busy: boolean;
  onOpen: (n: News) => void;
  onInfo: (n: News) => void;
  onResubmit?: (n: News) => void;
  onSubmitForReview?: (n: News) => void;
  onDeleteOne?: (n: News) => void;
  onAskReject?: (n: News) => void;
}) {
  const {
    n,
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
    const a: Action[] = [buildOpenAction(n, busy, onOpen)];
    if (onDeleteOne) a.push(buildDeleteAction(n, busy, onDeleteOne));
    return a;
  }

  if (rowMode === "mine_approved") {
    const a: Action[] = [
      buildInfoAction(n, busy, onInfo),
      buildOpenAction(n, busy, onOpen),
    ];
    if (onSubmitForReview)
      a.push(buildSubmitForReviewAction(n, busy, onSubmitForReview));
    if (onDeleteOne) a.push(buildDeleteAction(n, busy, onDeleteOne));
    return a;
  }

  if (rowMode === "mine_rejected") {
    const a: Action[] = [
      buildInfoAction(n, busy, onInfo),
      buildOpenAction(n, busy, onOpen),
    ];
    if (onResubmit) a.push(buildResubmitAction(n, busy, onResubmit));
    if (onDeleteOne) a.push(buildDeleteAction(n, busy, onDeleteOne));
    return a;
  }

  if (rowMode === "provider_approved") {
    const a: Action[] = [
      buildOpenAction(n, busy, onOpen),
      buildInfoAction(n, busy, onInfo),
    ];
    if (onAskReject) a.push(buildRejectAction(n, busy, onAskReject));
    if (onDeleteOne) a.push(buildDeleteAction(n, busy, onDeleteOne));
    return a;
  }

  if (rowMode === "provider_rejected") {
    const a: Action[] = [
      buildOpenAction(n, busy, onOpen),
      buildInfoAction(n, busy, onInfo),
    ];
    if (onDeleteOne) a.push(buildDeleteAction(n, busy, onDeleteOne));
    return a;
  }

  return [buildOpenAction(n, busy, onOpen)];
}

// // src/app/admin/(app)/news/components/NewsTableList.helpers.tsx
// "use client";

// import type React from "react";
// import type { News } from "../types";

// type ProviderInfo = { id?: string; fullName?: string; email?: string } | null;

// export type NewsWithProvider = News & {
//   provider?: ProviderInfo;
//   providerId?: any;
// };

// export type RowMode =
//   | "mine_pending"
//   | "mine_approved"
//   | "mine_rejected"
//   | "provider_approved"
//   | "provider_rejected";

// export type Action = {
//   key: string;
//   icon: string;
//   title: string;
//   left?: boolean;
//   disabled: boolean;
//   tip?: string;
//   run: () => void | Promise<void>;
// };

// export type StatusParts = {
//   main: string;
//   sub: string;
//   hint: string;
//   changeAt: string;
// };

// const DRAFT_FIELDS = [
//   "title",
//   "excerpt",
//   "content",
//   "category",
//   "tags",
//   "media",
//   "date",
//   "slug",
// ];

// export function clean(v: unknown) {
//   return String(v ?? "").trim();
// }

// export function idOf(n: any) {
//   return clean(n?._id || n?.id || n?.slug);
// }

// function statusOf(n: any) {
//   const s = clean(n?.status);
//   if (s === "pending" || s === "approved" || s === "rejected") return s;
//   return "";
// }

// export function isSubmitted(n: any) {
//   return Boolean(clean(n?.submittedAt));
// }

// function everApproved(n: any) {
//   return Boolean(clean(n?.approvedAt));
// }

// function isApproved(n: any) {
//   return statusOf(n) === "approved" && !isSubmitted(n);
// }

// function isPublished(n: any) {
//   return (n as any)?.published === true;
// }

// export function isRejected(n: any) {
//   if (statusOf(n) === "rejected") return true;
//   return clean(n?.rejectionReason).length > 0;
// }

// export function hasDraftObject(n: any) {
//   return n?.hasDraft === true && n?.draft && typeof n.draft === "object";
// }

// export function draftOf(n: any) {
//   return hasDraftObject(n) ? (n.draft as any) : null;
// }

// function timeOf(v: any) {
//   const s = clean(v);
//   if (!s) return 0;
//   const t = new Date(s).getTime();
//   return Number.isFinite(t) ? t : 0;
// }

// function backendCanSubmitForReview(it: any) {
//   const status = clean(it?.status);
//   const draftUpdatedAt = timeOf(it?.draftUpdatedAt);
//   const liveUpdatedAt = timeOf(it?.liveUpdatedAt);
//   const rejectedAt = timeOf(it?.rejectedAt);

//   if (status === "rejected")
//     return Boolean(draftUpdatedAt && rejectedAt && draftUpdatedAt > rejectedAt);
//   if (status === "approved")
//     return Boolean(
//       draftUpdatedAt && (!liveUpdatedAt || draftUpdatedAt > liveUpdatedAt),
//     );
//   return (
//     Boolean(
//       draftUpdatedAt && (!liveUpdatedAt || draftUpdatedAt > liveUpdatedAt),
//     ) || Boolean(it?.hasDraft)
//   );
// }

// function normStr(v: any) {
//   const s = clean(v);
//   return s.length ? s : null;
// }

// function normTags(v: any) {
//   if (!Array.isArray(v)) return [];
//   return v
//     .map((x) => normStr(x))
//     .filter(Boolean)
//     .sort();
// }

// function normMedia(v: any) {
//   if (!Array.isArray(v)) return [];
//   const norm = v
//     .map((m) => {
//       if (!m || typeof m !== "object") return null;
//       const url = normStr((m as any).url);
//       const type = normStr((m as any).type);
//       const name = normStr((m as any).name);
//       const mime = normStr((m as any).mime);
//       const out: any = { url };
//       if (type) out.type = type;
//       if (name) out.name = name;
//       if (mime) out.mime = mime;
//       return url ? out : null;
//     })
//     .filter(Boolean) as any[];

//   return norm.sort((a, b) => String(a.url).localeCompare(String(b.url)));
// }

// function normComparableByField(field: string, v: any) {
//   if (field === "tags") return normTags(v);
//   if (field === "media") return normMedia(v);
//   if (field === "date") return normStr(v);
//   if (typeof v === "string") return normStr(v);
//   if (v == null) return null;
//   return v;
// }

// function hasDraftChanges(n: any) {
//   const d = draftOf(n);
//   if (!d) return false;

//   return DRAFT_FIELDS.some((k) => {
//     const a = normComparableByField(k, (d as any)[k]);
//     const b = normComparableByField(k, (n as any)[k]);
//     return JSON.stringify(a) !== JSON.stringify(b);
//   });
// }

// export function hasDraftAnyField(n: any) {
//   return hasDraftChanges(n);
// }

// export function canSubmitForReview(n: any) {
//   return backendCanSubmitForReview(n);
// }

// export function statusClass(n: any) {
//   if (isRejected(n)) return "is-rejected";
//   if (isApproved(n) && isPublished(n)) return "is-on";
//   return "is-off";
// }

// export function providerLabel(n: NewsWithProvider) {
//   const p = n?.provider;
//   const name = clean(p?.fullName);
//   if (name) return name;
//   const mail = clean(p?.email);
//   if (mail) return mail;
//   const pid = clean((n as any)?.providerId);
//   return pid || "—";
// }

// export function fmtDateDe(value?: string) {
//   if (!value) return "—";
//   const d = new Date(value);
//   if (isNaN(d.getTime())) return value;
//   return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(d);
// }

// export function getNeedsCorrection(n: any) {
//   const required = (n as any)?.correctionRequired === true;
//   const fixedAt = clean((n as any)?.correctionFixedAt);
//   return required && !fixedAt;
// }

// export function getDraftDelta(n: any) {
//   const d = draftOf(n);
//   return {
//     draftTitle: clean(d?.title),
//     draftExcerpt: clean(d?.excerpt),
//     draftCategory: clean(d?.category),
//   };
// }

// function isUpdateReview(n: any) {
//   return isSubmitted(n) && everApproved(n);
// }

// function minePendingLabel(n: any) {
//   return isUpdateReview(n) ? "Wird geprüft" : "Wartet auf Freigabe";
// }

// export function statusParts(n: any, rowMode: RowMode): StatusParts {
//   if (rowMode === "mine_rejected" || rowMode === "provider_rejected") {
//     return { main: "Abgelehnt", sub: "", hint: "", changeAt: "" };
//   }

//   if (rowMode === "mine_pending") {
//     return { main: minePendingLabel(n), sub: "", hint: "", changeAt: "" };
//   }

//   if (isApproved(n)) {
//     return {
//       main: "Freigegeben",
//       sub: isPublished(n) ? "Online" : "Offline",
//       hint: "",
//       changeAt: "",
//     };
//   }

//   if (isSubmitted(n)) {
//     return { main: "Wartet auf Freigabe", sub: "", hint: "", changeAt: "" };
//   }

//   return { main: "Wartet auf Freigabe", sub: "", hint: "", changeAt: "" };
// }

// export function blurTarget(t: EventTarget | null) {
//   const el = t as any;
//   if (el && typeof el.blur === "function") el.blur();
// }

// export function stop(e: React.SyntheticEvent) {
//   e.preventDefault();
//   e.stopPropagation();
// }

// export function onActionKey(
//   e: React.KeyboardEvent,
//   run: () => void,
//   disabled: boolean,
// ) {
//   if (disabled) return;
//   if (e.key !== "Enter" && e.key !== " ") return;
//   e.preventDefault();
//   e.stopPropagation();
//   blurTarget(e.currentTarget);
//   run();
// }

// export function buildOpenAction(
//   n: NewsWithProvider,
//   busy: boolean,
//   onOpen: (n: News) => void,
// ): Action {
//   return {
//     key: "open",
//     icon: "/icons/edit.svg",
//     title: "Bearbeiten",
//     disabled: busy,
//     run: () => onOpen(n),
//   };
// }

// export function buildInfoAction(
//   n: NewsWithProvider,
//   busy: boolean,
//   onInfo: (n: News) => void,
// ): Action {
//   return {
//     key: "info",
//     icon: "/icons/info.svg",
//     title: "Info",
//     disabled: busy,
//     run: () => onInfo(n),
//   };
// }

// export function buildRejectAction(
//   n: NewsWithProvider,
//   busy: boolean,
//   onAskReject?: (n: News) => void,
// ): Action {
//   return {
//     key: "reject",
//     icon: "/icons/arrow_right_alt.svg",
//     title: "Ablehnen",
//     left: true,
//     disabled: busy,
//     run: () => onAskReject?.(n),
//   };
// }

// export function buildDeleteAction(
//   n: NewsWithProvider,
//   busy: boolean,
//   onDeleteOne?: (n: News) => void,
// ): Action {
//   return {
//     key: "delete",
//     icon: "/icons/delete.svg",
//     title: "Löschen",
//     disabled: busy,
//     run: () => onDeleteOne?.(n),
//   };
// }

// function submitBase(n: NewsWithProvider, busy: boolean) {
//   const ok = canSubmitForReview(n);
//   return {
//     ok,
//     disabled: busy || !ok,
//     tip: ok ? undefined : "Bitte zuerst aktualisieren",
//   };
// }

// export function buildResubmitAction(
//   n: NewsWithProvider,
//   busy: boolean,
//   onResubmit?: (n: News) => void,
// ): Action {
//   const base = submitBase(n, busy);
//   return {
//     key: "resubmit",
//     icon: "/icons/arrow_right_alt.svg",
//     title: "Erneut senden",
//     left: true,
//     disabled: base.disabled,
//     tip: base.tip,
//     run: () => onResubmit?.(n),
//   };
// }

// export function buildSubmitForReviewAction(
//   n: NewsWithProvider,
//   busy: boolean,
//   onSubmitForReview?: (n: News) => void,
// ): Action {
//   const base = submitBase(n, busy);
//   return {
//     key: "submit",
//     icon: "/icons/arrow_right_alt.svg",
//     title: "Zum Prüfen einreichen",
//     left: true,
//     disabled: base.disabled,
//     tip: base.tip,
//     run: () => onSubmitForReview?.(n),
//   };
// }

// export function actionsFor(args: {
//   n: NewsWithProvider;
//   rowMode: RowMode;
//   busy: boolean;
//   onOpen: (n: News) => void;
//   onInfo: (n: News) => void;
//   onResubmit?: (n: News) => void;
//   onSubmitForReview?: (n: News) => void;
//   onDeleteOne?: (n: News) => void;
//   onAskReject?: (n: News) => void;
// }) {
//   const {
//     n,
//     rowMode,
//     busy,
//     onOpen,
//     onInfo,
//     onResubmit,
//     onSubmitForReview,
//     onDeleteOne,
//     onAskReject,
//   } = args;

//   if (rowMode === "mine_pending") {
//     const a: Action[] = [buildOpenAction(n, busy, onOpen)];
//     if (onDeleteOne) a.push(buildDeleteAction(n, busy, onDeleteOne));
//     return a;
//   }

//   if (rowMode === "mine_approved") {
//     const a: Action[] = [
//       buildInfoAction(n, busy, onInfo),
//       buildOpenAction(n, busy, onOpen),
//     ];
//     if (onSubmitForReview)
//       a.push(buildSubmitForReviewAction(n, busy, onSubmitForReview));
//     if (onDeleteOne) a.push(buildDeleteAction(n, busy, onDeleteOne));
//     return a;
//   }

//   if (rowMode === "mine_rejected") {
//     const a: Action[] = [
//       buildInfoAction(n, busy, onInfo),
//       buildOpenAction(n, busy, onOpen),
//     ];
//     if (onResubmit) a.push(buildResubmitAction(n, busy, onResubmit));
//     if (onDeleteOne) a.push(buildDeleteAction(n, busy, onDeleteOne));
//     return a;
//   }

//   if (rowMode === "provider_approved") {
//     const a: Action[] = [
//       buildOpenAction(n, busy, onOpen),
//       buildInfoAction(n, busy, onInfo),
//     ];
//     if (onAskReject) a.push(buildRejectAction(n, busy, onAskReject));
//     if (onDeleteOne) a.push(buildDeleteAction(n, busy, onDeleteOne));
//     return a;
//   }

//   if (rowMode === "provider_rejected") {
//     const a: Action[] = [
//       buildOpenAction(n, busy, onOpen),
//       buildInfoAction(n, busy, onInfo),
//     ];
//     if (onDeleteOne) a.push(buildDeleteAction(n, busy, onDeleteOne));
//     return a;
//   }

//   return [buildOpenAction(n, busy, onOpen)];
// }
