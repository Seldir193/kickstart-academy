import type { Partner } from "./types";
import { EMPTY_PARTNER } from "./constants";

export type PartnerSortKey = "newest" | "oldest" | "aToZ" | "zToA";
export type PartnerStatusFilter = "all" | "active" | "inactive";

export function getPartnerId(item: Partner) {
  return String(item._id || "").trim();
}

export function clonePartner(item?: Partner): Partner {
  return { ...EMPTY_PARTNER, ...item };
}

export function sortPartners(items: Partner[]) {
  return [...items].sort(comparePartnersByOrderAndName);
}

export function filterPartners(
  items: Partner[],
  query: string,
  status: PartnerStatusFilter,
) {
  return items.filter((item) => matchesPartner(item, query, status));
}

export function paginatePartners(
  items: Partner[],
  page: number,
  pageSize: number,
) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function sortFilteredPartners(items: Partner[], sort: PartnerSortKey) {
  return [...items].sort((a, b) => compareFilteredPartners(a, b, sort));
}

export function isDuplicatePartner(items: Partner[], draft: Partner) {
  return items.some((item) => isSamePartner(item, draft));
}

function matchesPartner(
  item: Partner,
  query: string,
  status: PartnerStatusFilter,
) {
  return matchesPartnerStatus(item, status) && matchesPartnerQuery(item, query);
}

function matchesPartnerStatus(item: Partner, status: PartnerStatusFilter) {
  if (status === "active") return item.isActive === true;
  if (status === "inactive") return item.isActive === false;
  return true;
}

function matchesPartnerQuery(item: Partner, query: string) {
  const term = query.trim().toLowerCase();
  if (!term) return true;
  return getPartnerSearchText(item).includes(term);
}

function getPartnerSearchText(item: Partner) {
  return [item.name, item.url, item.logoUrl].join(" ").toLowerCase();
}

function compareFilteredPartners(a: Partner, b: Partner, sort: PartnerSortKey) {
  if (sort === "aToZ") return comparePartnerName(a, b);
  if (sort === "zToA") return comparePartnerName(b, a);
  return comparePartnerDates(a, b, sort);
}

function comparePartnerDates(a: Partner, b: Partner, sort: PartnerSortKey) {
  const diff = partnerTimestamp(b) - partnerTimestamp(a);
  return sort === "oldest" ? diff * -1 : diff;
}

function partnerTimestamp(item: Partner) {
  const value = item.updatedAt || item.createdAt || "";
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function comparePartnersByOrderAndName(a: Partner, b: Partner) {
  const orderDiff = Number(a.sortOrder || 100) - Number(b.sortOrder || 100);
  return orderDiff || comparePartnerName(a, b);
}

function comparePartnerName(a: Partner, b: Partner) {
  return String(a.name || "").localeCompare(String(b.name || ""));
}

function isSamePartner(item: Partner, draft: Partner) {
  const itemId = getPartnerId(item);
  const draftId = getPartnerId(draft);
  if (itemId && draftId && itemId === draftId) return false;
  return normalizePartnerValue(item.name) === normalizePartnerValue(draft.name);
}

function normalizePartnerValue(value?: string) {
  return String(value || "")
    .trim()
    .toLowerCase();
}
