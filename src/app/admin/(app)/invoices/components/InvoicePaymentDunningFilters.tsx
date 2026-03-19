//src\app\admin\(app)\invoices\components\InvoicePaymentDunningFilters.tsx

"use client";

import React from "react";
import InvoiceFilterDropdown from "./InvoiceFilterDropdown";
import type { DunningFilter, PaymentFilter } from "../utils/invoiceFilters";
import {
  dunningFilterLabel,
  paymentFilterLabel,
} from "../utils/invoiceFilters";

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
  return (
    <>
      <InvoiceFilterDropdown
        label="Payment"
        value={payment}
        onChange={onPaymentChange}
        disabled={disabled}
        options={[
          { value: "all", label: paymentFilterLabel("all") },
          { value: "open", label: paymentFilterLabel("open") },
          { value: "paid", label: paymentFilterLabel("paid") },
          { value: "returned", label: paymentFilterLabel("returned") },
        ]}
      />

      <InvoiceFilterDropdown
        label="Dunning"
        value={dunning}
        onChange={onDunningChange}
        disabled={disabled}
        options={[
          { value: "all", label: dunningFilterLabel("all") },
          { value: "none", label: dunningFilterLabel("none") },
          { value: "reminder", label: dunningFilterLabel("reminder") },
          { value: "dunning1", label: dunningFilterLabel("dunning1") },
          { value: "dunning2", label: dunningFilterLabel("dunning2") },
          { value: "final", label: dunningFilterLabel("final") },
        ]}
      />
    </>
  );
}
