//src\app\admin\(app)\invoices\hooks\useInvoiceRowActions.ts

"use client";

import { useState } from "react";
import type { InvoiceRow } from "../utils/invoiceList";
import { bankFeeFromRow } from "./invoiceRowActions/rowLogic";
import {
  createInitialActionState,
  type RowActionState,
} from "./invoiceRowActions/state";
import {
  markCollection,
  markPaid,
  openDunningState,
  openReturnedState,
  openRefundState,
  openWithdrawState,
  quickSend,
  scheduleClose,
  setBusy,
  setError,
  setSuccess,
  submitDunning,
  submitReturned,
  submitRefund,
  submitWithdraw,
  voidDunning,
} from "./invoiceRowActions/actions";

export { type RowActionState } from "./invoiceRowActions/state";

export function useInvoiceRowActions(onDone: () => Promise<void>) {
  const [rowBusyId, setRowBusyId] = useState("");
  const [actionState, setActionState] = useState<RowActionState>(
    createInitialActionState(),
  );

  function closeActionDialog() {
    setActionState(createInitialActionState());
  }

  function openReturnedDialog(row: InvoiceRow) {
    setActionState(
      openReturnedState(row, bankFeeFromRow(row), row.returnNote || ""),
    );
  }

  function openDunningDialog(row: InvoiceRow) {
    setActionState(openDunningState(row, bankFeeFromRow(row)));
  }

  async function handleMarkPaid(row: InvoiceRow) {
    if (!row.bookingId) return;
    try {
      setRowBusyId(row.id);
      await markPaid(row);
      await onDone();
    } finally {
      setRowBusyId("");
    }
  }

  async function handleQuickSendDoc(row: InvoiceRow) {
    if (!row.bookingId) return;
    try {
      setRowBusyId(row.id);
      await quickSend(row);
      await onDone();
    } finally {
      setRowBusyId("");
    }
  }

  async function handleVoidDunning(row: InvoiceRow) {
    try {
      setRowBusyId(row.id);
      await voidDunning(row);
      await onDone();
    } finally {
      setRowBusyId("");
    }
  }

  async function handleMarkCollection(row: InvoiceRow) {
    if (!row.bookingId) return;
    try {
      setRowBusyId(row.id);
      await markCollection(row);
      await onDone();
    } finally {
      setRowBusyId("");
    }
  }

  async function submitReturnedDialog() {
    try {
      setBusy(setActionState, "Saving...");
      await submitReturned(actionState);
      setSuccess(setActionState, "Saved");
      await onDone();
      scheduleClose("returned", 700, setActionState);
    } catch (e: any) {
      setError(
        setActionState,
        e?.message || "Mark returned failed",
        "Save failed",
      );
    }
  }

  async function submitDunningDialog() {
    try {
      setBusy(setActionState, "Sending...");
      await submitDunning(actionState);
      setSuccess(setActionState, "Sent");
      await onDone();
      scheduleClose("dunning", 900, setActionState);
    } catch (e: any) {
      setError(
        setActionState,
        e?.message || "Send dunning failed",
        "Send failed",
      );
    }
  }

  async function submitRefundDialog() {
    try {
      setBusy(setActionState, "Processing...");
      await submitRefund(actionState);
      setSuccess(setActionState, "Refunded");
      await onDone();
      scheduleClose("refund", 900, setActionState);
    } catch (e: any) {
      setError(setActionState, e?.message || "Refund failed", "Refund failed");
    }
  }

  async function submitWithdrawDialog() {
    try {
      setBusy(setActionState, "Processing...");
      await submitWithdraw(actionState);
      setSuccess(setActionState, "Withdrawn");
      await onDone();
      scheduleClose("withdraw", 900, setActionState);
    } catch (e: any) {
      setError(
        setActionState,
        e?.message || "Withdraw failed",
        "Withdraw failed",
      );
    }
  }

  function openRefundDialog(row: InvoiceRow) {
    setActionState(openRefundState(row));
  }

  function openWithdrawDialog(row: InvoiceRow) {
    setActionState(openWithdrawState(row));
  }

  return {
    rowBusyId,
    actionState,
    setActionState,
    openReturnedDialog,
    openDunningDialog,
    closeActionDialog,
    handleMarkPaid,
    submitReturnedDialog,
    submitDunningDialog,
    handleQuickSendDoc,
    handleVoidDunning,
    handleMarkCollection,

    openRefundDialog,
    openWithdrawDialog,
    submitRefundDialog,
    submitWithdrawDialog,
  };
}

// "use client";

