import { useEffect, useMemo, useRef, useState } from "react";
import { useBookDialogFamily } from "../../../bookDialog/hooks/useBookDialogFamily";
import { useDropdownOutsideClose } from "../../../bookDialog/hooks/useDropdownOutsideClose";
import {
  baseMemberId,
  buildChildOptions,
  buildParentOptions,
  parentOptionId,
  safeText,
  selectedParentFromFamily,
  selectedParentName,
} from "../lib/familyOptions";
import type { BookingTarget, FamilyScopeState, TFunc } from "../types";

export function useCancelFamilyScope(customerId: string, t: TFunc): FamilyScopeState {
  const base = useBookDialogFamily(customerId);
  const selection = useFamilySelection(base.baseSelectedId);
  const refs = useFamilyDropdownRefs(selection);
  const options = useFamilyOptions(base.family, t);
  useInitialFamilySelection(selection, options, base.baseSelectedId);
  return buildFamilyState(base, selection, refs, options, t);
}

function useFamilySelection(baseSelectedId: string) {
  const [selectedParentId, setSelectedParentId] = useState("");
  const [selectedChildUid, setSelectedChildUid] = useState("");
  const [bookingTarget, setBookingTarget] = useState<BookingTarget>("self");
  return { baseSelectedId, selectedParentId, selectedChildUid, bookingTarget, setSelectedParentId, setSelectedChildUid, setBookingTarget };
}

function useFamilyDropdownRefs(selection: ReturnType<typeof useFamilySelection>) {
  const parentDropdownRef = useRef<HTMLDivElement | null>(null);
  const childDropdownRef = useRef<HTMLDivElement | null>(null);
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);
  const [isChildDropdownOpen, setIsChildDropdownOpen] = useState(false);
  useDropdownOutsideClose([{ ref: parentDropdownRef, close: () => setIsParentDropdownOpen(false) }, { ref: childDropdownRef, close: () => setIsChildDropdownOpen(false) }]);
  return { parentDropdownRef, childDropdownRef, isParentDropdownOpen, isChildDropdownOpen, setIsParentDropdownOpen, setIsChildDropdownOpen };
}

function useFamilyOptions(family: any, t: TFunc) {
  const childOptions = useMemo(() => buildChildOptions(family, t), [family, t]);
  const parentOptions = useMemo(() => buildParentOptions(family, t), [family, t]);
  return { childOptions, parentOptions };
}

function useInitialFamilySelection(selection: ReturnType<typeof useFamilySelection>, options: ReturnType<typeof useFamilyOptions>, baseSelectedId: string) {
  useInitialParent(selection, options.parentOptions, baseSelectedId);
  useInitialChild(selection, options.childOptions);
}

function useInitialParent(selection: ReturnType<typeof useFamilySelection>, parentOptions: any[], baseSelectedId: string) {
  useEffect(() => {
    if (selection.selectedParentId || !parentOptions.length) return;
    selection.setSelectedParentId(firstParentId(baseSelectedId, parentOptions));
  }, [selection.selectedParentId, parentOptions, baseSelectedId]);
}

function useInitialChild(selection: ReturnType<typeof useFamilySelection>, childOptions: any[]) {
  useEffect(() => {
    if (selection.bookingTarget !== "child" || selection.selectedChildUid) return;
    if (childOptions[0]?.uid) selection.setSelectedChildUid(childOptions[0].uid);
  }, [selection.bookingTarget, selection.selectedChildUid, childOptions]);
}

function buildFamilyState(base: any, selection: any, refs: any, options: any, t: TFunc) {
  const ids = familyIds(selection, base);
  const selectedParent = selectedParentFromFamily(base.family, ids.selfMemberId);
  const activeChild = activeChildFrom(selection, options.childOptions);
  return { ...base, ...selection, ...refs, ...options, selectedParent, activeChild, selfMemberId: ids.selfMemberId, selectedParentLabel: parentLabel(selectedParent, t) };
}

function parentLabel(selectedParent: any, t: TFunc) {
  if (!selectedParent) return t("common.admin.customers.cancelDialog.selectParent");
  return selectedParentName(selectedParent, t("common.admin.customers.cancelDialog.parent"));
}

function familyIds(selection: any, base: any) {
  const selfMemberId = selfId(selection.selectedParentId, base.baseSelectedId, base.family);
  return { selfMemberId };
}

function selfId(selectedParentId: string, baseSelectedId: string, family: any[] | null) {
  if (selectedParentId) return selectedParentId;
  if (baseSelectedId) return parentOptionId(baseSelectedId, 0);
  const first = family?.[0];
  return first ? parentOptionId(first._id, 0) : "";
}

function activeChildFrom(selection: any, childOptions: any[]) {
  if (selection.bookingTarget !== "child") return null;
  return childOptions.find((item) => item.uid === selection.selectedChildUid)?.child || null;
}

function firstParentId(baseSelectedId: string, parentOptions: any[]) {
  return baseSelectedId ? parentOptionId(baseSelectedId, 0) : parentOptions[0].id;
}

export function activeParentEmailOf(scope: FamilyScopeState) {
  return safeText(scope.selectedParent?.parent?.email).toLowerCase();
}

export function selectedParentBaseId(scope: FamilyScopeState) {
  return baseMemberId(scope.selfMemberId);
}
