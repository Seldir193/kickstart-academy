import type { FamilyChild, FamilyMember } from "../../../bookDialog/types";
import type { ChildOption, ParentOption, TFunc } from "../types";

const PARENT_MARKER = "::parent::";

export function safeText(v: unknown) {
  return String(v ?? "").trim();
}

export function parentIndexFromMemberId(id: string) {
  const idx = safeText(id).indexOf(PARENT_MARKER);
  if (idx < 0) return -1;
  const n = Number(safeText(id).slice(idx + PARENT_MARKER.length));
  return Number.isFinite(n) ? n : -1;
}

export function baseMemberId(id: string) {
  const value = safeText(id);
  const idx = value.indexOf(PARENT_MARKER);
  return idx >= 0 ? value.slice(0, idx) : value;
}

export function parentOptionId(memberId: string, idx: number) {
  return `${memberId}${PARENT_MARKER}${idx}`;
}

export function buildChildOptions(family: FamilyMember[] | null, t: TFunc) {
  return membersOf(family).flatMap((member) =>
    childOptionsForMember(member, t),
  );
}

export function buildParentOptions(family: FamilyMember[] | null, t: TFunc) {
  return membersOf(family).flatMap((member) =>
    parentOptionsForMember(member, t),
  );
}

export function selectedParentFromFamily(
  family: FamilyMember[] | null,
  selfMemberId: string,
) {
  const rawMember = selectedRawMember(family, selfMemberId);
  if (!rawMember) return null;
  return withSelectedParent(rawMember, selfMemberId);
}

export function selectedParentName(
  selectedParent: FamilyMember | null,
  emptyLabel: string,
) {
  if (!selectedParent) return emptyLabel;
  const parent = selectedParent.parent;
  return `${parent.firstName} ${parent.lastName}`.trim() || emptyLabel;
}

export function childName(child: FamilyChild | null, emptyLabel: string) {
  if (!child) return emptyLabel;
  return `${child.firstName} ${child.lastName}`.trim() || emptyLabel;
}

function membersOf(family: FamilyMember[] | null) {
  return Array.isArray(family) ? family : [];
}

function childOptionsForMember(member: FamilyMember, t: TFunc) {
  return childrenOf(member)
    .filter((child) => validChild(child, member))
    .map((child) => ({
      uid: safeText(child.uid),
      label: childLabel(child, t),
      parentId: member._id,
      child,
    }));
}

function parentOptionsForMember(
  member: FamilyMember,
  t: TFunc,
): ParentOption[] {
  return parentsOf(member).map((parent, idx) => ({
    id: parentOptionId(member._id, idx),
    label: parentLabel(parent, t),
  }));
}

function childrenOf(member: FamilyMember) {
  return Array.isArray(member.children) ? member.children : [];
}

function parentsOf(member: FamilyMember) {
  return Array.isArray(member.parents) && member.parents.length
    ? member.parents
    : [member.parent];
}

function childLabel(child: FamilyChild, t: TFunc) {
  return childName(child, t("common.admin.customers.cancelDialog.child"));
}

function parentLabel(parent: any, t: TFunc) {
  return (
    `${safeText(parent?.firstName)} ${safeText(parent?.lastName)}`.trim() ||
    t("common.admin.customers.cancelDialog.parent")
  );
}

function validChild(child: FamilyChild, member: FamilyMember) {
  const childNameParts = nameParts(child);
  if (!safeText(child?.uid)) return false;
  if (!childNameParts.first && !childNameParts.last) return false;
  return !isParentLikeChild(childNameParts, member);
}

function nameParts(person: any) {
  const first = safeText(person?.firstName).toLowerCase();
  const last = safeText(person?.lastName).toLowerCase();
  return { first, last, full: `${first} ${last}`.trim() };
}

function isParentLikeChild(
  child: ReturnType<typeof nameParts>,
  member: FamilyMember,
) {
  const parent = nameParts(member.parent);
  if (child.full === "kunde selbst") return true;
  if (child.full.includes("kunde selbst")) return true;
  if (child.full.includes("eltern")) return true;
  if (child.full.includes("parent")) return true;
  if (child.first === parent.first && child.last === parent.last) return true;
  return child.full === parent.full;
}

function selectedRawMember(
  family: FamilyMember[] | null,
  selfMemberId: string,
) {
  if (!family?.length) return null;
  const baseId = baseMemberId(selfMemberId);
  return (
    family.find((m) => m._id === baseId) ||
    family.find((m) => m._id === selfMemberId) ||
    family[0]
  );
}

function withSelectedParent(rawMember: FamilyMember, selfMemberId: string) {
  const selected =
    parentsOf(rawMember)[parentIndexFromMemberId(selfMemberId)] ||
    rawMember.parent;
  return { ...rawMember, parent: normalizedParent(selected) };
}

function normalizedParent(parent: any) {
  return {
    salutation: safeText(parent?.salutation),
    firstName: safeText(parent?.firstName),
    lastName: safeText(parent?.lastName),
    email: safeText(parent?.email),
    phone: safeText(parent?.phone),
    phone2: safeText(parent?.phone2),
  };
}
