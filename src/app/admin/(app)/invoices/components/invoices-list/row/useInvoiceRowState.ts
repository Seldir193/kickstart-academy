import type { TFunction } from "i18next";
import {
  actionDisabled,
  actionTitle,
  canRefund,
  canShowCollection,
  canWithdraw,
  hasFinalDunning,
  quickSendAllowed,
} from "../invoicesListLogic";
import type { InvoiceRowState, InvoicesListRowProps } from "./types";

export function useInvoiceRowState(props: InvoicesListRowProps, t: TFunction) {
  const row = props.d as InvoiceRowState["row"];
  const state = baseState(props, row);
  return { ...state, sendTitle: sendTitle(state, t) };
}

function baseState(props: InvoicesListRowProps, row: InvoiceRowState["row"]) {
  const flags = rowFlags(props, row);
  const actions = actionFlags(props, row, flags.isCreditNote);
  return { row, ...flags, ...actions, sendTitle: "" };
}

function rowFlags(props: InvoicesListRowProps, row: InvoiceRowState["row"]) {
  const isCreditNote = row.type === "creditnote";
  const busy = props.rowBusyId === row.id;
  const disabled = actionDisabled(row, props.rowBusyId);
  return { isCreditNote, busy, paymentDisabled: disabled || isCreditNote };
}

function actionFlags(
  props: InvoicesListRowProps,
  row: InvoiceRowState["row"],
  isCreditNote: boolean,
) {
  const rowBusyId = props.rowBusyId;
  return {
    quickAllowed: quickSendAllowed(row),
    showCollection: !isCreditNote && canShowCollection(row, rowBusyId),
    refundAllowed: canRefund(row, rowBusyId),
    withdrawAllowed: canWithdraw(row, rowBusyId),
    sendDisabled:
      actionDisabled(row, rowBusyId) || isCreditNote || hasFinalDunning(row),
  };
}

function sendTitle(state: InvoiceRowState, t: TFunction) {
  if (state.isCreditNote) return creditNoteTitle(t);
  if (hasFinalDunning(state.row)) return finalDunningTitle(t);
  return actionTitle(state.row, dunningStepTitle(t), t);
}

function creditNoteTitle(t: TFunction) {
  return t("common.admin.invoices.actions.notAvailableForCreditNotes");
}

function finalDunningTitle(t: TFunction) {
  return t("common.admin.invoices.actions.finalAlreadySent");
}

function dunningStepTitle(t: TFunction) {
  return t("common.admin.invoices.actions.sendDunningStep");
}
