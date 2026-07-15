import { useEffect, useMemo, useRef, useState } from "react";
import { useBookDialogFamily } from "../../../bookDialog/hooks/useBookDialogFamily";
import { useDropdownOutsideClose } from "../../../bookDialog/hooks/useDropdownOutsideClose";
import type { FamilyChild, FamilyMember } from "../../../bookDialog/types";
import type { BookingTarget, FamilyScopeState, ScopeDropdowns } from "../types";
import {
  baseMemberId,
  buildChildOptions,
  buildParentOptions,
  parentIndexFromMemberId,
} from "../lib/familyOptions";
import { safeText } from "../lib/text";

export function useFamilyScope(
  customerId: string,
  t: (key: string) => string,
): FamilyScopeState {
  const familyData = useBookDialogFamily(customerId);
  const dropdowns = useScopeDropdowns();
  const parent = useParentSelection(familyData, t);
  const target = useBookingTarget(parent.childOptions);
  return buildFamilyScope(familyData, dropdowns, parent, target, t);
}

function useScopeDropdowns(): ScopeDropdowns {
  const parentDropdownRef = useRef<HTMLDivElement | null>(null);
  const childDropdownRef = useRef<HTMLDivElement | null>(null);
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);
  const [isChildDropdownOpen, setIsChildDropdownOpen] = useState(false);
  useDropdownOutsideClose(
    dropdownCloseTargets(
      parentDropdownRef,
      childDropdownRef,
      setIsParentDropdownOpen,
      setIsChildDropdownOpen,
    ),
  );
  return {
    parentDropdownRef,
    childDropdownRef,
    isParentDropdownOpen,
    isChildDropdownOpen,
    setIsParentDropdownOpen,
    setIsChildDropdownOpen,
  };
}

function dropdownCloseTargets(
  parentRef: any,
  childRef: any,
  closeParent: any,
  closeChild: any,
) {
  return [
    { ref: parentRef, close: () => closeParent(false) },
    { ref: childRef, close: () => closeChild(false) },
  ];
}

function useParentSelection(
  familyData: ReturnType<typeof useBookDialogFamily>,
  t: (key: string) => string,
) {
  const [selectedParentId, setSelectedParentId] = useState("");
  const childOptions = useMemo(
    () => buildChildOptions(familyData.family, t),
    [familyData.family, t],
  );
  const parentOptions = useMemo(
    () => buildParentOptions(familyData.family, t),
    [familyData.family, t],
  );
  useInitialParentSelection(
    selectedParentId,
    setSelectedParentId,
    parentOptions,
    familyData.baseSelectedId,
  );
  return { selectedParentId, setSelectedParentId, childOptions, parentOptions };
}

function useInitialParentSelection(
  selectedParentId: string,
  setSelectedParentId: (id: string) => void,
  options: any[],
  baseSelectedId: string,
) {
  useEffect(() => {
    if (selectedParentId || !options.length) return;
    setSelectedParentId(
      baseSelectedId ? `${baseSelectedId}::parent::0` : options[0].id,
    );
  }, [selectedParentId, options, baseSelectedId, setSelectedParentId]);
}

function useBookingTarget(childOptions: { uid: string }[]) {
  const [selectedChildUid, setSelectedChildUid] = useState("");
  const [bookingTarget, setBookingTarget] = useState<BookingTarget>("self");
  useInitialChildSelection(
    bookingTarget,
    selectedChildUid,
    setSelectedChildUid,
    childOptions,
  );
  return {
    selectedChildUid,
    setSelectedChildUid,
    bookingTarget,
    setBookingTarget,
  };
}

function useInitialChildSelection(
  target: BookingTarget,
  uid: string,
  setUid: (uid: string) => void,
  options: { uid: string }[],
) {
  useEffect(() => {
    if (target !== "child" || uid) return;
    if (options[0]?.uid) setUid(options[0].uid);
  }, [target, uid, options, setUid]);
}

function buildFamilyScope(
  familyData: ReturnType<typeof useBookDialogFamily>,
  dropdowns: ScopeDropdowns,
  parent: any,
  target: any,
  t: (key: string) => string,
) {
  const memberId = selfMemberId(
    parent.selectedParentId,
    familyData.baseSelectedId,
    familyData.family,
  );
  const selectedParent = selectedParentFrom(familyData.family, memberId);
  return {
    ...familyData,
    ...dropdowns,
    ...parent,
    ...target,
    ...familyLabels(parent, target, memberId, selectedParent, t),
  };
}

function familyLabels(
  parent: any,
  target: any,
  memberId: string,
  selectedParent: FamilyMember | null,
  t: (key: string) => string,
) {
  const activeChild = activeChildFrom(
    target.bookingTarget,
    target.selectedChildUid,
    parent.childOptions,
  );
  return {
    selfMemberId: memberId,
    selectedParent,
    selectedParentLabel: parentLabel(selectedParent, t),
    activeChild,
  };
}

function selfMemberId(
  selectedParentId: string,
  baseSelectedId: string,
  family: FamilyMember[] | null,
) {
  if (selectedParentId) return selectedParentId;
  if (baseSelectedId) return `${baseSelectedId}::parent::0`;
  return family?.[0] ? `${family[0]._id}::parent::0` : "";
}

function selectedParentFrom(family: FamilyMember[] | null, memberId: string) {
  if (!family?.length) return null;
  const member = matchingMember(family, memberId);
  if (!member) return null;
  return memberWithSelectedParent(member, memberId);
}

function matchingMember(family: FamilyMember[], memberId: string) {
  const baseId = baseMemberId(memberId);
  return (
    family.find((member) => member._id === baseId) ||
    family.find((member) => member._id === memberId) ||
    family[0]
  );
}

function memberWithSelectedParent(member: FamilyMember, memberId: string) {
  const selected =
    parentList(member)[parentIndexFromMemberId(memberId)] || member.parent;
  return { ...member, parent: selectedParentData(selected) };
}

function parentList(member: FamilyMember) {
  return Array.isArray(member.parents) && member.parents.length
    ? member.parents
    : [member.parent];
}

function selectedParentData(selected: any) {
  return {
    salutation: safeText(selected?.salutation),
    firstName: safeText(selected?.firstName),
    lastName: safeText(selected?.lastName),
    email: safeText(selected?.email),
    phone: safeText(selected?.phone),
    phone2: safeText(selected?.phone2),
  };
}

function parentLabel(parent: FamilyMember | null, t: (key: string) => string) {
  if (!parent) return t("admin.customers.documents.parent.select");
  return (
    `${parent.parent.firstName} ${parent.parent.lastName}`.trim() ||
    t("admin.customers.documents.parent.fallback")
  );
}

function activeChildFrom(
  target: BookingTarget,
  uid: string,
  options: { uid: string; child: FamilyChild }[],
) {
  if (target !== "child") return null;
  return options.find((item) => item.uid === uid)?.child || null;
}
