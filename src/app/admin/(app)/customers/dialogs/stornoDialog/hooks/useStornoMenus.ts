"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";

type Args = {
  courseDropdownRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  menuRef: RefObject<HTMLDivElement | null>;
  filteredCount: number;
};

export function useStornoMenus({
  courseDropdownRef,
  triggerRef,
  menuRef,
  filteredCount,
}: Args) {
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    positionMenu(triggerRef.current, menuRef.current);
  }, [menuOpen, triggerRef, menuRef]);

  useEffect(() => {
    if (!menuOpen) return;
    const onResize = () => positionMenu(triggerRef.current, menuRef.current);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [menuOpen, triggerRef, menuRef]);

  useEffect(() => {
    const onDown = (ev: MouseEvent) =>
      closeOnOutside(
        ev,
        courseDropdownRef,
        triggerRef,
        menuRef,
        menuOpen,
        setIsCourseDropdownOpen,
        setMenuOpen,
      );
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [courseDropdownRef, triggerRef, menuRef, menuOpen]);

  function openMenu() {
    if (!filteredCount) return;
    positionMenu(triggerRef.current, menuRef.current);
    setMenuOpen(true);
  }

  return {
    isCourseDropdownOpen,
    setIsCourseDropdownOpen,
    menuOpen,
    setMenuOpen,
    openMenu,
  };
}

function closeOnOutside(
  ev: MouseEvent,
  courseElRef: RefObject<HTMLDivElement | null>,
  triggerRef: RefObject<HTMLButtonElement | null>,
  menuRef: RefObject<HTMLDivElement | null>,
  menuOpen: boolean,
  setCourseOpen: (v: boolean) => void,
  setMenuOpen: (v: boolean) => void,
) {
  const t = ev.target as Node;
  const courseEl = courseElRef.current;
  if (courseEl && !courseEl.contains(t)) setCourseOpen(false);
  if (!menuOpen) return;
  if (isInsideTrigger(t, triggerRef.current)) return;
  if (isInsideMenu(t, menuRef.current)) return;
  setMenuOpen(false);
}

function isInsideTrigger(t: Node, el: HTMLElement | null) {
  if (!el) return false;
  return t === el || el.contains(t);
}

function isInsideMenu(t: Node, el: HTMLElement | null) {
  if (!el) return false;
  return t === el || el.contains(t);
}

function positionMenu(
  trigger: HTMLButtonElement | null,
  menu: HTMLDivElement | null,
) {
  if (!trigger || !menu) return;
  const r = trigger.getBoundingClientRect();
  menu.style.position = "fixed";
  menu.style.left = `${Math.round(r.left)}px`;
  menu.style.top = `${Math.round(r.bottom + 4)}px`;
  menu.style.width = `${Math.round(r.width)}px`;
}