// import { useState } from "react";
// import type { DunningStage, InvoiceRow } from "../utils/invoiceList";
// import { moneyInputToNumber } from "../utils/dunningUi";

// type RowActionMode = "returned" | "dunning" | null;
// type ActionNoticeTone = "idle" | "success" | "error";

// export type RowActionState = {
//   open: boolean;
//   mode: RowActionMode;
//   row: InvoiceRow | null;
//   loading: boolean;
//   error: string;
//   bankFee: string;
//   returnNote: string;
//   dunningFee: string;
//   processingFee: string;
//   freeText: string;
//   stage: DunningStage;
//   resolvedStage: DunningStage;
//   canSend: boolean;
//   inputsDisabled: boolean;
//   notice: string;
//   noticeTone: ActionNoticeTone;
// };

// function getProviderIdHeader(): Record<string, string> {
//   if (typeof window === "undefined") return {};
//   const v =
//     localStorage.getItem("providerId") ||
//     localStorage.getItem("x-provider-id") ||
//     "";
//   return v ? { "x-provider-id": v } : {};
// }

// async function postJson(url: string, body?: Record<string, unknown>) {
//   const res = await fetch(url, {
//     method: "POST",
//     headers: { "Content-Type": "application/json", ...getProviderIdHeader() },
//     body: JSON.stringify(body || {}),
//   });
//   const data = await res.json().catch(() => ({}));
//   if (!res.ok || data?.ok === false)
//     throw new Error(data?.error || `HTTP ${res.status}`);
//   return data;
// }

// function postInvoiceAction(
//   bookingId: string,
//   path: string,
//   body?: Record<string, unknown>,
// ) {
//   return postJson(`/api/admin/invoices/${bookingId}/${path}`, body);
// }

// function normalizeStage(v: unknown): DunningStage {
//   const s = String(v || "").trim();
//   if (s === "dunning1") return "dunning1";
//   if (s === "dunning2") return "dunning2";
//   if (s === "final") return "final";
//   return "reminder";
// }

// function stageExists(row: InvoiceRow, stage: DunningStage) {
//   const list = row.dunningSentStages;
//   return Array.isArray(list) ? list.includes(stage) : false;
// }

// function nextStageFromRow(row: InvoiceRow) {
//   return normalizeStage(row.nextDunningStage || "reminder");
// }

// function bankFeeFromRow(row: InvoiceRow) {
//   const n = row.returnBankFee;
//   return n != null && Number.isFinite(Number(n)) ? String(n) : "";
// }

// function dunningDocIdFromRow(row: InvoiceRow) {
//   const rawId = String((row as any)?.id || "");
//   return rawId.startsWith("dunning:") ? rawId.slice(8) : "";
// }

// function createInitialActionState(): RowActionState {
//   return {
//     open: false,
//     mode: null,
//     row: null,
//     loading: false,
//     error: "",
//     bankFee: "",
//     returnNote: "",
//     dunningFee: "",
//     processingFee: "",
//     freeText: "",
//     stage: "reminder",
//     resolvedStage: "reminder",
//     canSend: true,
//     inputsDisabled: false,
//     notice: "",
//     noticeTone: "idle",
//   };
// }

// function busyOff(prev: RowActionState): RowActionState {
//   return { ...prev, loading: false };
// }

// export function useInvoiceRowActions(onDone: () => Promise<void>) {
//   const [rowBusyId, setRowBusyId] = useState("");
//   const [actionState, setActionState] = useState<RowActionState>(
//     createInitialActionState(),
//   );

//   function closeActionDialog() {
//     setActionState(createInitialActionState());
//   }

//   function openReturnedDialog(row: InvoiceRow) {
//     setActionState({
//       ...createInitialActionState(),
//       open: true,
//       mode: "returned",
//       row,
//       bankFee: bankFeeFromRow(row),
//       returnNote: row.returnNote || "",
//       notice: "Not sent yet",
//       noticeTone: "idle",
//     });
//   }

//   function openDunningDialog(row: InvoiceRow) {
//     const st = nextStageFromRow(row);
//     const exists = stageExists(row, st);
//     setActionState({
//       ...createInitialActionState(),
//       open: true,
//       mode: "dunning",
//       row,
//       bankFee: bankFeeFromRow(row),
//       stage: st,
//       resolvedStage: st,
//       canSend: !exists,
//       inputsDisabled: exists,
//       notice: exists ? "Already sent" : "Not sent yet",
//       noticeTone: "idle",
//     });
//   }

//   async function handleMarkPaid(row: InvoiceRow) {
//     if (!row.bookingId) return;
//     try {
//       setRowBusyId(row.id);
//       await postInvoiceAction(row.bookingId, "mark-paid");
//       await onDone();
//     } finally {
//       setRowBusyId("");
//     }
//   }

