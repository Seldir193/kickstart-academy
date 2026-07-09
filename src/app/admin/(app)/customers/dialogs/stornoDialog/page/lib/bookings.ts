import { courseValueFromBooking } from "@/app/lib/courseOptions";
import type { BookingTarget } from "../types";
import type { SortOrder, StatusFilter } from "../../constants";
import { safeText } from "./familyOptions";

type FilterArgs = {
  bookings: any[];
  offersById: Map<string, any>;
  courseValue: string;
  statusFilter: StatusFilter;
  sortOrder: SortOrder;
  bookingTarget: BookingTarget;
  activeChild: any | null;
  activeParentEmail: string;
};

export function buildOffersMap(offers: any[]) {
  const map = new Map<string, any>();
  for (const offer of offers) if (offer?._id) map.set(String(offer._id), offer);
  return map;
}

export function filteredStornoBookings(args: FilterArgs) {
  const base = args.bookings.filter((booking) => bookingMatches(booking, args));
  const byCourse = filterByCourse(base, args.courseValue, args.offersById);
  return applyStatusAndSort(
    dedupeBookings(byCourse),
    args.statusFilter,
    args.sortOrder,
  );
}

export function syncSelected(
  filtered: any[],
  selectedId: string,
  setSelectedId: (v: string) => void,
) {
  if (!filtered.length) return void setSelectedId("");
  if (filtered.some((b: any) => String(b._id) === String(selectedId))) return;
  setSelectedId(String(nextSelected(filtered)?._id || ""));
}

function bookingMatches(b: any, args: FilterArgs) {
  return args.bookingTarget === "child"
    ? childBookingMatches(b, args)
    : selfBookingMatches(b, args);
}

function childBookingMatches(b: any, args: FilterArgs) {
  if (safeText(b?.childUid) !== safeText(args.activeChild?.uid)) return false;
  return parentEmailCompatible(b, args.activeParentEmail);
}

function selfBookingMatches(b: any, args: FilterArgs) {
  if (!isSelfScopedBooking(b)) return false;
  return parentEmailCompatible(b, args.activeParentEmail);
}

function parentEmailCompatible(b: any, activeParentEmail: string) {
  const bookingParentEmail = safeText(b?.parentEmail).toLowerCase();
  if (!activeParentEmail) return true;
  if (!bookingParentEmail) return true;
  return bookingParentEmail === activeParentEmail;
}

function filterByCourse(
  items: any[],
  courseValue: string,
  offersById: Map<string, any>,
) {
  if (!courseValue) return items;
  return items.filter(
    (b: any) => courseValueFromBooking(b, offersById) === courseValue,
  );
}

function dedupeBookings(items: any[]) {
  const map = new Map<string, any>();
  for (const item of items || []) mergeBooking(map, item);
  return Array.from(map.values());
}

function mergeBooking(map: Map<string, any>, item: any) {
  const key = bookingIdentityKey(item);
  if (!key) return;
  const current = map.get(key);
  if (!current || bookingRank(item) > bookingRank(current)) map.set(key, item);
}

function bookingIdentityKey(b: any) {
  return String(b?._id || b?.bookingId || "").trim();
}

function bookingRank(b: any) {
  return invoiceRank(b) + dateRank(b);
}

function invoiceRank(b: any) {
  return safeText(b?.invoiceNumber || b?.invoiceNo) ? 100 : 0;
}

function dateRank(b: any) {
  let rank = 0;
  if (b?.invoiceDate) rank += 20;
  if (b?.cancelDate || b?.cancellationDate) rank += 10;
  if (b?.endDate) rank += 5;
  if (b?.createdAt) rank += 2;
  return rank;
}

function isSelfScopedBooking(b: any) {
  const child = bookingChildParts(b);
  if (!child.uid) return true;
  if (!child.first && !child.last) return true;
  return child.first === child.parentFirst && child.last === child.parentLast;
}

function bookingChildParts(b: any) {
  return {
    uid: safeText(b?.childUid),
    first: safeText(b?.childFirstName).toLowerCase(),
    last: safeText(b?.childLastName).toLowerCase(),
    parentFirst: safeText(b?.parentFirstName).toLowerCase(),
    parentLast: safeText(b?.parentLastName).toLowerCase(),
  };
}

function applyStatusAndSort(
  items: any[],
  status: StatusFilter,
  sort: SortOrder,
) {
  const filtered =
    status === "all" ? items : items.filter((b) => statusMatches(b, status));
  return [...filtered].sort((a, b) => compareBookings(a, b, sort));
}

function statusMatches(b: any, status: StatusFilter) {
  const current = String(b?.status || "")
    .trim()
    .toLowerCase();
  if (status === "active") return current !== "cancelled";
  if (status === "cancelled") return current === "cancelled";
  return true;
}

function compareBookings(a: any, b: any, sort: SortOrder) {
  const dir = sort === "newest" ? -1 : 1;
  return (
    timeCompare(a, b, dir) || invoiceCompare(a, b, dir) || titleCompare(a, b)
  );
}

function timeCompare(a: any, b: any, dir: number) {
  const diff = sortTime(a) - sortTime(b);
  return diff ? diff * dir : 0;
}

function invoiceCompare(a: any, b: any, dir: number) {
  const ai = safeText(a?.invoiceNumber || a?.invoiceNo);
  const bi = safeText(b?.invoiceNumber || b?.invoiceNo);
  return ai !== bi ? ai.localeCompare(bi) * dir : 0;
}

function titleCompare(a: any, b: any) {
  return safeText(a?.offerTitle).localeCompare(safeText(b?.offerTitle));
}

function sortTime(b: any) {
  return firstTime(b?.invoiceDate, b?.createdAt, b?.date);
}

function firstTime(...values: any[]) {
  for (const value of values)
    if (toTime(value) != null) return toTime(value) || 0;
  return 0;
}

function toTime(v: any) {
  if (!v) return null;
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : null;
}

function nextSelected(filtered: any[]) {
  return (
    filtered.find((b: any) => String(b.status || "") !== "cancelled") ||
    filtered[0]
  );
}
