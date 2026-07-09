import { useEffect, useMemo, useState } from "react";
import { useBookDialogFamily } from "../../hooks/useBookDialogFamily";
import { buildChildOptions, buildParentOptions, selectedParentFromFamily, selectedParentLabel, selfMemberIdFor } from "../lib/familyOptions";
import { safeText } from "../lib/text";
import type { BookingTarget, BookFamilyScope, ChildOption, ParentOption, TFunc } from "../types";

export function useBookFamilyScope(customerId: string, initialChildUid: string | undefined, t: TFunc): BookFamilyScope {
  const base = useBookDialogFamily(customerId);
  const selection = useFamilySelection(initialChildUid);
  const options = useFamilyOptions(base.family, t);
  useInitialParentSelection(selection, options.parentOptions, base.baseSelectedId);
  useInitialChildSelection(selection, options.childOptions, initialChildUid);
  return buildFamilyScope(base, selection, options, t);
}

function useFamilySelection(initialChildUid: string | undefined) {
  const [selectedParentId, setSelectedParentId] = useState("");
  const [selectedChildUid, setSelectedChildUid] = useState(safeText(initialChildUid));
  const [bookingTarget, setBookingTarget] = useState<BookingTarget>(() => (safeText(initialChildUid) ? "child" : "self"));
  return { selectedParentId, selectedChildUid, bookingTarget, setSelectedParentId, setSelectedChildUid, setBookingTarget };
}

function useFamilyOptions(family: any, t: TFunc) {
  const childOptions = useMemo(() => buildChildOptions(family, t), [family, t]);
  const parentOptions = useMemo(() => buildParentOptions(family, t), [family, t]);
  return { childOptions, parentOptions };
}

function useInitialParentSelection(selection: ReturnType<typeof useFamilySelection>, parentOptions: ParentOption[], baseSelectedId: string) {
  useEffect(() => {
    if (selection.selectedParentId || !parentOptions.length) return;
    selection.setSelectedParentId(parentOptions[0].id || (baseSelectedId ? `${baseSelectedId}::parent::0` : ""));
  }, [selection.selectedParentId, parentOptions, baseSelectedId]);
}

function useInitialChildSelection(selection: ReturnType<typeof useFamilySelection>, childOptions: ChildOption[], initialChildUid: string | undefined) {
  useEffect(() => {
    if (selection.bookingTarget !== "child" || selection.selectedChildUid) return;
    const uid = safeText(initialChildUid) || childOptions[0]?.uid || "";
    if (uid) selection.setSelectedChildUid(uid);
  }, [selection.bookingTarget, selection.selectedChildUid, initialChildUid, childOptions]);
}

function buildFamilyScope(base: any, selection: ReturnType<typeof useFamilySelection>, options: ReturnType<typeof useFamilyOptions>, t: TFunc) {
  const selfMemberId = selfMemberIdFor(selection.selectedParentId, base.baseSelectedId, base.family);
  const selectedParent = selectedParentFromFamily(base.family, selfMemberId);
  const selectedChildOption = selectedChildOptionFor(options.childOptions, selection.selectedChildUid);
  return { family: base.family, familyLoading: base.familyLoading, familyError: base.familyError, ...options, selectedParent, selectedParentLabel: selectedParentLabel(selectedParent, t), selfMemberId, activeChild: activeChild(selection.bookingTarget, selectedChildOption), ...selection };
}

function selectedChildOptionFor(childOptions: ChildOption[], selectedChildUid: string) {
  return childOptions.find((item) => item.uid === selectedChildUid) || null;
}

function activeChild(bookingTarget: BookingTarget, selectedChildOption: ChildOption | null) {
  return bookingTarget === "child" ? selectedChildOption?.child || null : null;
}
