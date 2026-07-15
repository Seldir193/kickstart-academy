import { useEffect, useMemo, useState } from "react";
import { GROUPED_COURSE_OPTIONS } from "@/app/lib/courseOptions";
import { toastErrorMessage, toastText } from "@/lib/toast-messages";
import { bookingDisplay } from "../../bookingDisplay";
import { fetchOffers } from "../../api";
import { selectedCourseLabelFor } from "../../formatters";
import {
  SORT_OPTIONS,
  STATUS_OPTIONS,
  type SortOrder,
  type StatusFilter,
} from "../../constants";
import {
  buildOffersMap,
  filteredStornoBookings,
  syncSelected,
} from "../lib/bookings";
import { activeParentEmailOf } from "./useStornoFamilyScope";
import type { Customer } from "../../../../types";
import type { FamilyScopeState, StornoBookingsState, TFunc } from "../types";

export function useStornoBookings(
  customer: Customer,
  scope: FamilyScopeState,
  t: TFunc,
): StornoBookingsState {
  const base = useBookingBaseState();
  const derived = useBookingDerivedState(customer, scope, base, t);
  useLoadOffers(base, t);
  useResetBookingState(customer, scope, base);
  useSelectedBookingSync(derived.filtered, base.selectedId, base.setSelectedId);
  return { ...base, ...derived };
}

function useBookingBaseState() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [courseValue, setCourseValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [selectedId, setSelectedId] = useState("");
  return {
    offers,
    setOffers,
    loading,
    setLoading,
    err,
    setErr,
    courseValue,
    setCourseValue,
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    selectedId,
    setSelectedId,
  };
}

function useBookingDerivedState(
  customer: Customer,
  scope: FamilyScopeState,
  base: ReturnType<typeof useBookingBaseState>,
  t: TFunc,
) {
  const offersById = useMemo(() => buildOffersMap(base.offers), [base.offers]);
  const filtered = useFilteredBookings(customer, scope, base, offersById);
  const selected = useMemo(
    () => filtered.find((b: any) => String(b._id) === base.selectedId) || null,
    [filtered, base.selectedId],
  );
  return {
    filtered,
    selected,
    isCancelled: String(selected?.status || "") === "cancelled",
    ...labels(base, filtered, selected, t),
  };
}

function useFilteredBookings(
  customer: Customer,
  scope: FamilyScopeState,
  base: ReturnType<typeof useBookingBaseState>,
  offersById: Map<string, any>,
) {
  return useMemo(
    () =>
      filteredStornoBookings({
        bookings: customer.bookings || [],
        offersById,
        courseValue: base.courseValue,
        statusFilter: base.statusFilter,
        sortOrder: base.sortOrder,
        bookingTarget: scope.bookingTarget,
        activeChild: scope.activeChild,
        activeParentEmail: activeParentEmailOf(scope),
      }),
    [
      customer.bookings,
      offersById,
      base.courseValue,
      base.statusFilter,
      base.sortOrder,
      scope.bookingTarget,
      scope.activeChild,
      scope.selectedParent,
    ],
  );
}

function labels(
  base: ReturnType<typeof useBookingBaseState>,
  filtered: any[],
  selected: any,
  t: TFunc,
) {
  const statusItems = STATUS_OPTIONS.map((o) => ({
    value: o.value,
    label: t(o.labelKey),
  }));
  const sortItems = SORT_OPTIONS.map((o) => ({
    value: o.value,
    label: t(o.labelKey),
  }));
  return {
    statusItems,
    sortItems,
    statusLabel: optionLabel(statusItems, base.statusFilter),
    sortLabel: optionLabel(sortItems, base.sortOrder),
    selectedCourseLabel: selectedCourseLabelFor(
      base.courseValue,
      GROUPED_COURSE_OPTIONS,
      t,
    ),
    bookingTrigger: bookingTrigger(selected, filtered, base.statusFilter, t),
  };
}

function optionLabel(items: { value: string; label: string }[], value: string) {
  return items.find((item) => item.value === value)?.label || "";
}

function bookingTrigger(
  selected: any,
  filtered: any[],
  statusFilter: StatusFilter,
  t: TFunc,
) {
  if (selected) return bookingDisplay(selected, statusFilter, t);
  if (filtered.length) return selectBookingDisplay(statusFilter, t);
  return noBookingsDisplay(statusFilter, t);
}

function selectBookingDisplay(statusFilter: StatusFilter, t: TFunc) {
  return bookingDisplay(
    {
      offerTitle: toastText(
        t,
        "common.admin.customers.stornoDialog.selectBooking",
        "Select…",
      ),
    },
    statusFilter,
    t,
  );
}

function noBookingsDisplay(statusFilter: StatusFilter, t: TFunc) {
  return bookingDisplay(
    {
      offerTitle: toastText(
        t,
        "common.admin.customers.stornoDialog.noBookings",
        "No bookings",
      ),
    },
    statusFilter,
    t,
  );
}

function useLoadOffers(base: ReturnType<typeof useBookingBaseState>, t: TFunc) {
  useEffect(() => {
    void loadOffers(base, t);
  }, [t]);
}

async function loadOffers(
  base: ReturnType<typeof useBookingBaseState>,
  t: TFunc,
) {
  try {
    startOfferLoading(base);
    base.setOffers(await fetchOffers(500));
  } catch (e: unknown) {
    base.setErr(
      toastErrorMessage(
        t,
        e,
        "common.admin.customers.stornoDialog.errors.loadFailed",
      ),
    );
  } finally {
    base.setLoading(false);
  }
}

function startOfferLoading(base: ReturnType<typeof useBookingBaseState>) {
  base.setLoading(true);
  base.setErr(null);
}

function useResetBookingState(
  customer: Customer,
  scope: FamilyScopeState,
  base: ReturnType<typeof useBookingBaseState>,
) {
  useEffect(() => {
    resetBookingState(base);
  }, [
    customer?._id,
    scope.bookingTarget,
    scope.selectedChildUid,
    scope.selfMemberId,
  ]);
}

function resetBookingState(base: ReturnType<typeof useBookingBaseState>) {
  base.setCourseValue("");
  base.setStatusFilter("active");
  base.setSortOrder("newest");
  base.setSelectedId("");
  base.setErr(null);
}

function useSelectedBookingSync(
  filtered: any[],
  selectedId: string,
  setSelectedId: (v: string) => void,
) {
  useEffect(
    () => syncSelected(filtered, selectedId, setSelectedId),
    [filtered, selectedId],
  );
}
