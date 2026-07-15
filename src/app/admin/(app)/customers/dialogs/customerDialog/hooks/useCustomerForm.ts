"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Customer } from "../../../types";
import { fmtDE } from "../formatters";
import {
  applyCustomerUpdate,
  initCustomerForm,
  makeBlankCustomer,
} from "./customerForm.helpers";
import { useCustomerFormActions } from "./useCustomerFormActions";
import { useCustomerFormDialogs } from "./useCustomerFormDialogs";

export function useCustomerForm(
  mode: "create" | "edit",
  customer?: Customer | null,
) {
  const { t, i18n } = useTranslation();
  const blank = useRef<Customer>(makeBlankCustomer());
  const [form, setForm] = useState(() =>
    initCustomerForm(mode, customer, blank.current),
  );
  const [newsletterBusy, setNewsletterBusy] = useState(false);
  const actions = useCustomerFormActions(form, setForm, t);
  const dialogs = useCustomerFormDialogs();

  useEffect(() => {
    setForm(initCustomerForm(mode, customer, blank.current));
  }, [mode, customer]);

  function up(path: string, value: unknown) {
    setForm((prev) => applyCustomerUpdate(prev, path, value));
  }

  return {
    form,
    setForm,
    ...actions,
    up,
    ...dialogs,
    newsletterBusy,
    setNewsletterBusy,
    fmtDE: (value: unknown) => fmtDE(value, i18n.language),
  };
}
