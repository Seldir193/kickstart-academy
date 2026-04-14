"use client";

import { useEffect, useRef, useState } from "react";

export function useRevenueDropdowns() {
  const [sourceOpen, setSourceOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [yearViewOpen, setYearViewOpen] = useState(false);

  const sourceRef = useRef<HTMLDivElement | null>(null);
  const yearRef = useRef<HTMLDivElement | null>(null);
  const monthRef = useRef<HTMLDivElement | null>(null);
  const yearViewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const close = (e: PointerEvent) => closeDropdowns(e, refs, setters);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [sourceOpen, yearOpen, monthOpen, yearViewOpen]);

  const refs = { sourceRef, yearRef, monthRef, yearViewRef };
  const setters = { setSourceOpen, setYearOpen, setMonthOpen, setYearViewOpen };

  return { refs, sourceOpen, yearOpen, monthOpen, yearViewOpen, ...setters };
}

function closeDropdowns(e: PointerEvent, refs: any, setters: any) {
  const target = e.target as Node | null;
  if (!target || isInsideAny(target, refs)) return;
  setters.setSourceOpen(false);
  setters.setYearOpen(false);
  setters.setMonthOpen(false);
  setters.setYearViewOpen(false);
}

function isInsideAny(target: Node, refs: any) {
  return (
    refs.sourceRef.current?.contains(target) ||
    refs.yearRef.current?.contains(target) ||
    refs.monthRef.current?.contains(target) ||
    refs.yearViewRef.current?.contains(target)
  );
}
