import type {
  DunningStage,
  InvoicePaymentStatus,
  InvoiceRow,
} from "./invoiceList";
import type { TFunction } from "i18next";

export type PaymentFilter = "all" | InvoicePaymentStatus;

export type DunningFilter = "all" | "none" | DunningStage;

export function paymentFilterLabel(value: PaymentFilter, t: TFunction) {
  if (value === "open") return t("common.admin.invoices.paymentFilter.open");
  if (value === "paid") return t("common.admin.invoices.paymentFilter.paid");
  if (value === "returned") {
    return t("common.admin.invoices.paymentFilter.returned");
  }
  return t("common.admin.invoices.paymentFilter.all");
}

export function dunningFilterLabel(value: DunningFilter, t: TFunction) {
  if (value === "none") return t("common.admin.invoices.dunningFilter.none");
  if (value === "reminder") {
    return t("common.admin.invoices.dunningFilter.reminder");
  }
  if (value === "dunning1") {
    return t("common.admin.invoices.dunningFilter.dunning1");
  }
  if (value === "dunning2") {
    return t("common.admin.invoices.dunningFilter.dunning2");
  }
  if (value === "final") return t("common.admin.invoices.dunningFilter.final");
  return t("common.admin.invoices.dunningFilter.all");
}

function isCreditNoteType(row: InvoiceRow) {
  const t = String((row as any).type || "").toLowerCase();
  return (
    t === "creditnote" ||
    t === "credit_note" ||
    t === "credit-note" ||
    t === "credit"
  );
}

export function matchesPaymentFilter(row: InvoiceRow, payment: PaymentFilter) {
  if (payment === "all") return true;

  const status = (row.paymentStatus || "open") as InvoicePaymentStatus;
  if (status !== payment) return false;

  if (payment !== "returned") return true;
  return isCreditNoteType(row);
}

export function matchesDunningFilter(row: InvoiceRow, dunning: DunningFilter) {
  if (dunning === "all") return true;

  const stage = row.lastDunningStage || null;
  const count = Number(row.dunningCount || 0);

  if (dunning === "none") return count <= 0 || !stage;
  return stage === dunning;
}

export function filterInvoiceItems(
  items: InvoiceRow[],
  payment: PaymentFilter,
  dunning: DunningFilter,
) {
  return items.filter((row) => {
    if (!matchesPaymentFilter(row, payment)) return false;
    if (!matchesDunningFilter(row, dunning)) return false;
    return true;
  });
}

export function filterInvoiceRows(
  items: InvoiceRow[],
  payment: PaymentFilter,
  dunning: DunningFilter,
) {
  return filterInvoiceItems(items, payment, dunning);
}
