import type { ChildInfo, Customer, ParentInfo } from "../../../types";
import type { FamilyCreateMode } from "../types";

type CustomerRecord = Record<string, unknown>;
type FormCustomer = Customer & {
  child: ChildInfo;
  children: ChildInfo[];
  parent: ParentInfo;
  parents: ParentInfo[];
};

export function makeBlankCustomer(): Customer {
  return {
    _id: "",
    newsletter: false,
    address: { street: "", houseNo: "", zip: "", city: "" },
    child: blankChild(),
    children: [],
    parent: blankParent(),
    parents: [],
    notes: "",
    bookings: [],
    canceledAt: null,
  };
}

function blankChild(): ChildInfo {
  return {
    uid: "",
    firstName: "",
    lastName: "",
    gender: "",
    birthDate: null,
    club: "",
  };
}

function blankParent(): ParentInfo {
  return {
    salutation: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    phone2: "",
  };
}

export function initCustomerForm(
  mode: "create" | "edit",
  customer: Customer | null | undefined,
  blank: Customer,
) {
  if (mode !== "edit" || !customer) return blank;
  const next = structuredClone(customer) as FormCustomer;
  next.parents = Array.isArray(next.parents) ? next.parents : [];
  addLegacyParent(next);
  return next;
}

function addLegacyParent(customer: FormCustomer) {
  if (!hasParentData(customer.parent)) return;
  const exists = customer.parents.some((parent) =>
    sameParent(parent, customer.parent),
  );
  if (!exists) customer.parents.push(normalizeParentInput(customer.parent));
}

export function applyCustomerUpdate(
  prev: Customer,
  path: string,
  value: unknown,
) {
  const copy = structuredClone(prev) as unknown as CustomerRecord;
  const segments = path.split(".");
  const target = resolveTarget(copy, segments);
  target[segments.at(-1) as string] = value;
  return copy as unknown as Customer;
}

function resolveTarget(copy: CustomerRecord, segments: string[]) {
  return segments.slice(0, -1).reduce((target, segment) => {
    const current = target[segment];
    target[segment] = isRecord(current) ? current : {};
    return target[segment] as CustomerRecord;
  }, copy);
}

function isRecord(value: unknown): value is CustomerRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function buildCustomerBody(form: Customer) {
  const mode = (form.__familyCreateMode as FamilyCreateMode) || "none";
  return {
    newsletter: !!form.newsletter,
    address: form.address,
    child: selectedChild(form),
    children: nextChildrenFromForm(form, mode),
    parent: normalizeParentInput(form.parent),
    parents: nextParentsFromForm(form),
    notes: form.notes || "",
  };
}

function selectedChild(form: Customer) {
  const child = normalizeChildInput(form.child);
  child.uid ||= safeText(form.__activeChildUid) || nextUid();
  return child;
}

function nextParentsFromForm(form: Customer) {
  const parents = normalizedParents(form.parents);
  const selected = normalizeParentInput(form.parent);
  if (!hasParentData(selected)) return parents;
  return mergeParent(parents, selected);
}

function normalizedParents(value: ParentInfo[] | undefined) {
  return (value ?? []).map(normalizeParentInput).filter(hasParentData);
}

function mergeParent(parents: ParentInfo[], selected: ParentInfo) {
  const index = parents.findIndex((parent) => sameParent(parent, selected));
  if (index < 0) return [...parents, selected];
  parents[index] = selected;
  return parents;
}

function nextChildrenFromForm(form: Customer, mode: FamilyCreateMode) {
  const children = normalizedChildren(form.children);
  const selected = normalizeSelectedChild(form);
  if (!hasChildData(selected)) return children;
  return mode === "newChild"
    ? addNewChild(children, selected)
    : mergeChild(children, selected);
}

function normalizedChildren(value: ChildInfo[] | undefined) {
  return (value ?? []).map(normalizeChildInput);
}

function normalizeSelectedChild(form: Customer) {
  const selected = normalizeChildInput(form.child);
  selected.uid ||= safeText(form.__activeChildUid) || nextUid();
  return selected;
}

function addNewChild(children: ChildInfo[], selected: ChildInfo) {
  const exists = children.some(
    (child) => safeText(child.uid) === safeText(selected.uid),
  );
  return exists ? children : [...children, selected];
}

function mergeChild(children: ChildInfo[], selected: ChildInfo) {
  const index = children.findIndex(
    (child) => safeText(child.uid) === safeText(selected.uid),
  );
  if (index < 0) return [...children, selected];
  children[index] = selected;
  return children;
}

function normalizeChildInput(child?: ChildInfo | null): ChildInfo {
  return {
    uid: safeText(child?.uid),
    firstName: safeText(child?.firstName),
    lastName: safeText(child?.lastName),
    gender: child?.gender ?? "",
    birthDate: child?.birthDate ?? null,
    club: safeText(child?.club),
  };
}

function normalizeParentInput(parent?: ParentInfo | null): ParentInfo {
  return {
    salutation: parent?.salutation ?? "",
    firstName: safeText(parent?.firstName),
    lastName: safeText(parent?.lastName),
    email: safeText(parent?.email),
    phone: safeText(parent?.phone),
    phone2: safeText(parent?.phone2),
  };
}

function sameParent(first: ParentInfo, second: ParentInfo) {
  const a = normalizeParentInput(first);
  const b = normalizeParentInput(second);
  const emails = [
    safeText(a.email).toLowerCase(),
    safeText(b.email).toLowerCase(),
  ];
  return emails.every(Boolean) ? emails[0] === emails[1] : sameParentName(a, b);
}

function sameParentName(first: ParentInfo, second: ParentInfo) {
  return (
    safeText(first.firstName).toLowerCase() ===
      safeText(second.firstName).toLowerCase() &&
    safeText(first.lastName).toLowerCase() ===
      safeText(second.lastName).toLowerCase()
  );
}

function hasChildData(child: ChildInfo) {
  return !!(safeText(child.firstName) || safeText(child.lastName));
}

function hasParentData(parent: ParentInfo) {
  return [
    parent.salutation,
    parent.firstName,
    parent.lastName,
    parent.email,
    parent.phone,
    parent.phone2,
  ].some(safeText);
}

function safeText(value: unknown) {
  return String(value ?? "").trim();
}

function nextUid() {
  const cryptoApi = globalThis.crypto;
  return (
    cryptoApi?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}
