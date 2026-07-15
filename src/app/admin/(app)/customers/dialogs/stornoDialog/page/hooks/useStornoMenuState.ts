import { useEffect, useRef, useState } from "react";
import { useStornoMenus } from "../../hooks/useStornoMenus";
import type { StornoMenuState } from "../types";

export function useStornoMenuState(filteredCount: number): StornoMenuState {
  const refs = useStornoMenuRefs();
  const bookingMenus = useStornoMenus({ ...refs, filteredCount });
  const extraMenus = useExtraMenus(refs);
  return { ...refs, ...bookingMenus, ...extraMenus };
}

function useStornoMenuRefs() {
  const courseDropdownRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const statusDropdownRef = useRef<HTMLDivElement | null>(null);
  const sortDropdownRef = useRef<HTMLDivElement | null>(null);
  return {
    courseDropdownRef,
    triggerRef,
    menuRef,
    statusDropdownRef,
    sortDropdownRef,
  };
}

function useExtraMenus(refs: ReturnType<typeof useStornoMenuRefs>) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  useOutsideClose(refs.statusDropdownRef, isStatusOpen, setIsStatusOpen);
  useOutsideClose(refs.sortDropdownRef, isSortOpen, setIsSortOpen);
  return { isStatusOpen, setIsStatusOpen, isSortOpen, setIsSortOpen };
}

function useOutsideClose(
  ref: any,
  open: boolean,
  setOpen: (value: boolean) => void,
) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => closeIfOutside(e, ref, setOpen);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [ref, open, setOpen]);
}

function closeIfOutside(
  e: MouseEvent,
  ref: any,
  setOpen: (value: boolean) => void,
) {
  const target = e.target as Node | null;
  if (target && ref.current && !ref.current.contains(target)) setOpen(false);
}
