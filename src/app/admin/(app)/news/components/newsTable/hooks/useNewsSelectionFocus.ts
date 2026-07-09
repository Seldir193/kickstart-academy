import { useEffect, useRef } from "react";
import type { RefObject } from "react";

type Refs = {
  cancelBtnRef: RefObject<HTMLButtonElement | null>;
  clearBtnRef: RefObject<HTMLButtonElement | null>;
  toggleBtnRef?: RefObject<HTMLButtonElement | null>;
};

export function useNewsSelectionFocus(selectMode: boolean, count: number, refs: Refs) {
  const prevCountRef = useRef(0);
  useEffect(() => updateFocus(selectMode, count, prevCountRef, refs), [selectMode, count, refs.cancelBtnRef, refs.clearBtnRef, refs.toggleBtnRef]);
}

function updateFocus(selectMode: boolean, count: number, prev: { current: number }, refs: Refs) {
  if (!selectMode) return resetPrev(prev);
  const previous = prev.current;
  prev.current = count;
  if (previous < 2 && count >= 2) return focusClear(refs.clearBtnRef);
  if (count < 2) blurActions(refs);
}

function resetPrev(prev: { current: number }) {
  prev.current = 0;
}

function focusClear(clearBtnRef: RefObject<HTMLButtonElement | null>) {
  requestAnimationFrame(() => clearBtnRef.current?.focus());
}

function blurActions(refs: Refs) {
  requestAnimationFrame(() => {
    refs.clearBtnRef.current?.blur();
    refs.cancelBtnRef.current?.blur();
    refs.toggleBtnRef?.current?.blur();
  });
}
