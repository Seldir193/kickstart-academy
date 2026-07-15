import type { FamilyChild, FamilyMember } from "../../../bookDialog/types";
import type { ChildOption, ParentOption } from "../types";
import { safeText } from "./text";

type ParentIdentity = { first: string; last: string; full: string };

export function buildChildOptions(
  family: FamilyMember[] | null,
  t: (key: string) => string,
) {
  return familyMembers(family).flatMap((member) =>
    childOptionsForMember(member, t),
  );
}

export function buildParentOptions(
  family: FamilyMember[] | null,
  t: (key: string) => string,
) {
  return familyMembers(family).flatMap((member) =>
    parentOptionsForMember(member, t),
  );
}

export function parentIndexFromMemberId(id: string) {
  const idx = safeText(id).indexOf(parentMarker());
  if (idx < 0) return -1;
  return numericParentIndex(id, idx);
}

export function baseMemberId(id: string) {
  const value = safeText(id);
  const idx = value.indexOf(parentMarker());
  return idx >= 0 ? value.slice(0, idx) : value;
}

export function parentOptionId(memberId: string, idx: number) {
  return `${memberId}${parentMarker()}${idx}`;
}

function familyMembers(family: FamilyMember[] | null) {
  return Array.isArray(family) ? family : [];
}

function childOptionsForMember(
  member: FamilyMember,
  t: (key: string) => string,
) {
  const parent = parentIdentity(member);
  return memberChildren(member)
    .filter((child) => isValidChild(child, parent))
    .map((child) => childOption(member, child, t));
}

function memberChildren(member: FamilyMember) {
  return Array.isArray(member.children) ? member.children : [];
}

function parentIdentity(member: FamilyMember): ParentIdentity {
  const first = safeText(member.parent.firstName).toLowerCase();
  const last = safeText(member.parent.lastName).toLowerCase();
  return { first, last, full: `${first} ${last}`.trim() };
}

function isValidChild(child: FamilyChild, parent: ParentIdentity) {
  const data = childValidationData(child);
  if (!data.uid || (!data.first && !data.last)) return false;
  return !isParentLikeChild(data, parent);
}

function childValidationData(child: FamilyChild) {
  const first = safeText(child?.firstName);
  const last = safeText(child?.lastName);
  return {
    uid: safeText(child?.uid),
    first,
    last,
    full: `${first.toLowerCase()} ${last.toLowerCase()}`.trim(),
  };
}

function isParentLikeChild(
  data: ReturnType<typeof childValidationData>,
  parent: ParentIdentity,
) {
  if (data.full === "kunde selbst") return true;
  if (data.full.includes("kunde selbst")) return true;
  if (data.full.includes("eltern")) return true;
  if (data.full.includes("parent")) return true;
  if (
    data.first.toLowerCase() === parent.first &&
    data.last.toLowerCase() === parent.last
  )
    return true;
  return data.full === parent.full;
}

function childOption(
  member: FamilyMember,
  child: FamilyChild,
  t: (key: string) => string,
): ChildOption {
  return {
    uid: safeText(child.uid),
    label: childLabel(child, t),
    parentId: member._id,
    child,
  };
}

function childLabel(child: FamilyChild, t: (key: string) => string) {
  return (
    `${child.firstName} ${child.lastName}`.trim() ||
    t("admin.customers.documents.child.fallback")
  );
}

function parentOptionsForMember(
  member: FamilyMember,
  t: (key: string) => string,
) {
  return rawParents(member).map((parent, idx) =>
    parentOption(member, parent, idx, t),
  );
}

function rawParents(member: FamilyMember) {
  return Array.isArray(member.parents) && member.parents.length
    ? member.parents
    : [member.parent];
}

function parentOption(
  member: FamilyMember,
  parent: any,
  idx: number,
  t: (key: string) => string,
): ParentOption {
  return { id: parentOptionId(member._id, idx), label: parentLabel(parent, t) };
}

function parentLabel(parent: any, t: (key: string) => string) {
  return (
    `${safeText(parent?.firstName)} ${safeText(parent?.lastName)}`.trim() ||
    t("admin.customers.documents.parent.fallback")
  );
}

function numericParentIndex(id: string, markerIndex: number) {
  const n = Number(safeText(id).slice(markerIndex + parentMarker().length));
  return Number.isFinite(n) ? n : -1;
}

function parentMarker() {
  return "::parent::";
}
