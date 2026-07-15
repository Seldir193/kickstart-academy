"use client";

import { useTranslation } from "react-i18next";
import CustomerParentContactFields from "./customerParentFieldset/CustomerParentContactFields";
import CustomerParentIdentityFields from "./customerParentFieldset/CustomerParentIdentityFields";
import type { CustomerParentFieldsetProps } from "./customerParentFieldset/customerParentFieldset.types";

export default function CustomerParentFieldset(p: CustomerParentFieldsetProps) {
  const { t } = useTranslation();
  return (
    <fieldset className="card">
      <legend className="font-bold">
        {" "}
        {t("common.admin.customers.customerDialog.parent")}
      </legend>
      <CustomerParentIdentityFields p={p} t={t} />
      <CustomerParentContactFields p={p} t={t} />
    </fieldset>
  );
}
