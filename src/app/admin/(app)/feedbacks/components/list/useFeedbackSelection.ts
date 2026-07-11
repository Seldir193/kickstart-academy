import { useEffect, useMemo, useRef, useState } from 'react';
import type { Feedback } from '../../types';
import { getFeedbackId } from '../../helpers';

export default function useFeedbackSelection(items: Feedback[]) {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const clearRef = useRef<HTMLButtonElement | null>(null);
  const prevCountRef = useRef(0);
  const ids = useMemo(() => items.map(getFeedbackId).filter(Boolean), [items]);
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
    clearRef.current?.blur();
    cancelRef.current?.blur();
    setSelectedIds(new Set());
  }

  function toggleOne(id: string) {
    setSelectedIds((current) => toggleSelectedId(current, id));
  }

  return { selectMode, selectedIds, toggleRef, cancelRef, clearRef, isAllSelected, toggleSelectMode, toggleAll, clearSelection, toggleOne };
}

function useSelectionFocus(
  selectMode: boolean,
  selectedCount: number,
  prevCountRef: React.MutableRefObject<number>,
  clearRef: React.RefObject<HTMLButtonElement | null>,
  cancelRef: React.RefObject<HTMLButtonElement | null>,
) {
  useEffect(() => {
    if (!selectMode) return resetCount(prevCountRef);
    const previous = prevCountRef.current;
    prevCountRef.current = selectedCount;
    if (previous < 2 && selectedCount >= 2) return focusClear(clearRef);
    if (previous >= 2 && selectedCount < 2) blurActions(clearRef, cancelRef);
  }, [selectMode, selectedCount, prevCountRef, clearRef, cancelRef]);
}

function resetCount(ref: React.MutableRefObject<number>) {
  ref.current = 0;
}

function focusClear(ref: React.RefObject<HTMLButtonElement | null>) {
  requestAnimationFrame(() => ref.current?.focus());
}

function blurActions(
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

export type FeedbackSelection = ReturnType<typeof useFeedbackSelection>;
