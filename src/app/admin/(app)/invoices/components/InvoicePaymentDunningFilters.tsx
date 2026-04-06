//src\app\admin\(app)\invoices\components\InvoicePaymentDunningFilters.tsx

"use client";

import React from "react";
import InvoiceFilterDropdown from "./InvoiceFilterDropdown";
import type { DunningFilter, PaymentFilter } from "../utils/invoiceFilters";
import {
  dunningFilterLabel,
  paymentFilterLabel,
} from "../utils/invoiceFilters";
import { useTranslation } from "react-i18next";

type Props = {
  payment: PaymentFilter;
  dunning: DunningFilter;
  onPaymentChange: (next: PaymentFilter) => void;
  onDunningChange: (next: DunningFilter) => void;
  disabled?: boolean;
};

export default function InvoicePaymentDunningFilters({
  payment,
  dunning,
  onPaymentChange,
  onDunningChange,
  disabled,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
      <InvoiceFilterDropdown
        label={t("common.admin.invoices.filters.payment")}
        value={payment}
        onChange={onPaymentChange}
        disabled={disabled}
        options={[
          { value: "all", label: paymentFilterLabel("all", t) },
          { value: "open", label: paymentFilterLabel("open", t) },
          { value: "paid", label: paymentFilterLabel("paid", t) },
          { value: "returned", label: paymentFilterLabel("returned", t) },
        ]}
      />

      <InvoiceFilterDropdown
        label={t("common.admin.invoices.filters.dunning")}
        value={dunning}
        onChange={onDunningChange}
        disabled={disabled}
        options={[
          { value: "all", label: dunningFilterLabel("all", t) },
          { value: "none", label: dunningFilterLabel("none", t) },
          { value: "reminder", label: dunningFilterLabel("reminder", t) },
          { value: "dunning1", label: dunningFilterLabel("dunning1", t) },
          { value: "dunning2", label: dunningFilterLabel("dunning2", t) },
          { value: "final", label: dunningFilterLabel("final", t) },
        ]}
      />
    </>
  );
}
