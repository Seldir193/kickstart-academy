import type { MutableRefObject, RefObject } from "react";
import { useEffect, useMemo, useRef } from "react";
import { useSelection } from "@/app/admin/(app)/news/hooks/useSelection";
import type { Booking } from "../../../types";
import { getRestoreIds, idOf } from "../lib/bookingRow";

export function useBookingsTableSelection(
  items: Booking[],
  selectMode: boolean,
) {
  const idsOnPage = useMemo(() => items.map(idOf).filter(Boolean), [items]);
  const sel = useSelection(idsOnPage);
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
  const clearBtnRef = useRef<HTMLButtonElement | null>(null);
  const prevCountRef = useRef(0);
  const count = sel.selected.size;

  useFocusShift(selectMode, count, prevCountRef, cancelBtnRef, clearBtnRef);

  return buildSelectionState(items, sel, count, cancelBtnRef, clearBtnRef);
}

function useFocusShift(
  selectMode: boolean,
  count: number,
  prevCountRef: MutableRefObject<number>,
  cancelBtnRef: RefObject<HTMLButtonElement | null>,
  clearBtnRef: RefObject<HTMLButtonElement | null>,
) {
  useEffect(() => {
    updateFocus(selectMode, count, prevCountRef, cancelBtnRef, clearBtnRef);
  }, [selectMode, count, prevCountRef, cancelBtnRef, clearBtnRef]);
}

function updateFocus(
  selectMode: boolean,
  count: number,
  prevCountRef: MutableRefObject<number>,
  cancelBtnRef: RefObject<HTMLButtonElement | null>,
  clearBtnRef: RefObject<HTMLButtonElement | null>,
) {
  if (!selectMode) return resetPrevious(prevCountRef);
  const prev = updatePrevious(prevCountRef, count);
  if (prev < 2 && count >= 2) return focusClear(clearBtnRef);
  if (prev >= 2 && count < 2) blurActions(cancelBtnRef, clearBtnRef);
}

function buildSelectionState(
  items: Booking[],
  sel: ReturnType<typeof useSelection>,
  count: number,
  cancelBtnRef: RefObject<HTMLButtonElement | null>,
  clearBtnRef: RefObject<HTMLButtonElement | null>,
) {
  return {
    sel,
    count,
    restoreCount: getRestoreIds(items, sel.selected).length,
    cancelBtnRef,
    clearBtnRef,
  };
}

function resetPrevious(prevCountRef: MutableRefObject<number>) {
  prevCountRef.current = 0;
}

function updatePrevious(prevCountRef: MutableRefObject<number>, count: number) {
  const prev = prevCountRef.current;
  prevCountRef.current = count;
  return prev;
}

function focusClear(clearBtnRef: RefObject<HTMLButtonElement | null>) {
  requestAnimationFrame(() => clearBtnRef.current?.focus());
}

function blurActions(
  cancelBtnRef: RefObject<HTMLButtonElement | null>,
  clearBtnRef: RefObject<HTMLButtonElement | null>,
) {
  requestAnimationFrame(() => {
    clearBtnRef.current?.blur();
    cancelBtnRef.current?.blur();
  });
}
