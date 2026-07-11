"use client";

import { useEffect } from "react";

type Refs = {
  triggerRef: React.RefObject<HTMLElement | null>;
  menuRef: React.RefObject<HTMLElement | null>;
};

export function useStageDropdown(
  open: boolean,
  refs: Refs,
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) =>
      handlePointerDown(event, refs.triggerRef, refs.menuRef, onClose);
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, onClose, refs.menuRef, refs.triggerRef]);
}

function handlePointerDown(
  event: PointerEvent,
  triggerRef: Refs["triggerRef"],
  menuRef: Refs["menuRef"],
  onClose: () => void,
) {
  const target = event.target as Node;
  if (triggerRef.current?.contains(target)) return;
  if (menuRef.current?.contains(target)) return;
  onClose();
}
