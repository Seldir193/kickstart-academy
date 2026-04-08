//src\app\admin\(app)\customers\dialogs\customerDialog\hooks\useCustomerFamily.ts
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toastErrorMessage } from "@/lib/toast-messages";
import type { Customer } from "../../../types";
import { fetchCustomerById, fetchFamily } from "../api";
import { formatChildLabel } from "../formatters";
import type { FamilyCreateMode, FamilyMember } from "../types";
import { useDropdownOutsideClose } from "./useDropdownOutsideClose";

function safeText(v: unknown) {
  return String(v ?? "").trim();
}

function safeLower(v: unknown) {
  return safeText(v).toLowerCase();
}

function birthKey(v: any) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function childKey(ch: any) {
  return `${safeLower(ch?.firstName)}::${safeLower(ch?.lastName)}::${birthKey(
    ch?.birthDate,
  )}`;
}

function hasChildData(ch: any) {
  return !!(safeText(ch?.firstName) || safeText(ch?.lastName));
}

function normalizeParent(parent: any) {
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
  return !!(
    safeText(parent?.salutation) ||
    safeText(parent?.firstName) ||
    safeText(parent?.lastName) ||
    safeText(parent?.email) ||
    safeText(parent?.phone) ||
    safeText(parent?.phone2)
  );
}

function sameParent(a: any, b: any) {
  const pa = normalizeParent(a);
  const pb = normalizeParent(b);

  const aEmail = safeLower(pa.email);
  const bEmail = safeLower(pb.email);

  if (aEmail && bEmail) return aEmail === bEmail;

  return (
    safeLower(pa.firstName) === safeLower(pb.firstName) &&
    safeLower(pa.lastName) === safeLower(pb.lastName)
  );
}

function parentFamilyId(baseId: string, idx: number) {
  return `${baseId}::parent::${idx}`;
}

function parentIndexFromFamilyId(id: string) {
  const v = safeText(id);
  const i = v.indexOf("::parent::");
  if (i < 0) return -999;
  const n = Number(v.slice(i + "::parent::".length));
  return Number.isFinite(n) ? n : -999;
}

function isParentFamilyId(id: string) {
  return parentIndexFromFamilyId(id) !== -999;
}

function buildParentMembersFromForm(
  form: Customer,
  baseCustomerId: string | null,
): FamilyMember[] {
  const baseId = safeText(baseCustomerId || form?._id);
  if (!baseId) return [];

  const rawParents = Array.isArray((form as any)?.parents)
    ? (form as any).parents
    : [];

  const parents = rawParents
    .map((p: any) => normalizeParent(p))
    .filter((p: any) => hasParentData(p));

  const activeParent = normalizeParent((form as any)?.parent);
  if (hasParentData(activeParent)) {
    const hasIt = parents.some((p: any) => sameParent(p, activeParent));
    if (!hasIt) parents.push(activeParent);
  }

  return parents.map((parent: any, idx: number) => ({
    _id: parentFamilyId(baseId, idx),
    userId: null,
    childNumber: null,
    parent,
    parents,
    child: null,
    children: [],
  }));
}

function emptyChild() {
  return {
    uid: "",
    firstName: "",
    lastName: "",
    gender: "",
    birthDate: null,
    club: "",
  };
}

function baseIdFromFamilyId(id: string) {
  const v = safeText(id);
  const i = v.indexOf("::child::");
  return i >= 0 ? v.slice(0, i) : v;
}

function childIndexFromFamilyId(id: string) {
  const v = safeText(id);
  const i = v.indexOf("::child::");
  if (i < 0) return -999;
  const n = Number(v.slice(i + "::child::".length));
  return Number.isFinite(n) ? n : -999;
}

function isChildFamilyId(id: string) {
  return childIndexFromFamilyId(id) !== -999;
}

function childLike(ch: any) {
  return {
    uid: safeText(ch?.uid),
    firstName: safeText(ch?.firstName),
    lastName: safeText(ch?.lastName),
    gender: safeText(ch?.gender),
    birthDate: ch?.birthDate ?? null,
    club: safeText(ch?.club),
  };
}

