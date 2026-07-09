import type { FamilyChild, FamilyMember } from "../../types";
import type { ChildOption, ParentOption, TFunc } from "../types";
import { safeText } from "./text";

export function childLabel(child: FamilyChild, t: TFunc) {
  return `${child.firstName} ${child.lastName}`.trim() || t("common.admin.customers.bookDialog.child");
}

export function buildChildOptions(family: FamilyMember[] | null, t: TFunc) {
  return membersOf(family).flatMap((member) => childOptionsForMember(member, t));
}

export function buildParentOptions(family: FamilyMember[] | null, t: TFunc) {
  return membersOf(family).flatMap((member) => parentOptionsForMember(member, t));
}

export function parentIndexFromMemberId(id: string) {
  const idx = safeText(id).indexOf(marker());
  const numberValue = Number(safeText(id).slice(idx + marker().length));
  return idx < 0 || !Number.isFinite(numberValue) ? -1 : numberValue;
}

export function baseMemberId(id: string) {
  const value = safeText(id);
  const idx = value.indexOf(marker());
  return idx >= 0 ? value.slice(0, idx) : value;
}

export function parentOptionId(memberId: string, idx: number) {
  return `${memberId}${marker()}${idx}`;
}

export function selectedParentFromFamily(family: FamilyMember[] | null, selfMemberId: string) {
  const member = selectedRawMember(family, selfMemberId);
  return member ? withSelectedParent(member, parentIndexFromMemberId(selfMemberId)) : null;
}

export function selectedParentLabel(member: FamilyMember | null, t: TFunc) {
  if (!member) return t("common.admin.customers.bookDialog.selectParent");
  return `${member.parent.firstName} ${member.parent.lastName}`.trim() || t("common.admin.customers.bookDialog.parent");
}

export function selfMemberIdFor(selectedParentId: string, baseSelectedId: string, family: FamilyMember[] | null) {
  if (selectedParentId) return selectedParentId;
  if (baseSelectedId) return parentOptionId(baseSelectedId, 0);
  return family?.[0] ? parentOptionId(family[0]._id, 0) : "";
}

function marker() {
  return "::parent::";
}

function membersOf(family: FamilyMember[] | null) {
  return Array.isArray(family) ? family : [];
}

function childOptionsForMember(member: FamilyMember, t: TFunc) {
  const children = Array.isArray(member.children) ? member.children : [];
  return children.filter((child) => isValidChild(child, member)).map((child) => childOption(member, child, t));
}

function childOption(member: FamilyMember, child: FamilyChild, t: TFunc): ChildOption {
  return { uid: safeText(child.uid), label: childLabel(child, t), parentId: member._id, child };
}

function isValidChild(child: FamilyChild, member: FamilyMember) {
  const names = childNames(child, member);
  if (!safeText(child?.uid) || (!names.first && !names.last)) return false;
  if (names.full === "kunde selbst" || names.full.includes("kunde selbst")) return false;
  if (names.full.includes("eltern") || names.full.includes("parent")) return false;
  if (names.full === names.parentFull) return false;
  return names.first !== names.parentFirst || names.last !== names.parentLast;
}

function childNames(child: FamilyChild, member: FamilyMember) {
  const first = safeText(child?.firstName).toLowerCase();
  const last = safeText(child?.lastName).toLowerCase();
  const parentFirst = safeText(member.parent.firstName).toLowerCase();
  const parentLast = safeText(member.parent.lastName).toLowerCase();
  return { first, last, full: `${first} ${last}`.trim(), parentFirst, parentLast, parentFull: `${parentFirst} ${parentLast}`.trim() };
}

function parentOptionsForMember(member: FamilyMember, t: TFunc) {
  return parentsOf(member).map((parent, idx) => parentOption(member._id, parent, idx, t));
}

function parentsOf(member: FamilyMember) {
  return Array.isArray(member.parents) && member.parents.length ? member.parents : [member.parent];
}

function parentOption(memberId: string, parent: any, idx: number, t: TFunc): ParentOption {
  return { id: parentOptionId(memberId, idx), label: `${safeText(parent?.firstName)} ${safeText(parent?.lastName)}`.trim() || t("common.admin.customers.bookDialog.parent") };
}

function selectedRawMember(family: FamilyMember[] | null, selfMemberId: string) {
  const members = membersOf(family);
  const baseId = baseMemberId(selfMemberId);
  return members.find((member) => member._id === baseId) || members.find((member) => member._id === selfMemberId) || members[0] || null;
}

function withSelectedParent(member: FamilyMember, parentIdx: number): FamilyMember {
  const parent = parentsOf(member)[parentIdx] || member.parent;
  return { ...member, parent: normalizedParent(parent) };
}

function normalizedParent(parent: any) {
  return { salutation: safeText(parent?.salutation), firstName: safeText(parent?.firstName), lastName: safeText(parent?.lastName), email: safeText(parent?.email), phone: safeText(parent?.phone), phone2: safeText(parent?.phone2) };
}
