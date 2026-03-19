"use client";

import { useEffect } from "react";

type SelectboxLike = {
  open: boolean;
  setOpen: (v: boolean) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
};

function isInside(
  node: Node | null,
  ref: React.RefObject<HTMLDivElement | null>,
) {
  if (!node) return false;
  return !!ref.current?.contains(node);
}

export function useSelectboxScrollClose(
  a: SelectboxLike,
  b: SelectboxLike,
  c: SelectboxLike,
) {
  useEffect(() => {
    const anyOpen = a.open || b.open || c.open;
    if (!anyOpen) return;

    function closeAll() {
      a.setOpen(false);
      b.setOpen(false);
      c.setOpen(false);
    }

    function onScroll(e: Event) {
      const node = (e.target as Node) || null;
      if (a.open && isInside(node, a.menuRef)) return;
      if (b.open && isInside(node, b.menuRef)) return;
      if (c.open && isInside(node, c.menuRef)) return;
      closeAll();
    }

    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [a.open, b.open, c.open, a, b, c]);
}
