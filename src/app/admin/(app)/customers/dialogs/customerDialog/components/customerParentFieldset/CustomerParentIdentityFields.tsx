"use client";

import type { TFunction } from "i18next";
import CustomerSalutationField from "./CustomerSalutationField";
import type { CustomerParentFieldsetProps } from "./customerParentFieldset.types";

function TextField({
  label,
  value,
  onChange,
  type,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="lbl">{label}</label>
      <input
        className="input"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export default function CustomerParentIdentityFields({
  p,
  t,
}: {
  p: CustomerParentFieldsetProps;
  t: TFunction;
}) {
  const parent = p.form.parent;
  return (
    <div className="grid grid-cols-4 gap-2">
      <CustomerSalutationField p={p} t={t} />
      <TextField
        label={t("common.admin.customers.customerDialog.firstName")}
        value={parent?.firstName || ""}
        onChange={(value) => p.up("parent.firstName", value)}
      />
      <TextField
        label={t("common.admin.customers.customerDialog.lastName")}
        value={parent?.lastName || ""}
        onChange={(value) => p.up("parent.lastName", value)}
      />
      <TextField
        label={t("common.admin.customers.customerDialog.email")}
        type="email"
        value={parent?.email || ""}
        onChange={(value) => p.up("parent.email", String(value || "").trim())}
      />
    </div>
  );
}
