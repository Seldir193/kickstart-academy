import { useEffect, useMemo, useState } from "react";
import { GROUPED_COURSE_OPTIONS } from "@/app/lib/courseOptions";
import { toastErrorMessage } from "@/lib/toast-messages";
import { fetchOffers } from "../../api";
import { buildCourseMeta, isNonCancelableCourseValue } from "../../courseMeta";
import { bookingDisplay } from "../../bookingDisplay";
import { SORT_OPTIONS, STATUS_OPTIONS, type SortOrder, type StatusFilter } from "../../constants";
import { buildOffersMap, filteredCancelableBookings, syncSelected } from "../lib/bookings";
import { activeParentEmailOf } from "./useCancelFamilyScope";
import type { CancelBookingsState, FamilyScopeState, TFunc } from "../types";
import type { Customer } from "../../../../types";

export function useCancelBookings(customer: Customer, scope: FamilyScopeState, t: TFunc): CancelBookingsState {
  const base = useBookingBaseState();
  const derived = useBookingDerivedState(customer, scope, base, t);
  useLoadOffers(base, t);
  useResetBookingState(customer, scope, base);
  useSelectedBookingSync(derived.filteredBookings, base.selectedId, base.setSelectedId);
  return { ...base, ...derived };
}

function useBookingBaseState() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [courseValue, setCourseValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [selectedId, setSelectedId] = useState("");
  return { offers, setOffers, loadingOffers, setLoadingOffers, err, setErr, courseValue, setCourseValue, statusFilter, setStatusFilter, sortOrder, setSortOrder, selectedId, setSelectedId };
}

function useBookingDerivedState(customer: Customer, scope: FamilyScopeState, base: ReturnType<typeof useBookingBaseState>, t: TFunc) {
  const courseMetaByValue = useMemo(() => buildCourseMeta(GROUPED_COURSE_OPTIONS), []);
  const courseValueIsNonCancelable = useMemo(() => isNonCancelableCourseValue(base.courseValue, courseMetaByValue), [base.courseValue, courseMetaByValue]);
  const offersById = useMemo(() => buildOffersMap(base.offers), [base.offers]);
  const filteredBookings = useFilteredBookings(customer, scope, base, offersById, courseValueIsNonCancelable);
  const selected = useMemo(() => filteredBookings.find((b: any) => String(b._id) === base.selectedId) || null, [filteredBookings, base.selectedId]);
  return { courseValueIsNonCancelable, filteredBookings, selected, selectedIsCancelled: String(selected?.status || "") === "cancelled", ...labels(base, filteredBookings, selected, courseValueIsNonCancelable, t) };
}

function useFilteredBookings(customer: Customer, scope: FamilyScopeState, base: ReturnType<typeof useBookingBaseState>, offersById: Map<string, any>, courseValueIsNonCancelable: boolean) {
  return useMemo(() => filteredCancelableBookings({ bookings: customer.bookings || [], offersById, courseValue: base.courseValue, courseValueIsNonCancelable, statusFilter: base.statusFilter, sortOrder: base.sortOrder, bookingTarget: scope.bookingTarget, activeChild: scope.activeChild, activeParentEmail: activeParentEmailOf(scope) }), [customer.bookings, offersById, base.courseValue, courseValueIsNonCancelable, base.statusFilter, base.sortOrder, scope.bookingTarget, scope.activeChild, scope.selectedParent]);
}

function labels(base: ReturnType<typeof useBookingBaseState>, filteredBookings: any[], selected: any, nonCancelable: boolean, t: TFunc) {
  const statusItems = STATUS_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }));
  const sortItems = SORT_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }));
  return { statusItems, sortItems, statusLabel: optionLabel(statusItems, base.statusFilter, t("common.admin.customers.cancelDialog.statusActive")), sortLabel: optionLabel(sortItems, base.sortOrder, t("common.admin.customers.cancelDialog.sortNewest")), selectedCourseLabel: selectedCourseLabel(base.courseValue, t), bookingTrigger: bookingTrigger(nonCancelable, selected, filteredBookings, base.statusFilter, t) };
}

function optionLabel(items: { value: string; label: string }[], value: string, fallback: string) {
  return items.find((item) => item.value === value)?.label || fallback;
}

function selectedCourseLabel(courseValue: string, t: TFunc) {
  if (!courseValue) return t("common.admin.customers.cancelDialog.allCourses");
  return foundCourseLabel(courseValue) || t("common.admin.customers.cancelDialog.allCourses");
}

function foundCourseLabel(courseValue: string) {
  for (const group of GROUPED_COURSE_OPTIONS) {
    const found = group.items.find((opt: any) => opt.value === courseValue);
    if (found) return found.label;
  }
  return "";
}

function bookingTrigger(nonCancelable: boolean, selected: any, filtered: any[], statusFilter: StatusFilter, t: TFunc) {
  if (nonCancelable) return bookingDisplay(null, true, statusFilter, t);
  if (selected) return bookingDisplay(selected, false, statusFilter, t);
  if (filtered.length) return bookingDisplay("select", false, statusFilter, t);
  return bookingDisplay(null, false, statusFilter, t);
}

function useLoadOffers(base: ReturnType<typeof useBookingBaseState>, t: TFunc) {
  useEffect(() => {
    void loadOffers(base, t);
  }, []);
}

async function loadOffers(base: ReturnType<typeof useBookingBaseState>, t: TFunc) {
  try {
    startOfferLoading(base);
    base.setOffers(await fetchOffers(500));
  } catch (e: unknown) {
    base.setErr(toastErrorMessage(t, e, "common.admin.customers.cancelDialog.errors.loadOffers"));
  } finally {
    base.setLoadingOffers(false);
  }
}

function startOfferLoading(base: ReturnType<typeof useBookingBaseState>) {
  base.setLoadingOffers(true);
  base.setErr(null);
}

function useResetBookingState(customer: Customer, scope: FamilyScopeState, base: ReturnType<typeof useBookingBaseState>) {
  useEffect(() => {
    resetBookingState(base);
  }, [customer?._id, scope.bookingTarget, scope.selectedChildUid, scope.selfMemberId]);
}

function resetBookingState(base: ReturnType<typeof useBookingBaseState>) {
  base.setCourseValue("");
  base.setStatusFilter("active");
  base.setSortOrder("newest");
  base.setSelectedId("");
  base.setErr(null);
}

function useSelectedBookingSync(filteredBookings: any[], selectedId: string, setSelectedId: (v: string) => void) {
  useEffect(() => syncSelected(filteredBookings, selectedId, setSelectedId), [filteredBookings, selectedId]);
}
