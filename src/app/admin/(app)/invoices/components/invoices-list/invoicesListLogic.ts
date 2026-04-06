//src\app\admin\(app)\invoices\components\invoices-list\invoicesListLogic.ts
import type { TFunction } from "i18next";
import type { InvoiceRow } from "../../utils/invoiceList";

export function minHeightVars(minHeight?: number) {
  if (!minHeight) return {};
  return { ["--invMinHeight" as any]: `${minHeight}px` };
}

export function loadingVisVars(visible: boolean) {
  return { ["--invLoadingVisibility" as any]: visible ? "visible" : "hidden" };
}

export function isDunningRow(row: InvoiceRow) {
  const t = String((row as any).type || "").toLowerCase();
  return t === "dunning" || t === "contract";
}

export function isPaidRow(row: InvoiceRow) {
  return row.paymentStatus === "paid";
}

export function isHandedOver(row: InvoiceRow) {
  return String((row as any)?.collectionStatus || "none") === "handed_over";
}

export function hasFinalDunning(row: InvoiceRow) {
  if (String(row.lastDunningStage || "") === "final") return true;
  const stages = row.dunningSentStages;
  return Array.isArray(stages) ? stages.includes("final") : false;
}

export function canUseRowActions(row: InvoiceRow) {
  if (isDunningRow(row)) return false;
  return Boolean(row.bookingId);
}

export function actionDisabled(row: InvoiceRow, rowBusyId?: string) {
  if (!canUseRowActions(row)) return true;
  if (isPaidRow(row)) return true;
  return rowBusyId === row.id;
}

export function actionTitle(row: InvoiceRow, base: string, t: TFunction) {
  if (isDunningRow(row))
    return t("common.admin.invoices.logic.archivedDunningDocument");
  if (!row.bookingId)
    return t("common.admin.invoices.logic.noBookingReference");
  if (isPaidRow(row)) return t("common.admin.invoices.logic.alreadyPaid");
  return base;
}

export function quickSendAllowed(row: InvoiceRow) {
  const t = String((row as any).type || "").toLowerCase();
  if (!row.bookingId) return false;
  if (t === "dunning") return Boolean(row.lastDunningStage);
  return t === "participation" || t === "storno" || t === "cancellation";
}

export function quickSendTitle(row: InvoiceRow, t: TFunction) {
  const type = String((row as any).type || "").toLowerCase();
  if (!row.bookingId)
    return t("common.admin.invoices.logic.noBookingReference");
  if (type === "dunning") {
    return row.lastDunningStage
      ? t("common.admin.invoices.logic.resendDunningByEmail")
      : t("common.admin.invoices.logic.noDunningAvailableYet");
  }
  if (type === "participation")
    return t("common.admin.invoices.logic.sendParticipationByEmail");
  if (type === "storno")
    return t("common.admin.invoices.logic.sendCancellationInvoiceByEmail");
  if (type === "cancellation")
    return t("common.admin.invoices.logic.sendContractCancellationByEmail");
  return t("common.admin.invoices.logic.send");
}

export function isVoidedDunningRow(row: InvoiceRow) {
  return Boolean((row as any)?.voidedAt);
}

export function canShowCollection(row: InvoiceRow, rowBusyId?: string) {
  if (isDunningRow(row)) return false;
  if (!row.bookingId) return false;
  if (isPaidRow(row)) return false;
  if (isHandedOver(row)) return false;
  if (!hasFinalDunning(row)) return false;
  return rowBusyId !== row.id;
}

function parseIso(d?: string | null) {
  if (!d) return null;
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function isReturnedRow(row: InvoiceRow) {
  return row.paymentStatus === "returned" || Boolean(row.returnedAt);
}

function creditNoteWasSent(row: InvoiceRow) {
  return Boolean((row as any)?.creditNoteEmailSentAt);
}

export function canRefund(row: InvoiceRow, rowBusyId?: string) {
  if (!row.bookingId) return false;
  if (rowBusyId === row.id) return false;
  if (isDunningRow(row)) return false;

  const sent = Boolean((row as any)?.creditNoteEmailSentAt);

  if (isReturnedRow(row)) return !sent;

  if (row.paymentStatus !== "paid") return false;
  if (sent) return false;

  const mode = String((row as any)?.stripeMode || "").trim();
  if (mode === "subscription") {
    if (!within14Days(row)) return false;
    return Boolean((row as any)?.subscriptionId);
  }

  return Boolean((row as any)?.paymentIntentId);
}

export function within14Days(row: InvoiceRow) {
  const base =
    parseIso(row.contractSignedAt) ||
    parseIso(row.paidAt) ||
    parseIso(row.createdAt);

  if (!base) return false;
  const diff = Date.now() - base.getTime();
  return diff >= 0 && diff <= 14 * 24 * 60 * 60 * 1000;
}

export function canWithdraw(row: InvoiceRow, rowBusyId?: string) {
  if (!row.bookingId) return false;
  if (rowBusyId === row.id) return false;
  if (isDunningRow(row)) return false;
  if (isReturnedRow(row)) return false;
  if (row.paymentStatus !== "paid") return false;
  if (!within14Days(row)) return false;
  return Boolean(row.subscriptionId) && Boolean(row.paymentIntentId);
}

export function refundTitle(row: InvoiceRow, t: TFunction) {
  if (!row.bookingId)
    return t("common.admin.invoices.logic.noBookingReference");
  if (Boolean((row as any)?.creditNoteEmailSentAt))
    return t("common.admin.invoices.logic.creditNoteAlreadySent");
  if (isReturnedRow(row))
    return t("common.admin.invoices.logic.creditNoteNotSentYet");
  if (row.paymentStatus !== "paid")
    return t("common.admin.invoices.logic.notPaid");
  if (!row.paymentIntentId)
    return t("common.admin.invoices.logic.missingPaymentIntent");
  return t("common.admin.invoices.logic.refundStripeCreditNote");
}

export function withdrawTitle(row: InvoiceRow, t: TFunction) {
  if (!row.bookingId)
    return t("common.admin.invoices.logic.noBookingReference");
  if (isReturnedRow(row))
    return t("common.admin.invoices.logic.alreadyRefunded");
  if (row.paymentStatus !== "paid")
    return t("common.admin.invoices.logic.notPaid");
  if (!within14Days(row))
    return t("common.admin.invoices.logic.notWithin14Days");
  if (!row.subscriptionId)
    return t("common.admin.invoices.logic.missingSubscription");
  if (!row.paymentIntentId)
    return t("common.admin.invoices.logic.missingPaymentIntent");
  return t("common.admin.invoices.logic.withdrawRefundCreditNote");
}
