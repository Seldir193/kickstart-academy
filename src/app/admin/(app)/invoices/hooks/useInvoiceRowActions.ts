//src\app\admin\(app)\invoices\hooks\useInvoiceRowActions.ts

"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toastErrorMessage, toastText } from "@/lib/toast-messages";
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
  const { t } = useTranslation();
  const [rowBusyId, setRowBusyId] = useState("");
  const [actionState, setActionState] = useState<RowActionState>(
    createInitialActionState(),
  );

  function closeActionDialog() {
    setActionState(createInitialActionState());
  }

  function openReturnedDialog(row: InvoiceRow) {
    setActionState(
      openReturnedState(row, bankFeeFromRow(row), row.returnNote || "", t),
    );
  }

  function openDunningDialog(row: InvoiceRow) {
    setActionState(openDunningState(row, bankFeeFromRow(row), t));
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
      await voidDunning(row, t);
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
      setBusy(
        setActionState,
        toastText(t, "common.admin.invoices.status.saving"),
      );
      await submitReturned(actionState);
      setSuccess(
        setActionState,
        toastText(t, "common.admin.invoices.status.saved"),
      );
      await onDone();
      scheduleClose("returned", 700, setActionState);
    } catch (e: any) {
      setError(
        setActionState,
        toastErrorMessage(
          t,
          e,
          "common.admin.invoices.error.markReturnedFailed",
        ),
        toastText(t, "common.admin.invoices.status.saveFailed"),
      );
    }
  }

  async function submitDunningDialog() {
    try {
      setBusy(
        setActionState,
        toastText(t, "common.admin.invoices.status.sending"),
      );
      await submitDunning(actionState);
      setSuccess(
        setActionState,
        toastText(t, "common.admin.invoices.status.sent"),
      );
      await onDone();
      scheduleClose("dunning", 900, setActionState);
    } catch (e: any) {
      setError(
        setActionState,
        toastErrorMessage(
          t,
          e,
          "common.admin.invoices.error.sendDunningFailed",
        ),

        toastText(t, "common.admin.invoices.status.sendFailed"),
      );
    }
  }

  async function submitRefundDialog() {
    try {
      setBusy(
        setActionState,
        toastText(t, "common.admin.invoices.status.processing"),
      );
      await submitRefund(actionState);
      setSuccess(
        setActionState,
        toastText(t, "common.admin.invoices.status.refunded"),
      );
      await onDone();
      scheduleClose("refund", 900, setActionState);
    } catch (e: any) {
      setError(
        setActionState,
        toastErrorMessage(t, e, "common.admin.invoices.error.refundFailed"),
        toastText(t, "common.admin.invoices.status.refundFailed"),
      );
    }
  }

  async function submitWithdrawDialog() {
    try {
      setBusy(
        setActionState,
        toastText(t, "common.admin.invoices.status.processing"),
      );
      await submitWithdraw(actionState);
      setSuccess(
        setActionState,
        toastText(t, "common.admin.invoices.status.withdrawn"),
      );
      await onDone();
      scheduleClose("withdraw", 900, setActionState);
    } catch (e: any) {
      setError(
        setActionState,
        toastErrorMessage(t, e, "common.admin.invoices.error.withdrawFailed"),
        toastText(t, "common.admin.invoices.status.withdrawFailed"),
      );
    }
  }

  function openRefundDialog(row: InvoiceRow) {
    setActionState(openRefundState(row, t));
  }

  function openWithdrawDialog(row: InvoiceRow) {
    setActionState(openWithdrawState(row, t));
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
