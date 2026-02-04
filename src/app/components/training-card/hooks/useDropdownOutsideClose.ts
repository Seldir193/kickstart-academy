"use client";

import { useEffect } from "react";

export function useDropdownOutsideClose(args: {
  locationDropdownRef: React.RefObject<HTMLDivElement | null>;
  courseDropdownRef: React.RefObject<HTMLDivElement | null>;
  closeLocation: () => void;
  closeCourse: () => void;
}) {
  const { locationDropdownRef, courseDropdownRef, closeLocation, closeCourse } =
    args;

  useEffect(() => {
    function handleDown(ev: MouseEvent) {
      const t = ev.target as Node;

      if (
        locationDropdownRef.current &&
        locationDropdownRef.current.contains(t)
      )
        return;

      if (courseDropdownRef.current && courseDropdownRef.current.contains(t))
        return;

      closeLocation();
      closeCourse();
    }

    document.addEventListener("mousedown", handleDown);
    return () => document.removeEventListener("mousedown", handleDown);
  }, [locationDropdownRef, courseDropdownRef, closeLocation, closeCourse]);
}
