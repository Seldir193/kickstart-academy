//src\app\admin\(app)\invoices\hooks\invoiceRowActions\actions.ts
"use client";

import type { InvoiceRow } from "../../utils/invoiceList";
import { moneyInputToNumber } from "../../utils/dunningUi";
import { postInvoiceAction, postJson } from "./api";
import {
  busyOff,
  createInitialActionState,
  type RowActionState,
} from "./state";
import {
  dunningDocIdFromRow,
  isHandedOver,
  normalizeStage,
  nextStageFromRow,
  stageExists,
} from "./rowLogic";

export function openReturnedState(
  row: InvoiceRow,
  bankFee: string,
  note: string,
): RowActionState {
  return {
    ...createInitialActionState(),
    open: true,
    mode: "returned",
    row,
    bankFee,
    returnNote: note,
    notice: "Not sent yet",
    noticeTone: "idle",
  };
}

export function openDunningState(
  row: InvoiceRow,
  bankFee: string,
): RowActionState {
  const st = nextStageFromRow(row);
  const exists = stageExists(row, st);
  return {
    ...createInitialActionState(),
    open: true,
    mode: "dunning",
    row,
    bankFee,
    stage: st,
    resolvedStage: st,
    canSend: !exists,
    inputsDisabled: exists,
    notice: exists ? "Already sent" : "Not sent yet",
    noticeTone: "idle",
  };
}

export function openRefundState(row: InvoiceRow): RowActionState {
  return {
    ...createInitialActionState(),
    open: true,
    mode: "refund",
    row,
    reason: "",
    notice: "Not executed yet",
    noticeTone: "idle",
  };
}

export function openWithdrawState(row: InvoiceRow): RowActionState {
  return {
    ...createInitialActionState(),
    open: true,
    mode: "withdraw",
    row,
    reason: "",
    notice: "Not executed yet",
    noticeTone: "idle",
  };
}

export async function markPaid(row: InvoiceRow) {
  if (!row.bookingId) return;
  await postInvoiceAction(row.bookingId, "mark-paid");
}

export async function quickSend(row: InvoiceRow) {
  if (!row.bookingId) return;
  const t = String((row as any).type || "").toLowerCase();
  if (t === "dunning") {
    await postInvoiceAction(row.bookingId, "resend-dunning", {
      stage: normalizeStage(row.lastDunningStage || ""),
    });
    return;
  }
  if (t === "participation" || t === "storno" || t === "cancellation") {
    await postInvoiceAction(row.bookingId, "send-document-email", {
      docType: t,
    });
  }
}

export async function voidDunning(row: InvoiceRow) {
  if ((row as any)?.voidedAt) return;
  const docId = dunningDocIdFromRow(row);
  if (!docId) return;
  await postJson(
    `/api/admin/invoices/dunning-documents/${encodeURIComponent(docId)}/void`,
    {
      reason: "Gegenstandslos",
      sendEmail: true,
    },
  );
}

export async function markCollection(row: InvoiceRow) {
  if (!row.bookingId) return;
  if (isHandedOver(row)) return;
  await postInvoiceAction(row.bookingId, "mark-collection", {
    collectionStatus: "handed_over",
    note: "",
  });
}

export async function submitReturned(actionState: RowActionState) {
  const row = actionState.row;
  if (!row?.bookingId) return;
  await postInvoiceAction(row.bookingId, "mark-returned", {
    bankFee: moneyInputToNumber(actionState.bankFee),
    returnNote: actionState.returnNote.trim(),
  });
}

export async function submitDunning(actionState: RowActionState) {
  const row = actionState.row;
  if (!row?.bookingId) return;
  const st = normalizeStage(actionState.stage);
  if (stageExists(row, st)) return;
  await postInvoiceAction(row.bookingId, "send-dunning", {
    stage: st,
    returnBankFee: moneyInputToNumber(actionState.bankFee),
    dunningFee: moneyInputToNumber(actionState.dunningFee),
    processingFee: moneyInputToNumber(actionState.processingFee),
    freeText: actionState.freeText.trim(),
  });
}

export async function submitRefund(actionState: RowActionState) {
  const row = actionState.row;
  if (!row?.bookingId) return;

  await postJson(`/api/bookings/${encodeURIComponent(row.bookingId)}/refund`, {
    reason: actionState.reason.trim(),
  });
}

export async function submitWithdraw(actionState: RowActionState) {
  const row = actionState.row;
  if (!row?.bookingId) return;

  await postJson(
    `/api/bookings/${encodeURIComponent(row.bookingId)}/withdraw`,
    {
      reason: actionState.reason.trim(),
    },
  );
}

export function scheduleClose(
  mode: string,
  ms: number,
  setState: (fn: (p: RowActionState) => RowActionState) => void,
) {
  setTimeout(
    () =>
      setState((p) =>
        !p.open || p.mode !== mode ? p : createInitialActionState(),
      ),
    ms,
  );
}

export function setBusy(
  setState: (fn: (p: RowActionState) => RowActionState) => void,
  notice: string,
) {
  setState((p) => ({
    ...p,
    loading: true,
    error: "",
    notice,
    noticeTone: "idle",
  }));
}

export function setError(
  setState: (fn: (p: RowActionState) => RowActionState) => void,
  msg: string,
  notice: string,
) {
  setState((p) => ({ ...busyOff(p), error: msg, notice, noticeTone: "error" }));
}

export function setSuccess(
  setState: (fn: (p: RowActionState) => RowActionState) => void,
  notice: string,
) {
  setState((p) => ({ ...busyOff(p), notice, noticeTone: "success" }));
}
