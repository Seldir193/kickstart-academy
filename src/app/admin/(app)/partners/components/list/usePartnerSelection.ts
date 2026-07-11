"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Partner } from "../../types";
import { getPartnerId } from "../../helpers";

export function usePartnerSelection(items: Partner[]) {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const clearRef = useRef<HTMLButtonElement | null>(null);
  const prevCountRef = useRef(0);
  const ids = useMemo(() => items.map(getPartnerId).filter(Boolean), [items]);
  const isAllSelected = ids.length > 0 && ids.every((id) => selectedIds.has(id));

  useSelectionFocus(selectMode, selectedIds.size, prevCountRef, clearRef, cancelRef);

  function toggleSelectMode() {
    setSelectedIds(new Set());
    setSelectMode((current) => !current);
  }

  function toggleAll() {
    setSelectedIds(isAllSelected ? new Set() : new Set(ids));
  }

  function clearSelection() {
    blurButtons(clearRef, cancelRef);
    setSelectedIds(new Set());
  }

  function toggleOne(id: string) {
    setSelectedIds((current) => toggleSelectedId(current, id));
  }

  return {
    selectMode,
    selectedIds,
    toggleRef,
    cancelRef,
    clearRef,
    isAllSelected,
    toggleSelectMode,
    toggleAll,
    clearSelection,
    toggleOne,
  };
}

function useSelectionFocus(
  selectMode: boolean,
  count: number,
  prevRef: React.MutableRefObject<number>,
  clearRef: React.RefObject<HTMLButtonElement | null>,
  cancelRef: React.RefObject<HTMLButtonElement | null>,
) {
  useEffect(() => {
    if (!selectMode) return resetPreviousCount(prevRef);
    const previous = prevRef.current;
    prevRef.current = count;
    if (previous < 2 && count >= 2) return focusClear(clearRef);
    if (previous >= 2 && count < 2) blurButtons(clearRef, cancelRef);
  }, [selectMode, count, prevRef, clearRef, cancelRef]);
}

function resetPreviousCount(ref: React.MutableRefObject<number>) {
  ref.current = 0;
}

function focusClear(ref: React.RefObject<HTMLButtonElement | null>) {
  requestAnimationFrame(() => ref.current?.focus());
}

function blurButtons(
  clearRef: React.RefObject<HTMLButtonElement | null>,
  cancelRef: React.RefObject<HTMLButtonElement | null>,
) {
  requestAnimationFrame(() => {
    clearRef.current?.blur();
    cancelRef.current?.blur();
  });
}

function toggleSelectedId(current: Set<string>, id: string) {
  const next = new Set(current);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}
