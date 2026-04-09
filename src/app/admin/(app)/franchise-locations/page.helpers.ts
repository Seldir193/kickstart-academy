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
type TFn = (key: string) => string;
export function viewLabelMine(v: MineView, t: TFn) {
  if (v === "mine_pending")
    return t("common.admin.franchiseLocations.sections.minePending");
  if (v === "mine_approved")
    return t("common.admin.franchiseLocations.sections.mineApproved");
  return t("common.admin.franchiseLocations.sections.mineRejected");
}

export function viewLabelProvider(v: ProviderView, t: TFn) {
  if (v === "provider_pending")
    return t("common.admin.franchiseLocations.sections.providerPending");
  if (v === "provider_approved")
    return t("common.admin.franchiseLocations.sections.providerApproved");
  return t("common.admin.franchiseLocations.sections.providerRejected");
}

export function countLabel(n: number, view: string, t: TFn) {
  if (view === "provider_pending") {
    return t("common.admin.franchiseLocations.count.new").replace(
      "{{count}}",
      String(n),
    );
  }

  return t("common.admin.franchiseLocations.count.results").replace(
    "{{count}}",
    String(n),
  );
}
