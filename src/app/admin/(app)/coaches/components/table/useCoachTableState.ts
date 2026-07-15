"use client";

import type { RefObject } from "react";
import { useMemo, useRef } from "react";
import type { Coach } from "../../types";
import { cleanStr, getSlug } from "../../utils";
import { useSelection } from "../../hooks/useSelection";
import { useCoachTableFocus } from "./useCoachTableFocus";
import type { CoachTableListProps, CoachTableHandlers } from "./types";

type Selection = ReturnType<typeof useSelection>;
type BulkRefs = ReturnType<typeof useBulkRefs>;
type HandlerContext = {
  args: CoachTableListProps;
  selection: Selection;
  refs: BulkRefs;
};

export function useCoachTableState(args: CoachTableListProps) {
  const idsOnPage = useMemo(
    () => args.items.map((item) => getSlug(item)).filter(Boolean) as string[],
    [args.items],
  );
  const selection = useSelection(idsOnPage);
  const refs = useBulkRefs();
  const count = selection.selected.size;
  const handlers = useCoachTableHandlers({ args, selection, refs });
  useCoachTableFocus({
    ...refs,
    toggleBtnRef: args.toggleBtnRef,
    selectMode: args.selectMode,
    count,
  });
  return {
    selection,
    refs,
    count,
    showClear: args.selectMode && count >= 2,
    handlers,
  };
}

function useBulkRefs() {
  return {
    cancelBtnRef: useRef<HTMLButtonElement | null>(null),
    clearBtnRef: useRef<HTMLButtonElement | null>(null),
    prevCountRef: useRef(0),
  };
}

function useCoachTableHandlers(ctx: HandlerContext): CoachTableHandlers {
  return {
    rowClick: createRowClick(ctx),
    toggleAll: createToggleAll(ctx),
    clearSelection: createClearSelection(ctx),
    deleteSelected: createDeleteSelected(ctx),
    toggleMode: createToggleMode(ctx),
  };
}

function createDeleteSelected({ args, selection }: HandlerContext) {
  return async () => {
    const slugs = Array.from(selection.selected) as string[];
    if (!slugs.length) return;
    await args.onDeleteMany(slugs);
    selection.clear();
    args.onToggleSelectMode();
  };
}

function createToggleAll({ selection }: HandlerContext) {
  return () =>
    selection.isAllSelected ? selection.removeAll() : selection.selectAll();
}

function createClearSelection(ctx: HandlerContext) {
  return () => {
    blurSelectionRefs(ctx.refs, ctx.args.toggleBtnRef);
    ctx.selection.clear();
  };
}

function createRowClick({ args, selection }: HandlerContext) {
  return (coach: Coach) => {
    const slug = cleanStr(getSlug(coach));
    if (!slug) return;
    args.selectMode ? selection.toggleOne(slug) : args.onOpen(coach);
  };
}

function createToggleMode({ args, selection }: HandlerContext) {
  return () => {
    selection.clear();
    args.onToggleSelectMode();
  };
}

function blurSelectionRefs(
  refs: BulkRefs,
  toggleBtnRef?: RefObject<HTMLButtonElement | null>,
) {
  refs.clearBtnRef.current?.blur();
  refs.cancelBtnRef.current?.blur();
  toggleBtnRef?.current?.blur();
}
