"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";

export function useCancelDropdowns(
  courseRef: RefObject<HTMLDivElement | null>,
  bookingRef: RefObject<HTMLDivElement | null>,
) {
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [isBookingDropdownOpen, setIsBookingDropdownOpen] = useState(false);

  useEffect(() => {
    function onDown(ev: MouseEvent) {
      const t = ev.target as Node;
      closeIfOutside(courseRef.current, t, setIsCourseDropdownOpen);
      closeIfOutside(bookingRef.current, t, setIsBookingDropdownOpen);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [courseRef, bookingRef]);

  return {
    isCourseDropdownOpen,
    setIsCourseDropdownOpen,
    isBookingDropdownOpen,
    setIsBookingDropdownOpen,
  };
}

function closeIfOutside(
  el: HTMLElement | null,
  t: Node,
  set: (v: boolean) => void,
) {
  if (!el) return;
  if (!el.contains(t)) set(false);
}
