"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

type Item = { ref: RefObject<HTMLElement | null>; close: () => void };

export function useDropdownOutsideClose(items: Item[]) {
  useEffect(() => {
    function onDown(ev: MouseEvent) {
      const t = ev.target as Node;
      items.forEach((it) => closeIfOutside(it.ref.current, t, it.close));
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [items]);
}

function closeIfOutside(el: HTMLElement | null, t: Node, close: () => void) {
  if (!el) return;
  if (!el.contains(t)) close();
}
