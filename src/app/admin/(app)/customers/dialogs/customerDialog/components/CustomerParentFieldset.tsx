"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { toastErrorMessage } from "@/lib/toast-messages";
import type { Customer } from "../../../types";

import { toggleNewsletter } from "../api";

type Props = {
  form: Customer;
  up: (path: string, value: any) => void;
  mode: "create" | "edit";
  saving: boolean;
  newsletterBusy: boolean;
  setNewsletterBusy: (v: boolean) => void;
  setForm: (v: any) => void;
  setErr: (v: string | null) => void;
  salutationOpen: boolean;
  setSalutationOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  salutationDropdownRef: React.RefObject<HTMLDivElement | null>;
  mk: any;
  statusLabel: (s?: string, t?: (key: string) => string) => string;
  fmtDE: (dt: any) => string;
};

function salutationLabel(value?: string, t?: (key: string) => string) {
  if (value === "Frau")
    return t ? t("common.admin.customers.customerDialog.salutationMs") : "Ms.";
  if (value === "Herr")
    return t ? t("common.admin.customers.customerDialog.salutationMr") : "Mr.";
  return "—";
}

export default function CustomerParentFieldset(p: Props) {
  const { t } = useTranslation();
  const emailValue = p.form.parent?.email || "";

  return (
    <fieldset className="card">
      <legend className="font-bold">
        {" "}
        {t("common.admin.customers.customerDialog.parent")}
      </legend>

      <div className="grid grid-cols-4 gap-2">
        <div>
          <label className="lbl">
            {t("common.admin.customers.customerDialog.salutation")}
          </label>

          <div
            className={
              "ks-selectbox" + (p.salutationOpen ? " ks-selectbox--open" : "")
            }
            ref={p.salutationDropdownRef}
          >
            <button
              type="button"
              className="ks-selectbox__trigger"
              onClick={() => p.setSalutationOpen((o) => !o)}
            >
              <span className="ks-selectbox__label">
                {salutationLabel(p.form.parent?.salutation, t)}
              </span>
              <span className="ks-selectbox__chevron" aria-hidden="true" />
            </button>

            {p.salutationOpen ? (
              <div className="ks-selectbox__panel">
                <button
                  type="button"
                  className={
                    "ks-selectbox__option" +
                    (!p.form.parent?.salutation
                      ? " ks-selectbox__option--active"
                      : "")
                  }
                  onClick={() => {
                    p.up("parent.salutation", "");
                    p.setSalutationOpen(false);
                  }}
                >
                  —
                </button>

                <button
                  type="button"
                  className={
                    "ks-selectbox__option" +
                    (p.form.parent?.salutation === "Frau"
                      ? " ks-selectbox__option--active"
                      : "")
                  }
                  onClick={() => {
                    p.up("parent.salutation", "Frau");
                    p.setSalutationOpen(false);
                  }}
                >
                  {t("common.admin.customers.customerDialog.salutationMs")}
                </button>

                <button
                  type="button"
                  className={
                    "ks-selectbox__option" +
                    (p.form.parent?.salutation === "Herr"
                      ? " ks-selectbox__option--active"
                      : "")
                  }
                  onClick={() => {
                    p.up("parent.salutation", "Herr");
                    p.setSalutationOpen(false);
                  }}
                >
                  {t("common.admin.customers.customerDialog.salutationMr")}
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <label className="lbl">
            {t("common.admin.customers.customerDialog.firstName")}
          </label>
          <input
            className="input"
            value={p.form.parent?.firstName || ""}
            onChange={(e) => p.up("parent.firstName", e.target.value)}
          />
        </div>

        <div>
          <label className="lbl">
            {t("common.admin.customers.customerDialog.lastName")}
          </label>
          <input
            className="input"
            value={p.form.parent?.lastName || ""}
            onChange={(e) => p.up("parent.lastName", e.target.value)}
          />
        </div>

        <div>
          <label className="lbl">
            {t("common.admin.customers.customerDialog.email")}
          </label>
          <input
            className="input"
            type="email"
            value={emailValue}
            onChange={(e) => onEmailChange(p, e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="lbl">
            {t("common.admin.customers.customerDialog.phone")}
          </label>
          <input
            className="input"
            value={p.form.parent?.phone || ""}
            onChange={(e) => p.up("parent.phone", e.target.value)}
          />
        </div>

        <div>
          <label className="lbl">
            {t("common.admin.customers.customerDialog.phone2")}
          </label>
          <input
            className="input"
            value={p.form.parent?.phone2 || ""}
            onChange={(e) => p.up("parent.phone2", e.target.value)}
          />
        </div>

        <div>
          <label className="lbl flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!(p.form as any)?.newsletter}
              disabled={p.newsletterBusy || p.saving}
              onChange={(e) => void onNewsletterChange(p, e.target.checked, t)}
            />
            {t("common.admin.customers.customerDialog.newsletter")}
            {p.newsletterBusy ? (
              <span className="text-gray-500 text-sm">
                {" "}
                {t("common.admin.customers.customerDialog.saving")}
              </span>
            ) : null}
          </label>

          <div className="text-xs text-gray-600 mt-1">
            <div>
              <span className="font-medium">
                {t("common.admin.customers.customerDialog.status")}:
              </span>{" "}
              {p.statusLabel(p.mk.status, t)}
              {p.mk.provider
                ? ` • ${t("common.admin.customers.customerDialog.provider")}: ${p.mk.provider}`
                : ""}
            </div>
            <div>
              {p.mk.consentAt
                ? `${t("common.admin.customers.customerDialog.consent")}: ${p.fmtDE(p.mk.consentAt)} • `
                : ""}
              {p.mk.lastSyncedAt
                ? `${t("common.admin.customers.customerDialog.synced")}: ${p.fmtDE(p.mk.lastSyncedAt)}`
                : ""}
            </div>
          </div>
        </div>
      </div>
    </fieldset>
  );
}

function onEmailChange(p: Props, next: string) {
  const trimmed = String(next || "").trim();
  p.up("parent.email", trimmed);
}

function showOnce(p: Props, msg: string) {
  p.setErr(msg);
  window.setTimeout(() => p.setErr(null), 3500);
}

async function onNewsletterChange(
  p: Props,
  next: boolean,
  t: (key: string) => string,
) {
  p.setErr(null);

  if (p.mode !== "edit" || !p.form._id) {
    p.setForm((prev: Customer) => ({ ...prev, newsletter: next }));
    return;
  }

  const prevValue = !!(p.form as any)?.newsletter;
  const emailToUse = p.form.parent?.email || "";

  p.setNewsletterBusy(true);
  try {
    const updated = await toggleNewsletter(p.form._id, next, emailToUse);

    p.setForm((prev: Customer) => ({
      ...prev,
      ...updated,
      newsletter: (updated as any)?.newsletter ?? next,
    }));
  } catch (err: any) {
    p.setForm((prev: Customer) => ({ ...prev, newsletter: prevValue }));
    showOnce(
      p,
      toastErrorMessage(
        t,
        err,
        "common.admin.customers.customerDialog.errors.newsletterUpdateFailed",
      ),
    );
  } finally {
    p.setNewsletterBusy(false);
  }
}
