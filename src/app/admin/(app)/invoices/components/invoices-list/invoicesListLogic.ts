//src\app\admin\(app)\invoices\components\invoices-list\invoicesListLogic.ts
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

export function actionTitle(row: InvoiceRow, base: string) {
  if (isDunningRow(row)) return "Archived dunning document";
  if (!row.bookingId) return "No booking reference";
  if (isPaidRow(row)) return "Already paid";
  return base;
}

export function quickSendAllowed(row: InvoiceRow) {
  const t = String((row as any).type || "").toLowerCase();
  if (!row.bookingId) return false;
  if (t === "dunning") return Boolean(row.lastDunningStage);
  return t === "participation" || t === "storno" || t === "cancellation";
}

export function quickSendTitle(row: InvoiceRow) {
  const t = String((row as any).type || "").toLowerCase();
  if (!row.bookingId) return "No booking reference";
  if (t === "dunning")
    return row.lastDunningStage
      ? "Resend by email (dunning/payment reminder)"
      : "No dunning/payment reminder available yet";
  if (t === "participation") return "Send participation by email";
  if (t === "storno") return "Send cancellation invoice by email";
  if (t === "cancellation") return "Send contract cancellation by email";
  return "Send";
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

export function refundTitle(row: InvoiceRow) {
  if (!row.bookingId) return "No booking reference";
  if (Boolean((row as any)?.creditNoteEmailSentAt))
    return "Credit note already sent";
  if (isReturnedRow(row)) return "Credit note not sent yet";
  if (row.paymentStatus !== "paid") return "Not paid";
  if (!row.paymentIntentId) return "Missing payment intent";
  return "Refund (Stripe + credit note)";
}

export function withdrawTitle(row: InvoiceRow) {
  if (!row.bookingId) return "No booking reference";
  if (isReturnedRow(row)) return "Already refunded";
  if (row.paymentStatus !== "paid") return "Not paid";
  if (!within14Days(row)) return "Not within 14 days";
  if (!row.subscriptionId) return "Missing subscription";
  if (!row.paymentIntentId) return "Missing payment intent";
  return "Withdraw (≤14 days) + refund + credit note";
}

// //src\app\admin\(app)\invoices\components\invoices-list\invoicesListLogic.ts
// import type { InvoiceRow } from "../../utils/invoiceList";

// export function minHeightVars(minHeight?: number) {
//   if (!minHeight) return {};
//   return { ["--invMinHeight" as any]: `${minHeight}px` };
// }

// export function loadingVisVars(visible: boolean) {
//   return { ["--invLoadingVisibility" as any]: visible ? "visible" : "hidden" };
// }

// export function isDunningRow(row: InvoiceRow) {
//   const t = String((row as any).type || "").toLowerCase();
//   return t === "dunning" || t === "contract";
// }

// export function isPaidRow(row: InvoiceRow) {
//   return row.paymentStatus === "paid";
// }

// export function isHandedOver(row: InvoiceRow) {
//   return String((row as any)?.collectionStatus || "none") === "handed_over";
// }

// export function hasFinalDunning(row: InvoiceRow) {
//   if (String(row.lastDunningStage || "") === "final") return true;
//   const stages = row.dunningSentStages;
//   return Array.isArray(stages) ? stages.includes("final") : false;
// }

// export function canUseRowActions(row: InvoiceRow) {
//   if (isDunningRow(row)) return false;
//   return Boolean(row.bookingId);
// }

// export function actionDisabled(row: InvoiceRow, rowBusyId?: string) {
//   if (!canUseRowActions(row)) return true;
//   if (isPaidRow(row)) return true;
//   return rowBusyId === row.id;
// }

// export function actionTitle(row: InvoiceRow, base: string) {
//   if (isDunningRow(row)) return "Archived dunning document";
//   if (!row.bookingId) return "No booking reference";
//   if (isPaidRow(row)) return "Already paid";
//   return base;
// }

// export function quickSendAllowed(row: InvoiceRow) {
//   const t = String((row as any).type || "").toLowerCase();
//   if (!row.bookingId) return false;
//   if (t === "dunning") return Boolean(row.lastDunningStage);
//   return t === "participation" || t === "storno" || t === "cancellation";
// }

// export function quickSendTitle(row: InvoiceRow) {
//   const t = String((row as any).type || "").toLowerCase();
//   if (!row.bookingId) return "No booking reference";
//   if (t === "dunning")
//     return row.lastDunningStage
//       ? "Erneut senden (Mahnung/Zahlungserinnerung)"
//       : "Noch keine Mahnung/Zahlungserinnerung vorhanden";
//   if (t === "participation") return "Teilnahme per E-Mail senden";
//   if (t === "storno") return "Storno per E-Mail senden";
//   if (t === "cancellation") return "Kündigung per E-Mail senden";
//   return "Senden";
// }

// export function isVoidedDunningRow(row: InvoiceRow) {
//   return Boolean((row as any)?.voidedAt);
// }

// export function canShowCollection(row: InvoiceRow, rowBusyId?: string) {
//   if (isDunningRow(row)) return false;
//   if (!row.bookingId) return false;
//   if (isPaidRow(row)) return false;
//   if (isHandedOver(row)) return false;
//   if (!hasFinalDunning(row)) return false;
//   return rowBusyId !== row.id;
// }

// function parseIso(d?: string | null) {
//   if (!d) return null;
//   const dt = new Date(d);
//   return Number.isNaN(dt.getTime()) ? null : dt;
// }

// export function isReturnedRow(row: InvoiceRow) {
//   return row.paymentStatus === "returned" || Boolean(row.returnedAt);
// }

// function creditNoteWasSent(row: InvoiceRow) {
//   return Boolean((row as any)?.creditNoteEmailSentAt);
// }

// export function canRefund(row: InvoiceRow, rowBusyId?: string) {
//   if (!row.bookingId) return false;
//   if (rowBusyId === row.id) return false;
//   if (isDunningRow(row)) return false;

//   const sent = Boolean((row as any)?.creditNoteEmailSentAt);

//   if (isReturnedRow(row)) return !sent;

//   if (row.paymentStatus !== "paid") return false;
//   if (sent) return false;

//   const mode = String((row as any)?.stripeMode || "").trim();
//   if (mode === "subscription") {
//     if (!within14Days(row)) return false;
//     return Boolean((row as any)?.subscriptionId);
//   }

//   return Boolean((row as any)?.paymentIntentId);
// }

// export function within14Days(row: InvoiceRow) {
//   const base =
//     parseIso(row.contractSignedAt) ||
//     parseIso(row.paidAt) ||
//     parseIso(row.createdAt);

//   if (!base) return false;
//   const diff = Date.now() - base.getTime();
//   return diff >= 0 && diff <= 14 * 24 * 60 * 60 * 1000;
// }

// export function canWithdraw(row: InvoiceRow, rowBusyId?: string) {
//   if (!row.bookingId) return false;
//   if (rowBusyId === row.id) return false;
//   if (isDunningRow(row)) return false;
//   if (isReturnedRow(row)) return false;
//   if (row.paymentStatus !== "paid") return false;
//   if (!within14Days(row)) return false;
//   return Boolean(row.subscriptionId) && Boolean(row.paymentIntentId);
// }

// export function refundTitle(row: InvoiceRow) {
//   if (!row.bookingId) return "No booking reference";
//   if (Boolean((row as any)?.creditNoteEmailSentAt))
//     return "Credit note already sent";
//   if (isReturnedRow(row)) return "Credit note not sent yet";
//   if (row.paymentStatus !== "paid") return "Not paid";
//   if (!row.paymentIntentId) return "Missing payment intent";
//   return "Refund (Stripe + credit note)";
// }
// export function withdrawTitle(row: InvoiceRow) {
//   if (!row.bookingId) return "No booking reference";
//   if (isReturnedRow(row)) return "Already refunded";
//   if (row.paymentStatus !== "paid") return "Not paid";
//   if (!within14Days(row)) return "Not within 14 days";
//   if (!row.subscriptionId) return "Missing subscription";
//   if (!row.paymentIntentId) return "Missing payment intent";
//   return "Withdraw (≤14 days) + refund + credit note";
// }
