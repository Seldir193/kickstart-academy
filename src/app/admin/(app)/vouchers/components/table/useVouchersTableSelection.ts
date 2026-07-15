"use client";

import { useEffect, useMemo, useRef } from "react";
import { useSelection } from "@/app/admin/(app)/news/hooks/useSelection";
import type { Voucher } from "../../types";
import { voucherId } from "./vouchersTable.helpers";

export function useVouchersTableSelection(
  items: Voucher[],
  selectMode: boolean,
) {
  const idsOnPage = useMemo(
    () => items.map(voucherId).filter(Boolean),
    [items],
  );
  const selection = useSelection(idsOnPage);
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
  const clearBtnRef = useRef<HTMLButtonElement | null>(null);
  const previousCountRef = useRef(0);
  const count = selection.selected.size;

  useSelectionFocus(
    selectMode,
    count,
    previousCountRef,
    clearBtnRef,
    cancelBtnRef,
  );
  return { selection, count, cancelBtnRef, clearBtnRef };
}

function useSelectionFocus(
  selectMode: boolean,
  count: number,
  previousCountRef: React.MutableRefObject<number>,
  clearBtnRef: React.RefObject<HTMLButtonElement | null>,
  cancelBtnRef: React.RefObject<HTMLButtonElement | null>,
) {
  useEffect(() => {
    if (!selectMode) return resetPreviousCount(previousCountRef);
    const previous = previousCountRef.current;
    previousCountRef.current = count;
    if (previous < 2 && count >= 2) return focusClearButton(clearBtnRef);
    if (previous >= 2 && count < 2) blurBulkButtons(clearBtnRef, cancelBtnRef);
  }, [selectMode, count, previousCountRef, clearBtnRef, cancelBtnRef]);
}

function resetPreviousCount(ref: React.MutableRefObject<number>) {
  ref.current = 0;
}

function focusClearButton(ref: React.RefObject<HTMLButtonElement | null>) {
  requestAnimationFrame(() => ref.current?.focus());
}

function blurBulkButtons(
  clearRef: React.RefObject<HTMLButtonElement | null>,
  cancelRef: React.RefObject<HTMLButtonElement | null>,
) {
  requestAnimationFrame(() => {
    clearRef.current?.blur();
    cancelRef.current?.blur();
  });
}
