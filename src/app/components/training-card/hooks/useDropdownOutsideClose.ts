//src\app\components\training-card\hooks\useDropdownOutsideClose.ts
"use client";

import { useEffect } from "react";

export function useDropdownOutsideClose(args: {
  locationDropdownRef: React.RefObject<HTMLDivElement | null>;
  courseDropdownRef: React.RefObject<HTMLDivElement | null>;
  sortDropdownRef: React.RefObject<HTMLDivElement | null>;
  closeLocation: () => void;
  closeCourse: () => void;
  closeSort: () => void;
}) {
  const {
    locationDropdownRef,
    courseDropdownRef,
    sortDropdownRef,
    closeLocation,
    closeCourse,
    closeSort,
  } = args;

  useEffect(() => {
    function handleDown(event: MouseEvent) {
      const target = event.target as Node;

      if (locationDropdownRef.current?.contains(target)) return;
      if (courseDropdownRef.current?.contains(target)) return;
      if (sortDropdownRef.current?.contains(target)) return;

      closeLocation();
      closeCourse();
      closeSort();
    }

    document.addEventListener("mousedown", handleDown);
    return () => document.removeEventListener("mousedown", handleDown);
  }, [
    locationDropdownRef,
    courseDropdownRef,
    sortDropdownRef,
    closeLocation,
    closeCourse,
    closeSort,
  ]);
}

// "use client";

// import { useEffect } from "react";

// export function useDropdownOutsideClose(args: {
//   locationDropdownRef: React.RefObject<HTMLDivElement | null>;
//   courseDropdownRef: React.RefObject<HTMLDivElement | null>;
//   closeLocation: () => void;
//   closeCourse: () => void;
// }) {
//   const { locationDropdownRef, courseDropdownRef, closeLocation, closeCourse } =
//     args;

//   useEffect(() => {
//     function handleDown(ev: MouseEvent) {
//       const t = ev.target as Node;

//       if (
//         locationDropdownRef.current &&
//         locationDropdownRef.current.contains(t)
//       )
//         return;

//       if (courseDropdownRef.current && courseDropdownRef.current.contains(t))
//         return;

//       closeLocation();
//       closeCourse();
//     }

//     document.addEventListener("mousedown", handleDown);
//     return () => document.removeEventListener("mousedown", handleDown);
//   }, [locationDropdownRef, courseDropdownRef, closeLocation, closeCourse]);
// }
