"use client";

import { useEffect } from "react";

export function useOutsideClick(
  open: boolean,
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) return;

    const onDown = (ev: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      if (!el.contains(ev.target as Node)) onClose();
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, ref, onClose]);
}
