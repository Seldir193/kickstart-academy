"use client";

import type { TFunction } from "i18next";
import { changeNewsletter } from "./useNewsletterChange";
import type { CustomerParentFieldsetProps } from "./customerParentFieldset.types";

function PhoneField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="lbl">{label}</label>
      <input
        className="input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function NewsletterMeta({
  p,
  t,
}: {
  p: CustomerParentFieldsetProps;
  t: TFunction;
}) {
  return (
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
  );
}

function NewsletterField({
  p,
  t,
}: {
  p: CustomerParentFieldsetProps;
  t: TFunction;
}) {
  return (
    <div>
      <label className="lbl flex items-center gap-2">
        <input
          type="checkbox"
          checked={!!(p.form as any)?.newsletter}
          disabled={p.newsletterBusy || p.saving}
          onChange={(event) =>
            void changeNewsletter(p, event.target.checked, t)
          }
        />
        {t("common.admin.customers.customerDialog.newsletter")}
        {p.newsletterBusy ? (
          <span className="text-gray-500 text-sm">
            {" "}
            {t("common.admin.customers.customerDialog.saving")}
          </span>
        ) : null}
      </label>
      <NewsletterMeta p={p} t={t} />
    </div>
  );
}

export default function CustomerParentContactFields({
  p,
  t,
}: {
  p: CustomerParentFieldsetProps;
  t: TFunction;
}) {
  const parent = p.form.parent;
  return (
    <div className="grid grid-cols-3 gap-2">
      <PhoneField
        label={t("common.admin.customers.customerDialog.phone")}
        value={parent?.phone || ""}
        onChange={(value) => p.up("parent.phone", value)}
      />
      <PhoneField
        label={t("common.admin.customers.customerDialog.phone2")}
        value={parent?.phone2 || ""}
        onChange={(value) => p.up("parent.phone2", value)}
      />
      <NewsletterField p={p} t={t} />
    </div>
  );
}
