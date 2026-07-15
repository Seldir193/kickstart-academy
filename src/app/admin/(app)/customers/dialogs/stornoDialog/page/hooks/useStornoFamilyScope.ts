import { useEffect, useMemo, useRef, useState } from "react";
import { useBookDialogFamily } from "../../../bookDialog/hooks/useBookDialogFamily";
import { useDropdownOutsideClose } from "../../../bookDialog/hooks/useDropdownOutsideClose";
import {
  buildChildOptions,
  buildParentOptions,
  childName,
  parentOptionId,
  safeText,
  selectedParentFromFamily,
  selectedParentName,
} from "../lib/familyOptions";
import type { BookingTarget, FamilyScopeState, TFunc } from "../types";

export function useStornoFamilyScope(
  customerId: string,
  t: TFunc,
): FamilyScopeState {
  const base = useBookDialogFamily(customerId);
  const selection = useFamilySelection(base.baseSelectedId);
  const refs = useFamilyDropdownRefs();
  const options = useFamilyOptions(base.family, t);
  useInitialFamilySelection(selection, options, base.baseSelectedId);
  return buildFamilyState(base, selection, refs, options, t);
}

export function activeParentEmailOf(scope: FamilyScopeState) {
  return safeText(scope.selectedParent?.parent?.email).toLowerCase();
}

export function activeChildLabel(scope: FamilyScopeState, emptyLabel: string) {
  return childName(scope.activeChild, emptyLabel);
}

function useFamilySelection(baseSelectedId: string) {
  const [selectedParentId, setSelectedParentId] = useState("");
  const [selectedChildUid, setSelectedChildUid] = useState("");
  const [bookingTarget, setBookingTarget] = useState<BookingTarget>("self");
  return {
    baseSelectedId,
    selectedParentId,
    selectedChildUid,
    bookingTarget,
    setSelectedParentId,
    setSelectedChildUid,
    setBookingTarget,
  };
}

function useFamilyDropdownRefs() {
  const parentDropdownRef = useRef<HTMLDivElement | null>(null);
  const childDropdownRef = useRef<HTMLDivElement | null>(null);
  const parentOpen = useOpenState();
  const childOpen = useOpenState();
  useDropdownOutsideClose([
    { ref: parentDropdownRef, close: () => parentOpen.setOpen(false) },
    { ref: childDropdownRef, close: () => childOpen.setOpen(false) },
  ]);
  return dropdownRefs(
    parentDropdownRef,
    childDropdownRef,
    parentOpen,
    childOpen,
  );
}

function useOpenState() {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
}

function dropdownRefs(
  parentDropdownRef: any,
  childDropdownRef: any,
  parentOpen: any,
  childOpen: any,
) {
  return {
    parentDropdownRef,
    childDropdownRef,
    isParentDropdownOpen: parentOpen.open,
    isChildDropdownOpen: childOpen.open,
    setIsParentDropdownOpen: parentOpen.setOpen,
    setIsChildDropdownOpen: childOpen.setOpen,
  };
}

function useFamilyOptions(family: any, t: TFunc) {
  const childOptions = useMemo(() => buildChildOptions(family, t), [family, t]);
  const parentOptions = useMemo(
    () => buildParentOptions(family, t),
    [family, t],
  );
  return { childOptions, parentOptions };
}

function useInitialFamilySelection(
  selection: ReturnType<typeof useFamilySelection>,
  options: ReturnType<typeof useFamilyOptions>,
  baseSelectedId: string,
) {
  useInitialParent(selection, options.parentOptions, baseSelectedId);
  useInitialChild(selection, options.childOptions);
}

function useInitialParent(
  selection: ReturnType<typeof useFamilySelection>,
  parentOptions: any[],
  baseSelectedId: string,
) {
  useEffect(() => {
    if (selection.selectedParentId || !parentOptions.length) return;
    selection.setSelectedParentId(firstParentId(baseSelectedId, parentOptions));
  }, [selection.selectedParentId, parentOptions, baseSelectedId]);
}

function useInitialChild(
  selection: ReturnType<typeof useFamilySelection>,
  childOptions: any[],
) {
  useEffect(() => {
    if (selection.bookingTarget !== "child" || selection.selectedChildUid)
      return;
    if (childOptions[0]?.uid)
      selection.setSelectedChildUid(childOptions[0].uid);
  }, [selection.bookingTarget, selection.selectedChildUid, childOptions]);
}

function buildFamilyState(
  base: any,
  selection: any,
  refs: any,
  options: any,
  t: TFunc,
) {
  const selfMemberId = selfId(
    selection.selectedParentId,
    base.baseSelectedId,
    base.family,
  );
  const selectedParent = selectedParentFromFamily(base.family, selfMemberId);
  const activeChild = activeChildFrom(selection, options.childOptions);
  return {
    ...base,
    ...selection,
    ...refs,
    ...options,
    selectedParent,
    activeChild,
    selfMemberId,
    selectedParentLabel: parentLabel(selectedParent, t),
  };
}

function parentLabel(selectedParent: any, t: TFunc) {
  if (!selectedParent)
    return t("common.admin.customers.stornoDialog.selectParent");
  return selectedParentName(
    selectedParent,
    t("common.admin.customers.stornoDialog.parent"),
  );
}

function selfId(
  selectedParentId: string,
  baseSelectedId: string,
  family: any[] | null,
) {
  if (selectedParentId) return selectedParentId;
  if (baseSelectedId) return parentOptionId(baseSelectedId, 0);
  return family?.[0] ? parentOptionId(family[0]._id, 0) : "";
}

function activeChildFrom(selection: any, childOptions: any[]) {
  if (selection.bookingTarget !== "child") return null;
  return (
    childOptions.find((item) => item.uid === selection.selectedChildUid)
      ?.child || null
  );
}

function firstParentId(baseSelectedId: string, parentOptions: any[]) {
  return baseSelectedId
    ? parentOptionId(baseSelectedId, 0)
    : parentOptions[0].id;
}
