import { courseValueFromBooking } from "@/app/lib/courseOptions";
import { isBookingCancellable } from "../../bookingRules";
import { applyStatusAndSort } from "../../filtering";
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
  courseValueIsNonCancelable: boolean;
};

export function filteredCancelableBookings(args: FilterArgs) {
  if (args.courseValueIsNonCancelable) return [];
  const base = args.bookings.filter((b) => bookingMatches(b, args));
  const byCourse = filterByCourse(base, args.courseValue, args.offersById);
  return applyStatusAndSort(dedupeBookings(byCourse), args.statusFilter, args.sortOrder);
}

export function buildOffersMap(offers: any[]) {
  const map = new Map<string, any>();
  for (const offer of offers) if (offer?._id) map.set(String(offer._id), offer);
  return map;
}

export function dedupeBookings(items: any[]) {
  const map = new Map<string, any>();
  for (const item of items || []) mergeBooking(map, item);
  return Array.from(map.values());
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
  if (!isBookingCancellable(b, args.offersById)) return false;
  return args.bookingTarget === "child" ? childBookingMatches(b, args) : selfBookingMatches(b, args);
}

function childBookingMatches(b: any, args: FilterArgs) {
  if (safeText(b?.childUid) !== safeText(args.activeChild?.uid)) return false;
  return parentEmailMatches(b, args.activeParentEmail);
}

function selfBookingMatches(b: any, args: FilterArgs) {
  if (safeText(b?.childUid)) return false;
  return parentEmailMatches(b, args.activeParentEmail);
}

function parentEmailMatches(b: any, activeParentEmail: string) {
  if (!activeParentEmail) return true;
  return safeText(b?.parentEmail).toLowerCase() === activeParentEmail;
}

function filterByCourse(items: any[], courseValue: string, offersById: Map<string, any>) {
  if (!courseValue) return items;
  return items.filter((b: any) => courseValueFromBooking(b, offersById) === courseValue);
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

function nextSelected(filtered: any[]) {
  return filtered.find((b: any) => String(b.status || "") !== "cancelled") || filtered[0];
}
