"use client";

import { useEffect, useRef, useState } from "react";

export function useDropdown() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(ev: PointerEvent) {
      const t = ev.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function toggle() {
    setOpen((o) => !o);
  }

  function close() {
    setOpen(false);
  }

  return { open, toggle, close, triggerRef, menuRef };
}
