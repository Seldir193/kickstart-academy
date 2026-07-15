"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

type Args = {
  selectMode: boolean;
  count: number;
  prevCountRef: RefObject<number>;
  clearBtnRef: RefObject<HTMLButtonElement | null>;
  cancelBtnRef: RefObject<HTMLButtonElement | null>;
  toggleBtnRef?: RefObject<HTMLButtonElement | null>;
};

export function useCoachTableFocus(args: Args) {
  useEffect(
    () => focusSelectionControls(args),
    [
      args.selectMode,
      args.count,
      args.prevCountRef,
      args.clearBtnRef,
      args.cancelBtnRef,
      args.toggleBtnRef,
    ],
  );
}

function focusSelectionControls(args: Args) {
  let rafId: number | null = null;
  if (!args.selectMode) return resetPreviousCount(args);
  rafId = updateFocusTarget(args);
  return () => cancelFocusFrame(rafId);
}

function resetPreviousCount({ prevCountRef }: Args) {
  prevCountRef.current = 0;
}

function updateFocusTarget(args: Args) {
  const prev = args.prevCountRef.current;
  args.prevCountRef.current = args.count;
  if (prev < 2 && args.count >= 2) return focusClearButton(args);
  if (args.count < 2) return blurBulkButtons(args);
  return null;
}

function focusClearButton({ clearBtnRef }: Args) {
  return requestAnimationFrame(() => clearBtnRef.current?.focus());
}

function blurBulkButtons(args: Args) {
  return requestAnimationFrame(() => {
    args.clearBtnRef.current?.blur();
    args.cancelBtnRef.current?.blur();
    args.toggleBtnRef?.current?.blur();
  });
}

function cancelFocusFrame(rafId: number | null) {
  if (rafId !== null) cancelAnimationFrame(rafId);
}
