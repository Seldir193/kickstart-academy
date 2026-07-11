"use client";

import { useRef, useState } from "react";

export function useCustomerFormDialogs() {
  const [bookOpen, setBookOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [stornoOpen, setStornoOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [salutationOpen, setSalutationOpen] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);
  const salutationDropdownRef = useRef<HTMLDivElement | null>(null);
  const genderDropdownRef = useRef<HTMLDivElement | null>(null);
  return { bookOpen, setBookOpen, cancelOpen, setCancelOpen, stornoOpen, setStornoOpen,
    documentsOpen, setDocumentsOpen, salutationOpen, setSalutationOpen, genderOpen,
    setGenderOpen, salutationDropdownRef, genderDropdownRef };
}
