import type {
  DunningStage,
  InvoicePaymentStatus,
  InvoiceRow,
} from "./invoiceList";

export type PaymentFilter = "all" | InvoicePaymentStatus;

export type DunningFilter = "all" | "none" | DunningStage;

export function paymentFilterLabel(value: PaymentFilter) {
  if (value === "all") return "All payment";
  if (value === "open") return "Open";
  if (value === "paid") return "Paid";
  return "Returned";
}

export function dunningFilterLabel(value: DunningFilter) {
  if (value === "all") return "All dunning";
  if (value === "none") return "No dunning";
  if (value === "reminder") return "Reminder";
  if (value === "dunning1") return "Dunning 1";
  if (value === "dunning2") return "Dunning 2";
  return "Final";
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
