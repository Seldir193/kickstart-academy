import { useRef } from "react";
import { useDropdownOutsideClose } from "../../hooks/useDropdownOutsideClose";
import { useOpenState } from "./useOpenState";
import type { BookDropdowns, OpenControl } from "../types";

export function useBookDialogDropdowns(): BookDropdowns {
  const refs = useDropdownRefs();
  const open = useDropdownOpenStates();
  useDropdownOutsideClose(dropdownCloseEntries(refs, open));
  return dropdownState(refs, open);
}

function useDropdownRefs() {
  return { parentDropdownRef: useRef<HTMLDivElement | null>(null), childDropdownRef: useRef<HTMLDivElement | null>(null), courseDropdownRef: useRef<HTMLDivElement | null>(null), offerDropdownRef: useRef<HTMLDivElement | null>(null), mainTShirtDropdownRef: useRef<HTMLDivElement | null>(null), siblingTShirtDropdownRef: useRef<HTMLDivElement | null>(null) };
}

function useDropdownOpenStates() {
  return { parent: useOpenState(), child: useOpenState(), course: useOpenState(), offer: useOpenState(), mainTShirt: useOpenState(), siblingTShirt: useOpenState() };
}

function dropdownCloseEntries(refs: ReturnType<typeof useDropdownRefs>, open: ReturnType<typeof useDropdownOpenStates>) {
  return [{ ref: refs.parentDropdownRef, close: close(open.parent) }, { ref: refs.childDropdownRef, close: close(open.child) }, { ref: refs.courseDropdownRef, close: close(open.course) }, { ref: refs.offerDropdownRef, close: close(open.offer) }, { ref: refs.mainTShirtDropdownRef, close: close(open.mainTShirt) }, { ref: refs.siblingTShirtDropdownRef, close: close(open.siblingTShirt) }];
}

function close(control: OpenControl) {
  return () => control.setOpen(false);
}

function dropdownState(refs: ReturnType<typeof useDropdownRefs>, open: ReturnType<typeof useDropdownOpenStates>) {
  return { ...refs, isParentDropdownOpen: open.parent.open, isChildDropdownOpen: open.child.open, isCourseDropdownOpen: open.course.open, isOfferDropdownOpen: open.offer.open, isMainTShirtOpen: open.mainTShirt.open, isSiblingTShirtOpen: open.siblingTShirt.open, setIsParentDropdownOpen: open.parent.setOpen, setIsChildDropdownOpen: open.child.setOpen, setIsCourseDropdownOpen: open.course.setOpen, setIsOfferDropdownOpen: open.offer.setOpen, setIsMainTShirtOpen: open.mainTShirt.setOpen, setIsSiblingTShirtOpen: open.siblingTShirt.setOpen };
}
