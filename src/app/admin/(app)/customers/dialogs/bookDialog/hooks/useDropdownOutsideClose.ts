"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

type Item = { ref: RefObject<HTMLElement | null>; close: () => void };

export function useDropdownOutsideClose(items: Item[]) {
  useEffect(() => {
    function onDown(ev: MouseEvent) {
      const t = ev.target as Node;
      items.forEach((it) => {
        const el = it.ref.current;
        if (el && !el.contains(t)) it.close();
      });
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [items]);
}
