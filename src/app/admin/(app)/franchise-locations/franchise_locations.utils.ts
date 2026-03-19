// src/app/admin/franchise-locations/utils.ts
import type { FranchiseLocation } from "./types";

export type Status = "pending" | "approved" | "rejected";
export type StatusOrAll = Status | "all";

export type ViewKey =
  | "mine"
  | "mine_pending"
  | "mine_approved"
  | "mine_rejected"
  | "provider_pending"
  | "provider_approved"
  | "provider_rejected";

export type SortKey =
  | "newest"
  | "oldest"
  | "name_az"
  | "name_za"
  | "city_az"
  | "city_za";

export function clean(v?: string | null) {
  return String(v ?? "").trim();
}

export function includesText(hay: string, needle: string) {
  return hay.toLowerCase().includes(needle.toLowerCase());
}

export function fullName(it: FranchiseLocation) {
  return `${clean(it.licenseeFirstName)} ${clean(it.licenseeLastName)}`.trim();
}

export function isPending(it: FranchiseLocation) {
  return clean(it.status) === "pending";
}

export function isApproved(it: FranchiseLocation) {
  return clean(it.status) === "approved";
}

export function isRejected(it: FranchiseLocation) {
  if (clean(it.status) === "rejected") return true;
  return clean(it.rejectionReason).length > 0;
}

export function pendingReviewLabel(it: FranchiseLocation) {
  if (isApproved(it) && it.submittedAt) return "Änderung eingereicht";
  return isPending(it) ? "Wartet auf Freigabe" : "";
}

function ms(v: any) {
  const t = v ? new Date(v).getTime() : 0;
  return Number.isFinite(t) ? t : 0;
}

export function hasDraftChanges(it: FranchiseLocation) {
  const d = ms(it.draftUpdatedAt);
  const l = ms(it.liveUpdatedAt);
  return Boolean(d && (!l || d > l));
}

export function editedAfterReject(it: FranchiseLocation) {
  const d = ms(it.draftUpdatedAt);
  const r = ms(it.rejectedAt);
  return Boolean(d && r && d > r);
}

export function canSubmitUpdate(it: FranchiseLocation) {
  if (isRejected(it)) return editedAfterReject(it);
  if (isApproved(it)) return hasDraftChanges(it);
  return false;
}

export function canTogglePublished(it: FranchiseLocation) {
  return isApproved(it) && !it.submittedAt;
}

export function providerLabel(it: FranchiseLocation) {
  const u = it.ownerUser;
  const name = clean(u?.fullName) || clean(it.ownerName) || "";
  return name || "Lizenznehmer";
}

export function sortLocations(arr: FranchiseLocation[], sort: SortKey) {
  const copy = [...arr];
  copy.sort((a, b) => compareLocations(a, b, sort));
  return copy;
}

function compareLocations(
  a: FranchiseLocation,
  b: FranchiseLocation,
  sort: SortKey,
) {
  if (sort === "newest") return compareDate(b.updatedAt, a.updatedAt);
  if (sort === "oldest") return compareDate(a.updatedAt, b.updatedAt);
  if (sort === "name_az") return compareText(fullName(a), fullName(b));
  if (sort === "name_za") return compareText(fullName(b), fullName(a));
  if (sort === "city_az") return compareText(clean(a.city), clean(b.city));
  return compareText(clean(b.city), clean(a.city));
}

function compareDate(a?: string, b?: string) {
  return clean(a).localeCompare(clean(b));
}

function compareText(a: string, b: string) {
  return clean(a).localeCompare(clean(b), "de");
}

export function paginate<T>(arr: T[], page: number, pageSize: number) {
  const total = arr.length;
  const pages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const safePage = Math.min(Math.max(1, page), pages);
  const start = (safePage - 1) * pageSize;
  return {
    page: safePage,
    pages,
    total,
    items: arr.slice(start, start + pageSize),
  };
}