function expandMembersForDropdown(members: FamilyMember[]) {
  const out: FamilyMember[] = [];

  members.forEach((m) => {
    const baseId = safeText(m._id);
    const legacy = hasChildData(m.child) ? m.child : null;
    const children = Array.isArray(m.children) ? m.children : [];
    const seen = new Set<string>();

    children.forEach((ch, idx) => {
      if (!hasChildData(ch)) return;
      const k = childKey(ch);
      if (k && seen.has(k)) return;
      if (k) seen.add(k);

      out.push({
        ...m,
        _id: `${baseId}::child::${idx}`,
        child: ch,
        childNumber: idx + 1,
      });
    });

    if (legacy) {
      const k = childKey(legacy);
      const alreadyIncluded =
        (k && seen.has(k)) ||
        children.some((ch) => safeText(ch?.uid) === safeText(legacy?.uid));

      if (!alreadyIncluded) {
        out.push({
          ...m,
          _id: `${baseId}::child::-1`,
          child: legacy,
          childNumber: children.length + 1,
        });
      }
    }

    if (!legacy && children.length === 0) {
      out.push({
        ...m,
        _id: baseId,
        child: null,
        childNumber: null,
      });
    }
  });

  return out;
}

function pickChildFromExpandedMember(member: FamilyMember, childIdx: number) {
  if (childIdx === -1) return member.child;
  if (childIdx >= 0) return member.children?.[childIdx] || member.child || null;
  return member.child;
}

function syncMode(
  mode: "create" | "edit",
  customer: Customer | null | undefined,
  setActive: (v: string | null) => void,
  setMembers: (v: FamilyMember[]) => void,
  setFamilyOpen: (v: boolean) => void,
  setSelfOpen: (v: boolean) => void,
  setCreateMode: (v: FamilyCreateMode) => void,
) {
  if (mode === "edit" && customer) setActive(customer._id || null);
  if (mode !== "create") return;
  setActive(null);
  setMembers([]);
  setFamilyOpen(false);
  setSelfOpen(false);
  setCreateMode("none");
}

async function reloadFamily(
  baseId: string | undefined,
  baseCustomerId: string | null,
  formId: string,
  setMembers: (v: FamilyMember[]) => void,
  setLoading: (v: boolean) => void,
  setErr: (v: string | null) => void,
  t: (key: string) => string,
) {
  const id = baseId || baseCustomerId || formId;
  if (!id) return;

  try {
    setLoading(true);
    setErr(null);
    const data = await fetchFamily(id);
    const raw = data?.ok && Array.isArray(data.members) ? data.members : [];
    setMembers(expandMembersForDropdown(raw));
  } catch (e: any) {
    console.error("reloadFamily failed", e);
    setErr(
      toastErrorMessage(
        t,
        e,
        "common.admin.customers.customerDialog.errors.familyLoadFailed",
      ),
    );
    setMembers([]);
  } finally {
    setLoading(false);
  }
}

function pickMember(members: FamilyMember[], activeId: string) {
  if (!members.length) return undefined;
  if (!activeId) return members[0];
  return members.find((m) => m._id === activeId) || members[0];
}

