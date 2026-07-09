"use client";

import { useEffect, type RefObject } from "react";

type ElementRef<T extends HTMLElement> = RefObject<T | null>;

function containsTarget<T extends HTMLElement>(ref: ElementRef<T>, target: Node) {
  return Boolean(ref.current?.contains(target));
}

function isInsideDropdown<TTrigger extends HTMLElement, TMenu extends HTMLElement>(target: EventTarget | null, triggerRef: ElementRef<TTrigger>, menuRef: ElementRef<TMenu>) {
  if (!(target instanceof Node)) return false;
  return containsTarget(triggerRef, target) || containsTarget(menuRef, target);
}

export function useDropdownOutsideClose<TTrigger extends HTMLElement, TMenu extends HTMLElement>(open: boolean, triggerRef: ElementRef<TTrigger>, menuRef: ElementRef<TMenu>, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (ev: PointerEvent) => {
      if (isInsideDropdown(ev.target, triggerRef, menuRef)) return;
      close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, triggerRef, menuRef, close]);
}
