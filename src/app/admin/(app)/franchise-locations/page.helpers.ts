"use client";

import { clean } from "./franchise_locations.utils";

export type MineView = "mine_pending" | "mine_approved" | "mine_rejected";
export type ProviderView =
  | "provider_pending"
  | "provider_approved"
  | "provider_rejected";

export function isSuperAdminUser(
  u: { role?: string | null; isSuperAdmin?: boolean } | null,
) {
  const role = clean(u?.role).toLowerCase();
  return u?.isSuperAdmin === true || role === "super";
}

export function viewLabelMine(v: MineView) {
  if (v === "mine_pending") return "My locations – Pending review";
  if (v === "mine_approved") return "My locations – Approved";
  return "My locations – Rejected";
}

export function viewLabelProvider(v: ProviderView) {
  if (v === "provider_pending") return "Providers – Pending review";
  if (v === "provider_approved") return "Providers – Approved";
  return "Providers – Rejected";
}

export function countLabel(n: number, view: string) {
  if (view === "provider_pending") return `(${n} new)`;
  return `${n} results`;
}
