"use client";

import { useEffect, useMemo, useRef } from "react";
import { useSelection } from "@/app/admin/(app)/news/hooks/useSelection";
import type { BookingsTableProps } from "./types";
import { blurBulkRefs, focusClearOrCancel, idOf, restoreIds } from "./bookingRowUtils";

export function useBookingsTableState(props: BookingsTableProps) {
  const selection = useBookingsSelection(props);
  const refs = useBulkRefs();
  const busy = useBulkBusy(props);
  const counts = useBulkCounts(props, selection.selected);
  useBulkFocus(props.selectMode, counts.count, refs);
  const handlers = useBookingHandlers(props, selection, refs, busy.any);
  return { selection, refs, busy, counts, handlers };
}

function useBookingsSelection(props: BookingsTableProps) {
  const ids = useMemo(() => props.items.map(idOf).filter(Boolean), [props.items]);
  return useSelection(ids);
}

function useBulkRefs() {
  return {
    cancelBtnRef: useRef<HTMLButtonElement | null>(null),
    clearBtnRef: useRef<HTMLButtonElement | null>(null),
    prevCountRef: useRef(0),
  };
}

function useBulkBusy(props: BookingsTableProps) {
  const deleteBusy = props.busyBulkDelete === true;
  const restoreBusy = props.busyBulkRestore === true;
  return { delete: deleteBusy, restore: restoreBusy, any: deleteBusy || restoreBusy };
}

function useBulkCounts(props: BookingsTableProps, selected: Set<string>) {
  return {
    count: selected.size,
    restoreCount: restoreIds(props.items, selected).length,
  };
}

function useBulkFocus(
  selectMode: boolean,
  count: number,
  refs: ReturnType<typeof useBulkRefs>,
) {
  useEffect(() => focusClearOrCancel(
    selectMode,
    count,
    refs.prevCountRef,
    refs.clearBtnRef,
    refs.cancelBtnRef,
  ), [selectMode, count]);
}

function useBookingHandlers(
  props: BookingsTableProps,
  selection: ReturnType<typeof useSelection>,
  refs: ReturnType<typeof useBulkRefs>,
  busy: boolean,
) {
  return {
    deleteSelected: () => void deleteSelected(props, selection, busy),
    restoreSelected: () => void restoreSelected(props, selection, busy),
    toggleAll: () => toggleAll(selection, busy),
    clearSelection: () => clearSelection(selection, refs, busy),
    toggleMode: () => toggleMode(props, selection, busy),
  };
}

async function deleteSelected(
  props: BookingsTableProps,
  selection: ReturnType<typeof useSelection>,
  busy: boolean,
) {
  if (busy) return;
  const ids = Array.from(selection.selected);
  if (!ids.length) return;
  await props.onDeleteMany(ids);
  closeBulkMode(props, selection);
}

async function restoreSelected(
  props: BookingsTableProps,
  selection: ReturnType<typeof useSelection>,
  busy: boolean,
) {
  if (busy) return;
  const ids = restoreIds(props.items, selection.selected);
  if (!ids.length) return;
  await props.onRestoreMany(ids);
  closeBulkMode(props, selection);
}

function closeBulkMode(
  props: BookingsTableProps,
  selection: ReturnType<typeof useSelection>,
) {
  selection.clear();
  props.onToggleSelectMode();
}

function toggleAll(selection: ReturnType<typeof useSelection>, busy: boolean) {
  if (busy) return;
  selection.isAllSelected ? selection.removeAll() : selection.selectAll();
}

function clearSelection(
  selection: ReturnType<typeof useSelection>,
  refs: ReturnType<typeof useBulkRefs>,
  busy: boolean,
) {
  if (busy) return;
  blurBulkRefs(refs.clearBtnRef, refs.cancelBtnRef);
  selection.clear();
}

function toggleMode(
  props: BookingsTableProps,
  selection: ReturnType<typeof useSelection>,
  busy: boolean,
) {
  if (busy) return;
  selection.clear();
  props.onToggleSelectMode();
}
