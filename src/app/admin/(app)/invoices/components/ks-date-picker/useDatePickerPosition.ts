"use client";

import { useCallback, useState } from "react";

type Pos = { left: number; top: number; width: number };

function readPos(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return {
    left: Math.round(r.left),
    top: Math.round(r.bottom + 6),
    width: Math.round(r.width),
  };
}

export function useDatePickerPosition() {
  const [pos, setPos] = useState<Pos>({ left: 0, top: 0, width: 0 });

  const computePos = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    setPos(readPos(el));
  }, []);

  return { pos, computePos };
}
