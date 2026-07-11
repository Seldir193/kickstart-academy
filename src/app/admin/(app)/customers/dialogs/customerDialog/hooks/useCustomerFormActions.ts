"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { TFunction } from "i18next";
import { toastErrorMessage } from "@/lib/toast-messages";
import type { Customer } from "../../../types";
import { createCustomer, toggleNewsletter, updateCustomer } from "../api";
import type { FamilyCreateMode } from "../types";
import { buildCustomerBody } from "./customerForm.helpers";

export function useCustomerFormActions(
  form: Customer,
  setForm: Dispatch<SetStateAction<Customer>>,
  t: TFunction,
) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const create = createHandler(form, setForm, t, setSaving, setErr);
  const save = saveHandler(form, setForm, t, setSaving, setErr);
  return { saving, err, setErr, create, save };
}

function createHandler(
  form: Customer,
  setForm: Dispatch<SetStateAction<Customer>>,
  t: TFunction,
  setSaving: Dispatch<SetStateAction<boolean>>,
  setErr: Dispatch<SetStateAction<string | null>>,
) {
  return async (onCreated?: () => void) => runAction(setSaving, setErr, async () => {
    const created = await createCustomer(buildCustomerBody(form));
    await syncNewsletterAfterCreate(created, setForm, t);
    onCreated?.();
  }, (error) => createError(t, error));
}

function saveHandler(
  form: Customer,
  setForm: Dispatch<SetStateAction<Customer>>,
  t: TFunction,
  setSaving: Dispatch<SetStateAction<boolean>>,
  setErr: Dispatch<SetStateAction<string | null>>,
) {
  return async (
    mode: "create" | "edit",
    familyMode: FamilyCreateMode,
    baseCustomerId: string | null,
    onSaved?: () => void,
    reloadFamily?: (id?: string) => Promise<void>,
  ) => {
    void baseCustomerId;
    if (mode !== "edit") return;
    await runAction(setSaving, setErr, async () => {
      await saveExisting(form, familyMode, setForm, reloadFamily);
      onSaved?.();
    }, (error) => saveError(t, error));
  };
}

async function runAction(
  setSaving: Dispatch<SetStateAction<boolean>>,
  setErr: Dispatch<SetStateAction<string | null>>,
  action: () => Promise<void>,
  errorMessage: (error: unknown) => string,
) {
  setSaving(true);
  setErr(null);
  try {
    await action();
  } catch (error) {
    setErr(errorMessage(error));
  } finally {
    setSaving(false);
  }
}

async function saveExisting(
  form: Customer,
  familyMode: FamilyCreateMode,
  setForm: Dispatch<SetStateAction<Customer>>,
  reloadFamily?: (id?: string) => Promise<void>,
) {
  if (!form._id) throw new Error("Missing customer id");
  const body = buildSaveBody(form, familyMode);
  const updated = await updateCustomer(form._id, body);
  if (!updated?._id) return;
  setForm(updated);
  await reloadFamily?.(updated._id);
}

function buildSaveBody(form: Customer, familyMode: FamilyCreateMode) {
  const copy = structuredClone(form);
  copy.__familyCreateMode = familyMode;
  return buildCustomerBody(copy);
}

async function syncNewsletterAfterCreate(
  created: Customer,
  setForm: Dispatch<SetStateAction<Customer>>,
  t: TFunction,
) {
  if (!created?._id || created.newsletter !== true) return;
  try {
    setForm(await toggleNewsletter(created._id, true));
  } catch (error) {
    console.warn("Newsletter sync after create failed:", newsletterError(t, error));
  }
}

function createError(t: TFunction, error: unknown) {
  return toastErrorMessage(t, error, "common.admin.customers.customerDialog.errors.createFailed");
}

function saveError(t: TFunction, error: unknown) {
  console.error("Customer save error", error);
  return toastErrorMessage(t, error, "common.admin.customers.customerDialog.errors.saveFailed");
}

function newsletterError(t: TFunction, error: unknown) {
  return toastErrorMessage(t, error, "common.admin.customers.customerDialog.errors.newsletterSyncFailed");
}
