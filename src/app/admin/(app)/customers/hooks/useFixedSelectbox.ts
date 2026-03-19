//src\app\admin\(app)\customers\hooks\useFixedSelectbox.ts
"use client";

import { useEffect, useRef, useState } from "react";

type Pos = { left: number; top: number; width: number };

export function useFixedSelectbox() {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos>({ left: 0, top: 0, width: 0 });

  function computePos() {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      left: Math.round(r.left),
      top: Math.round(r.bottom + 4),
      width: Math.round(r.width),
    });
  }

  function openMenu() {
    computePos();
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;

    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      const inTrigger = triggerRef.current?.contains(t);
      const inMenu = menuRef.current?.contains(t);
      if (!inTrigger && !inMenu) setOpen(false);
    }

    function onResize() {
      computePos();
    }

    document.addEventListener("mousedown", onDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return { triggerRef, menuRef, open, setOpen, pos, openMenu };
}
