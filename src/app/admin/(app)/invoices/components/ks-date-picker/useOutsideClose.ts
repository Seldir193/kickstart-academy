"use client";

import { useEffect } from "react";

type Refs = {
  triggerRef: React.RefObject<HTMLElement | null>;
  panelRef: React.RefObject<HTMLElement | null>;
};

export function useOutsideClose(
  open: boolean,
  refs: Refs,
  onClose: () => void,
  onReposition: () => void,
) {
  useEffect(
    () =>
      setupOutsideClose(
        open,
        refs.triggerRef,
        refs.panelRef,
        onClose,
        onReposition,
      ),
    [open, onClose, onReposition, refs.panelRef, refs.triggerRef],
  );
}

function setupOutsideClose(
  open: boolean,
  triggerRef: Refs["triggerRef"],
  panelRef: Refs["panelRef"],
  onClose: () => void,
  onReposition: () => void,
) {
  if (!open) return;
  const onDown = (event: MouseEvent) =>
    handleMouseDown(event, triggerRef, panelRef, onClose);
  const onResize = () => onReposition();
  const onScroll = () => onClose();
  document.addEventListener("mousedown", onDown);
  window.addEventListener("resize", onResize);
  window.addEventListener("scroll", onScroll, true);
  return () => removeListeners(onDown, onResize, onScroll);
}

function handleMouseDown(
  event: MouseEvent,
  triggerRef: Refs["triggerRef"],
  panelRef: Refs["panelRef"],
  onClose: () => void,
) {
  const target = event.target as Node;
  if (triggerRef.current?.contains(target)) return;
  if (panelRef.current?.contains(target)) return;
  onClose();
}

function removeListeners(
  onDown: (event: MouseEvent) => void,
  onResize: () => void,
  onScroll: () => void,
) {
  document.removeEventListener("mousedown", onDown);
  window.removeEventListener("resize", onResize);
  window.removeEventListener("scroll", onScroll, true);
}
