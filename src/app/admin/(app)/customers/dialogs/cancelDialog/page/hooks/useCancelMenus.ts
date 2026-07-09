import { useRef, useState } from "react";
import { useCancelDropdowns } from "../../hooks/useCancelDropdowns";
import { useOutsideClose } from "../../hooks/useOutsideClose";
import type { CancelMenuState } from "../types";

export function useCancelMenus(): CancelMenuState {
  const refs = useCancelMenuRefs();
  const courseMenus = useCancelDropdowns(refs.courseDropdownRef, refs.bookingDropdownRef);
  const extraMenus = useExtraMenus(refs);
  return { ...refs, ...courseMenus, ...extraMenus };
}

function useCancelMenuRefs() {
  const courseDropdownRef = useRef<HTMLDivElement | null>(null);
  const bookingDropdownRef = useRef<HTMLDivElement | null>(null);
  const statusDropdownRef = useRef<HTMLDivElement | null>(null);
  const sortDropdownRef = useRef<HTMLDivElement | null>(null);
  return { courseDropdownRef, bookingDropdownRef, statusDropdownRef, sortDropdownRef };
}

function useExtraMenus(refs: ReturnType<typeof useCancelMenuRefs>) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  useOutsideClose(refs.statusDropdownRef, isStatusOpen, setIsStatusOpen);
  useOutsideClose(refs.sortDropdownRef, isSortOpen, setIsSortOpen);
  return { isStatusOpen, setIsStatusOpen, isSortOpen, setIsSortOpen };
}
