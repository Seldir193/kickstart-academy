"use client";

import type { TFunction } from "i18next";
import { toastErrorMessage } from "@/lib/toast-messages";
import type { Customer } from "../../../../types";
import { toggleNewsletter } from "../../api";
import type { CustomerParentFieldsetProps } from "./customerParentFieldset.types";

function setTemporaryError(p: CustomerParentFieldsetProps, message: string) {
  p.setErr(message);
  window.setTimeout(() => p.setErr(null), 3500);
}

function setNewsletterValue(p: CustomerParentFieldsetProps, value: boolean) {
  p.setForm((previous: Customer) => ({ ...previous, newsletter: value }));
}

function applyUpdatedCustomer(
  p: CustomerParentFieldsetProps,
  updated: Customer,
  next: boolean,
) {
  p.setForm((previous: Customer) => ({
    ...previous,
    ...updated,
    newsletter: (updated as any)?.newsletter ?? next,
  }));
}

async function saveNewsletter(p: CustomerParentFieldsetProps, next: boolean) {
  return toggleNewsletter(p.form._id!, next, p.form.parent?.email || "");
}

function showUpdateError(
  p: CustomerParentFieldsetProps,
  t: TFunction,
  error: unknown,
) {
  const key =
    "common.admin.customers.customerDialog.errors.newsletterUpdateFailed";
  setTemporaryError(p, toastErrorMessage(t, error, key));
}

export async function changeNewsletter(
  p: CustomerParentFieldsetProps,
  next: boolean,
  t: TFunction,
) {
  p.setErr(null);
  if (p.mode !== "edit" || !p.form._id) return setNewsletterValue(p, next);
  const previous = !!(p.form as any)?.newsletter;
  p.setNewsletterBusy(true);
  try {
    applyUpdatedCustomer(p, await saveNewsletter(p, next), next);
  } catch (error) {
    setNewsletterValue(p, previous);
    showUpdateError(p, t, error);
  } finally {
    p.setNewsletterBusy(false);
  }
}
