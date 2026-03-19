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
  useEffect(() => {
    if (!open) return;

    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (refs.triggerRef.current?.contains(t)) return;
      if (refs.panelRef.current?.contains(t)) return;
      onClose();
    }

    function onResize() {
      onReposition();
    }

    function onScroll() {
      onClose();
    }

    document.addEventListener("mousedown", onDown);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, onClose, onReposition, refs.panelRef, refs.triggerRef]);
}
