// src/app/admin/(app)/customers/dialogs/customerDialog/hooks/useCustomerForm.ts
"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toastErrorMessage, toastText } from "@/lib/toast-messages";
import type { Customer } from "../../../types";
import { createCustomer, toggleNewsletter, updateCustomer } from "../api";
import { fmtDE } from "../formatters";
import type { FamilyCreateMode } from "../types";

export function useCustomerForm(
  mode: "create" | "edit",
  customer?: Customer | null,
) {
  const { t, i18n } = useTranslation();
  const blank = useRef<Customer>(makeBlank());
  const [form, setForm] = useState<Customer>(() =>
    initForm(mode, customer, blank.current),
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [bookOpen, setBookOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [stornoOpen, setStornoOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);

  const [newsletterBusy, setNewsletterBusy] = useState(false);

  const [salutationOpen, setSalutationOpen] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);

  const salutationDropdownRef = useRef<HTMLDivElement | null>(null);
  const genderDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setForm(initForm(mode, customer, blank.current));
  }, [mode, customer]);

  function up(path: string, value: any) {
    setForm((prev) => applyUpdate(prev, path, value));
  }

  async function create(onCreated?: () => void) {
    setSaving(true);
    setErr(null);
    try {
      const created = await createCustomer(buildBody(form));
      await syncNewsletterAfterCreate(created, setForm, t);
      onCreated?.();
    } catch (e: any) {
      setErr(
        toastErrorMessage(
          t,
          e,
          "common.admin.customers.customerDialog.errors.createFailed",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  async function save(
    currentMode: "create" | "edit",
    familyCreateMode: FamilyCreateMode,
    baseCustomerId: string | null,
    onSaved?: () => void,
    reloadFamily?: (id?: string) => Promise<void>,
  ) {
    void baseCustomerId;

    if (currentMode !== "edit") return;
    setSaving(true);
    setErr(null);

    try {
      await saveExisting(form, familyCreateMode, setForm, reloadFamily);
      onSaved?.();
    } catch (e: any) {
      console.error("Customer save error", e);
      setErr(
        toastErrorMessage(
          t,
          e,
          "common.admin.customers.customerDialog.errors.saveFailed",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  return {
    form,
    setForm,
    saving,
    err,
    setErr,
    up,
    create,
    save,
    bookOpen,
    setBookOpen,
    cancelOpen,
    setCancelOpen,
    stornoOpen,
    setStornoOpen,
    documentsOpen,
    setDocumentsOpen,
    newsletterBusy,
    setNewsletterBusy,
    salutationOpen,
    setSalutationOpen,
    genderOpen,
    setGenderOpen,
    salutationDropdownRef,
    genderDropdownRef,
    fmtDE: (value: any) => fmtDE(value, i18n.language),
  };
}

function makeBlank(): Customer {
  return {
    _id: "",
    newsletter: false,
    address: { street: "", houseNo: "", zip: "", city: "" },
    child: {
      uid: "",
      firstName: "",
      lastName: "",
      gender: "",
      birthDate: null,
      club: "",
    },
    children: [],
    parent: {
      salutation: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      phone2: "",
    },
    parents: [],
    notes: "",
    bookings: [],
    canceledAt: null,
  } as any;
}

function initForm(
  mode: "create" | "edit",
  customer: Customer | null | undefined,
  blank: Customer,
) {
  if (mode !== "edit" || !customer) return blank;

  const next = structuredClone(customer) as any;

  if (!Array.isArray(next.parents)) {
    next.parents = [];
  }

  if (hasParentData(next.parent)) {
    const hasLegacy = next.parents.some((p: any) => sameParent(p, next.parent));
    if (!hasLegacy) {
      next.parents.push(normalizeParentInput(next.parent));
    }
  }

  return next;
}

function applyUpdate(prev: Customer, path: string, value: any) {
  const c = structuredClone(prev) as any;
  const segs = path.split(".");
  let ref = c;
  for (let i = 0; i < segs.length - 1; i++) {
    ref[segs[i]] = ref[segs[i]] ?? {};
    ref = ref[segs[i]];
  }
  ref[segs[segs.length - 1]] = value;
  return c as Customer;
}

function safeText(v: unknown) {
  return String(v ?? "").trim();
}

function normalizeChildInput(ch: any) {
  return {
    uid: safeText(ch?.uid),
    firstName: safeText(ch?.firstName),
    lastName: safeText(ch?.lastName),
    gender: safeText(ch?.gender),
    birthDate: ch?.birthDate ?? null,
    club: safeText(ch?.club),
  };
}

function hasChildData(ch: any) {
  return !!(safeText(ch?.firstName) || safeText(ch?.lastName));
}

function normalizeParentInput(parent: any) {
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
  const pa = normalizeParentInput(a);
  const pb = normalizeParentInput(b);

  const aEmail = safeText(pa.email).toLowerCase();
  const bEmail = safeText(pb.email).toLowerCase();

  if (aEmail && bEmail) return aEmail === bEmail;

  return (
    safeText(pa.firstName).toLowerCase() ===
      safeText(pb.firstName).toLowerCase() &&
    safeText(pa.lastName).toLowerCase() === safeText(pb.lastName).toLowerCase()
  );
}

function nextParentsFromForm(form: any) {
  const rawParents = Array.isArray(form?.parents) ? form.parents : [];
  const parents = rawParents
    .map((p: any) => normalizeParentInput(p))
    .filter((p: any) => hasParentData(p));

  const selected = normalizeParentInput(form?.parent);
  if (!hasParentData(selected)) return parents;

  const idx = parents.findIndex((p: any) => sameParent(p, selected));
  if (idx >= 0) {
    parents[idx] = selected;
    return parents;
  }

  parents.push(selected);
  return parents;
}

function nextUid() {
  const g = (globalThis as any)?.crypto;
  if (g?.randomUUID) return g.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nextChildrenFromForm(form: any, mode: FamilyCreateMode) {
  const rawChildren = Array.isArray(form?.children) ? form.children : [];
  const children = rawChildren.map((c: any) => normalizeChildInput(c));
  const selected = normalizeChildInput(form?.child);

  const activeUid = safeText(form?.__activeChildUid);
  if (!selected.uid) selected.uid = activeUid || nextUid();
  if (!hasChildData(selected)) return children;

  if (mode === "newChild") {
    if (
      !children.some((c: any) => safeText(c.uid) === safeText(selected.uid))
    ) {
      children.push(selected);
    }
    return children;
  }

  const idx = children.findIndex(
    (c: any) => safeText(c.uid) === safeText(selected.uid),
  );
  if (idx >= 0) {
    children[idx] = selected;
    return children;
  }

  children.push(selected);
  return children;
}

function buildBody(form: Customer) {
  const anyForm = form as any;
  const mode = (anyForm?.__familyCreateMode as FamilyCreateMode) || "none";
  const children = nextChildrenFromForm(anyForm, mode);

  const child = normalizeChildInput((form as any).child);
  if (!child.uid) child.uid = safeText(anyForm?.__activeChildUid) || nextUid();

  const parents = nextParentsFromForm(anyForm);
  const parent = normalizeParentInput(form.parent);

  return {
    newsletter: !!form.newsletter,
    address: form.address,
    child,
    children,
    parent,
    parents,

    notes: form.notes || "",
  };
}

async function syncNewsletterAfterCreate(
  created: any,
  setForm: (u: any) => void,
  t: (key: string) => string,
) {
  if (!created?._id || created?.newsletter !== true) return;
  try {
    const updated = await toggleNewsletter(created._id, true);
    setForm(updated);
  } catch (e: any) {
    console.warn(
      "Newsletter sync after create failed:",
      toastErrorMessage(
        t,
        e,
        "common.admin.customers.customerDialog.errors.newsletterSyncFailed",
      ),
    );
  }
}

async function saveExisting(
  form: Customer,
  familyCreateMode: FamilyCreateMode,
  setForm: (v: any) => void,
  reloadFamily?: (id?: string) => Promise<void>,
) {
  if (!form._id) throw new Error("Missing customer id");

  const anyForm = form as any;
  anyForm.__familyCreateMode = familyCreateMode;

  const updated = await updateCustomer(form._id, buildBody(anyForm));
  if (updated && updated._id) {
    setForm(updated);
    await reloadFamily?.(updated._id);
  }
}
