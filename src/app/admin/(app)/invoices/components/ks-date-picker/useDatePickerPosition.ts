// "use client";

// import { useCallback, useState } from "react";

// type Pos = { left: number; top: number; width: number };

// function readPos(el: HTMLElement) {
//   const r = el.getBoundingClientRect();
//   return {
//     left: Math.round(r.left),
//     top: Math.round(r.bottom + 6),
//     width: Math.round(r.width),
//   };
// }

// export function useDatePickerPosition() {
//   const [pos, setPos] = useState<Pos>({ left: 0, top: 0, width: 0 });

//   const computePos = useCallback((el: HTMLElement | null) => {
//     if (!el) return;
//     setPos(readPos(el));
//   }, []);

//   return { pos, computePos };
// }

"use client";

import { useCallback, useState } from "react";

type Pos = { left: number; top: number; width: number };

function readBaseRect(el: HTMLElement) {
  const backdrop = el.closest(".dialog-backdrop") as HTMLElement | null;
  if (!backdrop) return { left: 0, top: 0 };
  const rect = backdrop.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
  };
}

function readPos(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  const base = readBaseRect(el);

  return {
    left: Math.round(r.left - base.left),
    top: Math.round(r.bottom - base.top + 6),
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
