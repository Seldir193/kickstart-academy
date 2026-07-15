import type { Customer } from "../../../types";
import type { FamilyMember } from "../types";

export function safeText(value: unknown) {
  return String(value ?? "").trim();
}

export function safeLower(value: unknown) {
  return safeText(value).toLowerCase();
}

function birthKey(value: unknown) {
  if (!value) return "";
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function childKey(child: any) {
  return `${safeLower(child?.firstName)}::${safeLower(child?.lastName)}::${birthKey(child?.birthDate)}`;
}

export function hasChildData(child: any) {
  return !!(safeText(child?.firstName) || safeText(child?.lastName));
}

export function normalizeParent(parent: any) {
  return {
    salutation: safeText(parent?.salutation),
    firstName: safeText(parent?.firstName),
    lastName: safeText(parent?.lastName),
    email: safeText(parent?.email),
    phone: safeText(parent?.phone),
    phone2: safeText(parent?.phone2),
  };
}

function hasParentData(parent: any) {
  return Object.values(normalizeParent(parent)).some(Boolean);
}

function sameParent(a: any, b: any) {
  const pa = normalizeParent(a);
  const pb = normalizeParent(b);
  if (safeLower(pa.email) && safeLower(pb.email))
    return safeLower(pa.email) === safeLower(pb.email);
  return namesMatch(pa.firstName, pa.lastName, pb.firstName, pb.lastName);
}

export function parentFamilyId(baseId: string, index: number) {
  return `${baseId}::parent::${index}`;
}

export function parentIndexFromFamilyId(id: string) {
  return indexFromFamilyId(id, "::parent::");
}

export function childIndexFromFamilyId(id: string) {
  return indexFromFamilyId(id, "::child::");
}

function indexFromFamilyId(id: string, marker: string) {
  const value = safeText(id);
  const markerIndex = value.indexOf(marker);
  if (markerIndex < 0) return -999;
  const parsed = Number(value.slice(markerIndex + marker.length));
  return Number.isFinite(parsed) ? parsed : -999;
}

export function isParentFamilyId(id: string) {
  return parentIndexFromFamilyId(id) !== -999;
}

export function isChildFamilyId(id: string) {
  return childIndexFromFamilyId(id) !== -999;
}

export function baseIdFromFamilyId(id: string) {
  const value = safeText(id);
  const index = value.indexOf("::child::");
  return index >= 0 ? value.slice(0, index) : value;
}

export function emptyChild() {
  return {
    uid: "",
    firstName: "",
    lastName: "",
    gender: "",
    birthDate: null,
    club: "",
  };
}

export function childLike(child: any) {
  return {
    uid: safeText(child?.uid),
    firstName: safeText(child?.firstName),
    lastName: safeText(child?.lastName),
    gender: safeText(child?.gender),
    birthDate: child?.birthDate ?? null,
    club: safeText(child?.club),
  };
}

export function namesMatch(
  aFirst: unknown,
  aLast: unknown,
  bFirst: unknown,
  bLast: unknown,
) {
  return (
    safeLower(aFirst) === safeLower(bFirst) &&
    safeLower(aLast) === safeLower(bLast)
  );
}

export function isSelfFamilyMember(member: FamilyMember) {
  if (!hasChildData(member?.child)) return true;
  const parent = member?.parent || {};
  if (!safeText(parent.firstName) && !safeText(parent.lastName)) return false;
  return namesMatch(
    member.child?.firstName,
    member.child?.lastName,
    parent.firstName,
    parent.lastName,
  );
}

export function selfLabelFromForm(form: Customer) {
  const parent = (form as any)?.parent || {};
  return [safeText(parent?.firstName), safeText(parent?.lastName)]
    .filter(Boolean)
    .join(" ");
}

export function selfLabelFromMember(member: FamilyMember) {
  return [
    safeText(member?.parent?.firstName),
    safeText(member?.parent?.lastName),
  ]
    .filter(Boolean)
    .join(" ");
}

function parentCandidates(form: Customer) {
  const parents = Array.isArray((form as any)?.parents)
    ? (form as any).parents
    : [];
  const normalized = parents.map(normalizeParent).filter(hasParentData);
  const active = normalizeParent((form as any)?.parent);
  if (
    hasParentData(active) &&
    !normalized.some((parent: any) => sameParent(parent, active))
  )
    normalized.push(active);
  return normalized;
}

export function buildParentMembersFromForm(
  form: Customer,
  baseCustomerId: string | null,
) {
  const baseId = safeText(baseCustomerId || form?._id);
  if (!baseId) return [];
  const parents = parentCandidates(form);
  return parents.map((parent: any, index: number) => ({
    _id: parentFamilyId(baseId, index),
    userId: null,
    childNumber: null,
    parent,
    parents,
    child: null,
    children: [],
  })) as FamilyMember[];
}

function pushExpandedChild(
  out: FamilyMember[],
  member: FamilyMember,
  child: any,
  index: number,
) {
  out.push({
    ...member,
    _id: `${safeText(member._id)}::child::${index}`,
    child,
    childNumber: index + 1,
  });
}

function appendChildren(
  out: FamilyMember[],
  member: FamilyMember,
  seen: Set<string>,
) {
  const children = Array.isArray(member.children) ? member.children : [];
  children.forEach((child, index) => {
    if (!hasChildData(child)) return;
    const key = childKey(child);
    if (key && seen.has(key)) return;
    if (key) seen.add(key);
    pushExpandedChild(out, member, child, index);
  });
}

function appendLegacy(
  out: FamilyMember[],
  member: FamilyMember,
  seen: Set<string>,
) {
  const legacy = hasChildData(member.child) ? member.child : null;
  if (!legacy) return;
  const key = childKey(legacy);
  const duplicate =
    (key && seen.has(key)) ||
    member.children?.some(
      (child) => safeText(child?.uid) === safeText(legacy?.uid),
    );
  if (!duplicate) pushExpandedChild(out, member, legacy, -1);
}

export function expandMembersForDropdown(members: FamilyMember[]) {
  const out: FamilyMember[] = [];
  members.forEach((member) => {
    const seen = new Set<string>();
    appendChildren(out, member, seen);
    appendLegacy(out, member, seen);
    if (!hasChildData(member.child) && !member.children?.length)
      out.push({ ...member, child: null, childNumber: null });
  });
  return out;
}

export function pickChildFromExpandedMember(
  member: FamilyMember,
  index: number,
) {
  if (index === -1) return member.child;
  if (index >= 0) return member.children?.[index] || member.child || null;
  return member.child;
}

export function pickMember(members: FamilyMember[], activeId: string) {
  if (!members.length) return undefined;
  return members.find((member) => member._id === activeId) || members[0];
}

export function buildVisibleSelfMembers(
  members: FamilyMember[],
  form: Customer,
  baseId: string | null,
) {
  const parents = buildParentMembersFromForm(form, baseId);
  if (parents.length) return parents;
  const selfMembers = members.filter(isSelfFamilyMember);
  if (selfMembers.length) return selfMembers;
  return fallbackSelfMember(form, baseId, selfMembers);
}

function fallbackSelfMember(
  form: Customer,
  baseId: string | null,
  fallback: FamilyMember[],
) {
  const id = safeText(baseId || form?._id);
  if (!id || !selfLabelFromForm(form)) return fallback;
  const parent = normalizeParent((form as any)?.parent);
  return [
    {
      _id: parentFamilyId(id, 0),
      userId: null,
      childNumber: null,
      parent,
      parents: [parent],
      child: null,
      children: [],
    },
  ];
}

export function newUid() {
  const cryptoApi = (globalThis as any)?.crypto;
  return cryptoApi?.randomUUID
    ? cryptoApi.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