//   async function submitReturnedDialog() {
//     const row = actionState.row;
//     if (!row?.bookingId) return;
//     try {
//       setActionState((p) => ({
//         ...p,
//         loading: true,
//         error: "",
//         notice: "Saving...",
//         noticeTone: "idle",
//       }));
//       await postInvoiceAction(row.bookingId, "mark-returned", {
//         bankFee: moneyInputToNumber(actionState.bankFee),
//         returnNote: actionState.returnNote.trim(),
//       });
//       setActionState((p) => ({
//         ...busyOff(p),
//         notice: "Saved",
//         noticeTone: "success",
//       }));
//       await onDone();
//       setTimeout(
//         () =>
//           setActionState((p) =>
//             !p.open || p.mode !== "returned" ? p : createInitialActionState(),
//           ),
//         700,
//       );
//     } catch (e: any) {
//       setActionState((p) => ({
//         ...busyOff(p),
//         error: e?.message || "Mark returned failed",
//         notice: "Save failed",
//         noticeTone: "error",
//       }));
//     }
//   }

//   async function submitDunningDialog() {
//     const row = actionState.row;
//     if (!row?.bookingId) return;
//     const st = normalizeStage(actionState.stage);
//     if (stageExists(row, st)) return;
//     try {
//       setActionState((p) => ({
//         ...p,
//         loading: true,
//         error: "",
//         notice: "Sending...",
//         noticeTone: "idle",
//       }));
//       await postInvoiceAction(row.bookingId, "send-dunning", {
//         stage: st,
//         returnBankFee: moneyInputToNumber(actionState.bankFee),
//         dunningFee: moneyInputToNumber(actionState.dunningFee),
//         processingFee: moneyInputToNumber(actionState.processingFee),
//         freeText: actionState.freeText.trim(),
//       });
//       setActionState((p) => ({
//         ...busyOff(p),
//         notice: "Sent",
//         noticeTone: "success",
//       }));
//       await onDone();
//       setTimeout(
//         () =>
//           setActionState((p) =>
//             !p.open || p.mode !== "dunning" ? p : createInitialActionState(),
//           ),
//         900,
//       );
//     } catch (e: any) {
//       setActionState((p) => ({
//         ...busyOff(p),
//         error: e?.message || "Send dunning failed",
//         notice: "Send failed",
//         noticeTone: "error",
//       }));
//     }
//   }

//   async function handleQuickSendDoc(row: InvoiceRow) {
//     if (!row.bookingId) return;
//     const t = String((row as any).type || "").toLowerCase();
//     try {
//       setRowBusyId(row.id);
//       if (t === "dunning") {
//         await postInvoiceAction(row.bookingId, "resend-dunning", {
//           stage: normalizeStage(row.lastDunningStage || ""),
//         });
//         await onDone();
//         return;
//       }
//       if (t === "participation" || t === "storno" || t === "cancellation") {
//         await postInvoiceAction(row.bookingId, "send-document-email", {
//           docType: t,
//         });
//         await onDone();
//       }
//     } finally {
//       setRowBusyId("");
//     }
//   }

//   async function handleVoidDunning(row: InvoiceRow) {
//     if ((row as any)?.voidedAt) return;
//     const docId = dunningDocIdFromRow(row);
//     if (!docId) return;
//     try {
//       setRowBusyId(row.id);
//       await postJson(
//         `/api/admin/invoices/dunning-documents/${encodeURIComponent(docId)}/void`,
//         { reason: "Gegenstandslos", sendEmail: true },
//       );
//       await onDone();
//     } finally {
//       setRowBusyId("");
//     }
//   }

//   async function handleMarkCollection(row: InvoiceRow) {
//     if (!row.bookingId) return;
//     if (String((row as any)?.collectionStatus || "none") === "handed_over")
//       return;
//     try {
//       setRowBusyId(row.id);
//       await postInvoiceAction(row.bookingId, "mark-collection", {
//         collectionStatus: "handed_over",
//         note: "",
//       });
//       await onDone();
//     } finally {
//       setRowBusyId("");
//     }
//   }

//   return {
//     rowBusyId,
//     actionState,
//     setActionState,
//     openReturnedDialog,
//     openDunningDialog,
//     closeActionDialog,
//     handleMarkPaid,
//     submitReturnedDialog,
//     submitDunningDialog,
//     handleQuickSendDoc,
//     handleVoidDunning,
//     handleMarkCollection,
//   };
// }
