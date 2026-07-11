import type { FranchiseLocation } from "../types";
import { clean, includesText } from "../franchise_locations.utils";
import { fetchAdmin } from "../franchise_locations.api";

export const pageSize = 8;

export function safeItems(data: unknown): FranchiseLocation[] {
  if (!data || typeof data !== "object" || !("items" in data)) return [];
  const { items } = data as { items?: unknown };
  return Array.isArray(items) ? items : [];
}

function buildHaystack(item: FranchiseLocation) {
  return [item.licenseeFirstName, item.licenseeLastName, item.country, item.city,
    item.state, item.address, item.zip, item.website, item.emailPublic,
    item.phonePublic, item.rejectionReason, item.status, item.ownerName,
    item.ownerEmail, item.ownerUser?.fullName, item.ownerUser?.email]
    .filter(Boolean).join(" | ");
}

export function applySearch(items: FranchiseLocation[], queryText: string) {
  const query = clean(queryText);
  return query ? items.filter((item) => includesText(buildHaystack(item), query)) : items;
}

export async function loadView(view: string) {
  return safeItems(await fetchAdmin(`view=${encodeURIComponent(view)}`));
}

export function clampPage(page: number, pages: number, direction: 1 | -1) {
  return Math.min(Math.max(page + direction, 1), pages);
}
