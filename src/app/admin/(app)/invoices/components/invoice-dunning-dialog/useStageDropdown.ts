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

    function onPointerDown(ev: PointerEvent) {
      const target = ev.target as Node;
      if (refs.triggerRef.current?.contains(target)) return;
      if (refs.menuRef.current?.contains(target)) return;
      onClose();
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, onClose, refs.menuRef, refs.triggerRef]);
}
