//src\app\components\offer-create-dialog\useOnClickOutside.ts
"use client";

import { useEffect } from "react";

type AnyRef<T extends HTMLElement> =
  | React.RefObject<T>
  | React.MutableRefObject<T | null>;

export function useOnClickOutside<T extends HTMLElement>(
  ref: AnyRef<T>,
  handler: () => void,
) {
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) handler();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [ref, handler]);
}
