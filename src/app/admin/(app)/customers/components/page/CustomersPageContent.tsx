"use client";

import { useTranslation } from "react-i18next";
import CustomersDialogMount from "./CustomersDialogMount";
import CustomersErrorCard from "./CustomersErrorCard";
import CustomersPager from "./CustomersPager";
import CustomersTableSection from "./CustomersTableSection";
import CustomersToolbar from "./CustomersToolbar";
import { useCustomersPageState } from "./useCustomersPageState";

export default function CustomersPageContent() {
  const model = useCustomersPageState();
  const { t } = useTranslation();
  return (
    <div className="ks-customers-admin admin-scope p-4 max-w-6xl mx-auto">
      <CustomersToolbar model={model} t={t} />
      <CustomersErrorCard error={model.list.err} t={t} />
      <CustomersTableSection model={model} />
      <CustomersPager model={model} t={t} />
      <CustomersDialogMount model={model} />
    </div>
  );
}
