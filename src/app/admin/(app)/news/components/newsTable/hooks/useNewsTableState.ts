import { useMemo, useRef } from "react";
import type { RefObject } from "react";
import { useSelection } from "../../../hooks/useSelection";
import type { NewsWithProvider, RowMode } from "../types";
import { idOf } from "../lib/ids";
import { filterItemsForView } from "../lib/status";
import { useNewsSelectionFocus } from "./useNewsSelectionFocus";

export type NewsTableState = ReturnType<typeof useNewsTableState>;

export function useNewsTableState(
  items: NewsWithProvider[],
  rowMode: RowMode,
  selectMode: boolean,
  toggleBtnRef?: RefObject<HTMLButtonElement | null>,
) {
  const viewItems = useViewItems(items, rowMode);
  const idsOnPage = useMemo(() => viewItems.map(idOf).filter(Boolean), [viewItems]);
  const selection = useSelection(idsOnPage);
  const refs = useNewsTableRefs(toggleBtnRef);
  const count = selection.selected.size;
  useNewsSelectionFocus(selectMode, count, refs);
  return { viewItems, selection, refs, count, showClear: selectMode && count >= 2 };
}

function useViewItems(items: NewsWithProvider[], rowMode: RowMode) {
  return useMemo(() => filterItemsForView(items, rowMode), [items, rowMode]);
}

function useNewsTableRefs(toggleBtnRef?: RefObject<HTMLButtonElement | null>) {
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
  const clearBtnRef = useRef<HTMLButtonElement | null>(null);
  return { cancelBtnRef, clearBtnRef, toggleBtnRef };
}
