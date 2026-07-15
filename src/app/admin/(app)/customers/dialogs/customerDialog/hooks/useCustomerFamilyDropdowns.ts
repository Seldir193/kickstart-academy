"use client";

import { useRef, useState } from "react";
import { useDropdownOutsideClose } from "./useDropdownOutsideClose";

export function useCustomerFamilyDropdowns() {
  const [familyDropdownOpen, setFamilyDropdownOpen] = useState(false);
  const [selfDropdownOpen, setSelfDropdownOpen] = useState(false);
  const familyDropdownRef = useRef<HTMLDivElement | null>(null);
  const selfDropdownRef = useRef<HTMLDivElement | null>(null);
  useDropdownOutsideClose([
    { ref: familyDropdownRef, close: () => setFamilyDropdownOpen(false) },
    { ref: selfDropdownRef, close: () => setSelfDropdownOpen(false) },
  ]);
  return {
    familyDropdownOpen,
    selfDropdownOpen,
    setFamilyDropdownOpen,
    setSelfDropdownOpen,
    familyDropdownRef,
    selfDropdownRef,
  };
}
