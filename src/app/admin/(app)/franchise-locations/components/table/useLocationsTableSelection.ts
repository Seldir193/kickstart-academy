import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject, RefObject } from "react";
import { useSelection } from "../../hooks/useSelection";
import { idOf } from "../LocationsTableList.helpers";
import type { LocationsTableListProps } from "./types";

type Args = Pick<
  LocationsTableListProps,
  "items" | "selectMode" | "onDeleteMany" | "onToggleSelectMode"
>;

type SelectionRefs = {
  cancelBtnRef: RefObject<HTMLButtonElement | null>;
  clearBtnRef: RefObject<HTMLButtonElement | null>;
};

export default function useLocationsTableSelection(args: Args) {
  const idsOnPage = useMemo(
    () => args.items.map((it) => idOf(it)).filter(Boolean),
    [args.items],
  );
  const selection = useSelection(idsOnPage);
  const refs = useSelectionRefs();
  const count = selection.selected.size;
  useSelectionFocus(args.selectMode, count, refs);
  return buildSelectionState(args, selection, refs, count);
}

function useSelectionRefs(): SelectionRefs {
  return {
    cancelBtnRef: useRef<HTMLButtonElement | null>(null),
    clearBtnRef: useRef<HTMLButtonElement | null>(null),
  };
}

function useSelectionFocus(
  selectMode: boolean,
  count: number,
  refs: SelectionRefs,
) {
  const prevCountRef = useRef(0);

  useEffect(() => {
    updateFocus(selectMode, count, prevCountRef, refs);
  }, [selectMode, count, refs.cancelBtnRef, refs.clearBtnRef]);
}

function buildSelectionState(
  args: Args,
  selection: ReturnType<typeof useSelection>,
  refs: SelectionRefs,
  count: number,
) {
  return {
    selection,
    refs,
    count,
    showClear: args.selectMode && count >= 2,
    deleteSelected: () => deleteSelected(args, selection),
  };
}

function updateFocus(
  selectMode: boolean,
  count: number,
  prevCountRef: MutableRefObject<number>,
  refs: SelectionRefs,
) {
  if (!selectMode) return void (prevCountRef.current = 0);
  const prev = prevCountRef.current;
  prevCountRef.current = count;
  if (prev < 2 && count >= 2)
    return requestAnimationFrame(() => refs.clearBtnRef.current?.focus());
  if (count < 2) requestAnimationFrame(() => blurButtons(refs));
}

function blurButtons(refs: SelectionRefs) {
  refs.clearBtnRef.current?.blur();
  refs.cancelBtnRef.current?.blur();
}

async function deleteSelected(
  args: Args,
  selection: ReturnType<typeof useSelection>,
) {
  if (!args.onDeleteMany) return;
  const ids = Array.from(selection.selected).map(String);
  if (!ids.length) return;
  await args.onDeleteMany(ids);
  selection.clear();
  args.onToggleSelectMode();
}
