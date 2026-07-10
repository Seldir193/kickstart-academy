"use client";

import { useEffect, useRef, type RefObject } from "react";

export function usePlacesSelectionFocus(
  selectMode: boolean,
  count: number,
  clearRef: RefObject<HTMLButtonElement | null>,
  cancelRef: RefObject<HTMLButtonElement | null>,
) {
  const prevRef = useRef(0);

  useEffect(() => {
    if (!selectMode) return resetPrevious(prevRef);
    const previous = prevRef.current;
    prevRef.current = count;
    if (previous < 2 && count >= 2) focusClear(clearRef);
    if (previous >= 2 && count < 2) blurBulkButtons(clearRef, cancelRef);
  }, [selectMode, count, clearRef, cancelRef]);
}

function resetPrevious(prevRef: { current: number }) {
  prevRef.current = 0;
}

function focusClear(clearRef: RefObject<HTMLButtonElement | null>) {
  requestAnimationFrame(() => clearRef.current?.focus());
}

function blurBulkButtons(
  clearRef: RefObject<HTMLButtonElement | null>,
  cancelRef: RefObject<HTMLButtonElement | null>,
) {
  requestAnimationFrame(() => {
    clearRef.current?.blur();
    cancelRef.current?.blur();
  });
}
