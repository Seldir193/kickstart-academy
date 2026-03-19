//src\app\admin\(app)\customers\dialogs\cancelDialog\filtering.ts
import type { SortOrder, StatusFilter } from "./constants";

export function applyStatusAndSort(
  items: any[],
  status: StatusFilter,
  sort: SortOrder,
) {
  const filtered = filterByStatus(items, status);
  const dir = sort === "newest" ? -1 : 1;
  return [...filtered].sort((a, b) => compareBookings(a, b, dir));
}

function filterByStatus(items: any[], status: StatusFilter) {
  if (status === "all") return items;
  return items.filter((b) => isWantedStatus(b, status));
}

function isWantedStatus(b: any, status: StatusFilter) {
  const s = String(b?.status || "")
    .trim()
    .toLowerCase();
  if (status === "active") return s !== "cancelled";
  if (status === "cancelled") return s === "cancelled";
  return true;
}

function compareBookings(a: any, b: any, dir: number) {
  const at = sortTime(a);
  const bt = sortTime(b);
  if (at !== bt) return (at - bt) * dir;
  const ai = invoiceKey(a);
  const bi = invoiceKey(b);
  if (ai !== bi) return ai.localeCompare(bi) * dir;
  return titleKey(a).localeCompare(titleKey(b));
}

function sortTime(b: any) {
  return (
    pickTime(b?.invoiceDate) ?? pickTime(b?.createdAt) ?? pickTime(b?.date) ?? 0
  );
}

function pickTime(v: any) {
  if (!v) return null;
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : null;
}

function invoiceKey(b: any) {
  return String(b?.invoiceNumber || b?.invoiceNo || "").trim();
}

function titleKey(b: any) {
  return String(b?.offerTitle || "").trim();
}
