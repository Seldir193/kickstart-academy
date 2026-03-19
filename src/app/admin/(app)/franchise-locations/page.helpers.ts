// src/app/admin/(app)/franchise-locations/page.helpers.ts
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
  if (v === "mine_pending") return "Meine Standorte – Zu prüfen";
  if (v === "mine_approved") return "Meine Standorte – Freigegeben";
  return "Meine Standorte – Abgelehnt";
}

export function viewLabelProvider(v: ProviderView) {
  if (v === "provider_pending") return "Lizenznehmer – Zu prüfen";
  if (v === "provider_approved") return "Lizenznehmer – Freigegeben";
  return "Lizenznehmer – Abgelehnt";
}

export function countLabel(n: number, view: string) {
  if (view === "provider_pending") return `(${n} neu)`;
  return `${n} Treffer`;
}
