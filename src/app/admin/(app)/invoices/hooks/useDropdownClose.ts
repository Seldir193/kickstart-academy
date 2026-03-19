"use client";

import { useEffect } from "react";

type Params = {
  open: boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
  menuRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
};

export function useDropdownClose({
  open,
  triggerRef,
  menuRef,
  onClose,
}: Params) {
  useEffect(() => {
    if (!open) return;

    function onPointerDown(ev: PointerEvent) {
      const target = ev.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      onClose();
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, triggerRef, menuRef, onClose]);
}