function namesMatch(
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

function isSelfFamilyMember(member: FamilyMember) {
  const childFirst = safeText(member?.child?.firstName);
  const childLast = safeText(member?.child?.lastName);
  const parentFirst = safeText((member as any)?.parent?.firstName);
  const parentLast = safeText((member as any)?.parent?.lastName);

  if (!hasChildData(member?.child)) return true;
  if (!parentFirst && !parentLast) return false;
  return namesMatch(childFirst, childLast, parentFirst, parentLast);
}

function selfLabelFromForm(form: Customer) {
  const parent = (form as any)?.parent || {};
  return [safeText(parent?.firstName), safeText(parent?.lastName)]
    .filter(Boolean)
    .join(" ");
}

function buildVisibleSelfMembers(
  familyMembers: FamilyMember[],
  form: Customer,
  baseCustomerId: string | null,
) {
  const fromParents = buildParentMembersFromForm(form, baseCustomerId);
  if (fromParents.length) return fromParents;

  const list = familyMembers.filter((m) => isSelfFamilyMember(m));
  if (list.length) return list;

  const id = safeText(baseCustomerId || form?._id);
  const label = selfLabelFromForm(form);
  if (!id || !label) return list;

  return [
    {
      _id: parentFamilyId(id, 0),
      userId: null,
      childNumber: null,
      parent: {
        firstName: safeText((form as any)?.parent?.firstName),
        lastName: safeText((form as any)?.parent?.lastName),
        email: safeText((form as any)?.parent?.email),
        salutation: safeText((form as any)?.parent?.salutation),
        phone: safeText((form as any)?.parent?.phone),
        phone2: safeText((form as any)?.parent?.phone2),
      },
      parents: [normalizeParent((form as any)?.parent)],
      child: null,
      children: [],
    },
  ];
}

export function useCustomerFamily(
  mode: "create" | "edit",
  customer: Customer | null | undefined,
  form: Customer,
  setForm: (v: any) => void,
) {
  const { t } = useTranslation();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [familyLoading, setFamilyLoading] = useState(false);
  const [familyError, setFamilyError] = useState<string | null>(null);
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(
    customer?._id || null,
  );
  const [familyCreateMode, setFamilyCreateMode] =
    useState<FamilyCreateMode>("none");

  const baseCustomerId = customer?._id || null;
  const [familyDropdownOpen, setFamilyDropdownOpen] = useState(false);
  const [selfDropdownOpen, setSelfDropdownOpen] = useState(false);
  const familyDropdownRef = useRef<HTMLDivElement | null>(null);
  const selfDropdownRef = useRef<HTMLDivElement | null>(null);

  useDropdownOutsideClose([
    { ref: familyDropdownRef, close: () => setFamilyDropdownOpen(false) },
    { ref: selfDropdownRef, close: () => setSelfDropdownOpen(false) },
  ]);

  useEffect(() => {
    syncMode(
      mode,
      customer,
      setActiveCustomerId,
      setFamilyMembers,
      setFamilyDropdownOpen,
      setSelfDropdownOpen,
      setFamilyCreateMode,
    );
  }, [mode, customer]);

  useEffect(() => {
    if (mode !== "edit") return;
    const id = customer?._id;
    if (!id) return;
    void reloadFamily(
      id,
      baseCustomerId,
      form._id,
      setFamilyMembers,
      setFamilyLoading,
      setFamilyError,
      t,
    );
  }, [mode, customer && customer._id]);

  const childFamilyMembers = useMemo(() => {
    return familyMembers.filter((m) => !isSelfFamilyMember(m));
  }, [familyMembers]);

  const selfFamilyMembers = useMemo(() => {
    return buildVisibleSelfMembers(familyMembers, form, baseCustomerId);
  }, [familyMembers, form, baseCustomerId]);

  const activeFamilyId =
    safeText((form as any)?.__activeFamilyId) ||
    activeCustomerId ||
    baseCustomerId ||
    "";
  const selectedFamilyMember = useMemo(
    () => pickMember(familyMembers, activeFamilyId),
    [familyMembers, activeFamilyId],
  );

  const selectedChildLabel = useMemo(() => {
    const hit = childFamilyMembers.find((m) => m._id === activeFamilyId);
    return hit ? formatChildLabel(hit, t) : "";
  }, [childFamilyMembers, activeFamilyId, t]);

  function selfLabelFromMember(member: FamilyMember) {
    const first = safeText(member?.parent?.firstName);
    const last = safeText(member?.parent?.lastName);
    return [first, last].filter(Boolean).join(" ");
  }

  const selectedSelfLabel = useMemo(() => {
    const hit = selfFamilyMembers.find((m) => m._id === activeFamilyId);
    if (hit) return selfLabelFromMember(hit);

    const currentFormLabel = selfLabelFromForm(form);
    if (currentFormLabel) return currentFormLabel;

    const firstSelf = selfFamilyMembers[0];
    return firstSelf ? selfLabelFromMember(firstSelf) : "";
  }, [selfFamilyMembers, activeFamilyId, form]);

  useEffect(() => {
    if (mode !== "edit") return;

    if (familyCreateMode === "newChild" || familyCreateMode === "newParent")
      return;
    if (!baseCustomerId) return;
    if (activeFamilyId !== baseCustomerId) return;

    setForm((prev: any) => {
      const current = prev?.child || {};
      if (!hasChildData(current) && !safeText(current?.uid)) return prev;

      return {
        ...prev,
        child: emptyChild(),
        __activeChildIdx: -999,
        __activeChildUid: "",
        __activeFamilyId: baseCustomerId,
      };
    });
  }, [mode, familyCreateMode, baseCustomerId, activeFamilyId, setForm]);

  async function loadCustomer(
    baseId: string,
    keepActiveId: string,
    child: any,
  ) {
    try {
      const fresh = await fetchCustomerById(baseId);
      const idx = childIndexFromFamilyId(keepActiveId);
      const isChildSelection = isChildFamilyId(keepActiveId);

      const parentIdx = parentIndexFromFamilyId(keepActiveId);
      const isParentSelection = isParentFamilyId(keepActiveId);

      const freshChildren = Array.isArray((fresh as any)?.children)
        ? (fresh as any).children
        : [];

      const requestedUid = safeText(child?.uid);

      const matchedChild = isChildSelection
        ? (requestedUid
            ? freshChildren.find(
                (ch: any) => safeText(ch?.uid) === requestedUid,
              )
            : null) ||
          (child
            ? freshChildren.find((ch: any) =>
                namesMatch(
                  ch?.firstName,
                  ch?.lastName,
                  child?.firstName,
                  child?.lastName,
                ),
              )
            : null) ||
          (child ? childLike(child) : null) ||
          (fresh as any)?.child ||
          null
        : null;

      const freshParents = Array.isArray((fresh as any)?.parents)
        ? (fresh as any).parents
        : [];

      const selectedParent = isParentSelection
        ? normalizeParent(
            freshParents[parentIdx] || (fresh as any)?.parent || {},
          )
        : normalizeParent((fresh as any)?.parent || {});

      const next = {
        ...(fresh || {}),
        parent: selectedParent,
        child: matchedChild || emptyChild(),
        __activeChildIdx: isChildSelection ? idx : -999,
        __activeChildUid: isChildSelection ? safeText(matchedChild?.uid) : "",
        __activeFamilyId: keepActiveId,
        __familyCreateMode: "none",
      };

      setForm(next);
      setFamilyDropdownOpen(false);
      setSelfDropdownOpen(false);
      setActiveCustomerId(keepActiveId);

      void reloadFamily(
        (fresh as any)?._id || baseId,
        baseCustomerId,
        form._id,
        setFamilyMembers,
        setFamilyLoading,
        setFamilyError,
        t,
      );
    } catch (e: any) {
      console.error("loadCustomerById failed", e);
    }
  }

  function handleSelectFamilyMember(id: string) {
    if (!id) return;

    setFamilyCreateMode("none");
    setActiveCustomerId(id);
    setFamilyDropdownOpen(false);
    setSelfDropdownOpen(false);

    if (isParentFamilyId(id)) {
      const hit = selfFamilyMembers.find((m) => m._id === id);
      const selectedParent = normalizeParent(hit?.parent || {});

      setForm((prev: any) => ({
        ...prev,
        parent: selectedParent,
        __familyCreateMode: "none",
        __activeFamilyId: id,
      }));
      return;
    }

    const baseId = baseIdFromFamilyId(id);
    const idx = childIndexFromFamilyId(id);
    const member = familyMembers.find((m) => m._id === id);
    const child = member ? pickChildFromExpandedMember(member, idx) : null;

    void loadCustomer(baseId, id, child);
  }

  function newUid() {
    const g = (globalThis as any)?.crypto;
    if (g?.randomUUID) return g.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function handleAddSibling() {
    if (!baseCustomerId && !form._id) return;

    const uid = newUid();
    const base = (baseCustomerId || form._id) ?? "";

    setFamilyCreateMode("newChild");
    setActiveCustomerId(`${base}::child::-1`);
    setFamilyDropdownOpen(false);
    setSelfDropdownOpen(false);

    setForm((prev: any) => ({
      ...prev,
      __familyCreateMode: "newChild",
      __activeChildIdx: -1,
      __activeChildUid: uid,
      __activeFamilyId: `${base}::child::-1`,
      child: {
        uid,
        firstName: "",
        lastName: "",
        gender: "",
        birthDate: null,
        club: "",
      },
    }));
  }

  function handleAddParent() {
    if (!baseCustomerId && !form._id) return;

    const base = (baseCustomerId || form._id) ?? "";
    const existingParents = Array.isArray((form as any)?.parents)
      ? (form as any).parents
      : [];
    const newIndex = existingParents.length;

    setFamilyCreateMode("newParent");
    setActiveCustomerId(parentFamilyId(base, newIndex));
    setFamilyDropdownOpen(false);
    setSelfDropdownOpen(false);

    setForm((prev: any) => ({
      ...prev,
      __familyCreateMode: "newParent",
      __activeFamilyId: parentFamilyId(base, newIndex),
      parent: {
        salutation: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        phone2: "",
      },
    }));
  }

  async function reloadFamilyWrapper(id?: string) {
    await reloadFamily(
      id,
      baseCustomerId,
      form._id,
      setFamilyMembers,
      setFamilyLoading,
      setFamilyError,
      t,
    );
  }

  return {
    familyMembers,
    childFamilyMembers,
    selfFamilyMembers,
    familyLoading,
    familyError,
    familyDropdownOpen,
    selfDropdownOpen,
    setFamilyDropdownOpen,
    setSelfDropdownOpen,
    familyDropdownRef,
    selfDropdownRef,
    activeFamilyId,
    selectedFamilyMember,
    selectedChildLabel,
    selectedSelfLabel,
    handleSelectFamilyMember,
    handleAddSibling,
    handleAddParent,
    familyCreateMode,
    setFamilyCreateMode,
    activeCustomerId,
    setActiveCustomerId,
    baseCustomerId,
    reloadFamily: reloadFamilyWrapper,
  };
}
