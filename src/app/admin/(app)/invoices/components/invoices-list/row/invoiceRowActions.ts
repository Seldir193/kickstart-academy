import type { TFunction } from "i18next";
import {
  actionTitle,
  isDunningRow,
  isHandedOver,
  isVoidedDunningRow,
  quickSendTitle,
  refundTitle,
  withdrawTitle,
} from "../invoicesListLogic";
import type {
  InvoiceRowAction,
  InvoiceRowActionFactoryArgs,
  InvoiceRowState,
} from "./types";

export function invoiceRowActions(args: InvoiceRowActionFactoryArgs): InvoiceRowAction[] {
  return [
    openPdfAction(args),
    markPaidAction(args),
    returnedAction(args),
    refundAction(args),
    withdrawAction(args),
    dunningAction(args),
    quickSendAction(args),
    voidDunningAction(args),
    collectionAction(args),
  ];
}

function openPdfAction({ props, t }: InvoiceRowActionFactoryArgs): InvoiceRowAction {
  return {
    key: "open-pdf",
    icon: "/icons/eye.svg",
    label: t("common.admin.invoices.actions.openPdf"),
    title: t("common.admin.invoices.actions.openPdf"),
    onClick: () => props.openPdf(props.d),
  };
}

function markPaidAction({ props, state, t }: InvoiceRowActionFactoryArgs): InvoiceRowAction {
  return {
    key: "mark-paid",
    icon: "/icons/check_circle.svg",
    label: t("common.admin.invoices.actions.markAsPaid"),
    title: paymentActionTitle(state, t("common.admin.invoices.actions.markAsPaid"), t),
    disabled: state.paymentDisabled,
    onClick: () => props.onMarkPaid?.(state.row),
  };
}

function returnedAction({ props, state, t }: InvoiceRowActionFactoryArgs): InvoiceRowAction {
  return {
    key: "returned",
    icon: "/icons/undo.svg",
    label: t("common.admin.invoices.actions.markReturnedAndAddFee"),
    title: paymentActionTitle(
      state,
      t("common.admin.invoices.actions.markReturnedAndAddFee"),
      t,
    ),
    disabled: state.paymentDisabled,
    onClick: () => props.onOpenReturned?.(state.row),
  };
}

function refundAction({ props, state, t }: InvoiceRowActionFactoryArgs): InvoiceRowAction {
  return {
    key: "refund",
    icon: "/icons/credit_note.svg",
    label: t("common.admin.invoices.actions.refund"),
    title: refundTitle(state.row, t),
    disabled: !state.refundAllowed,
    ariaDisabled: !state.refundAllowed,
    blocked: !state.refundAllowed,
    guard: () => state.refundAllowed,
    onClick: () => props.onOpenRefund?.(state.row),
  };
}

function withdrawAction({ props, state, t }: InvoiceRowActionFactoryArgs): InvoiceRowAction {
  return {
    key: "withdraw",
    icon: "/icons/void.svg",
    label: t("common.admin.invoices.actions.withdraw14Days"),
    title: withdrawTitle(state.row, t),
    disabled: !state.withdrawAllowed,
    ariaDisabled: !state.withdrawAllowed,
    blocked: !state.withdrawAllowed,
    guard: () => state.withdrawAllowed,
    onClick: () => props.onOpenWithdraw?.(state.row),
  };
}

function dunningAction({ props, state, t }: InvoiceRowActionFactoryArgs): InvoiceRowAction {
  return {
    key: "dunning",
    icon: "/icons/mail_send.svg",
    label: t("common.admin.invoices.actions.sendDunningStep"),
    title: state.sendTitle,
    disabled: state.sendDisabled,
    onClick: () => props.onOpenDunning?.(state.row),
  };
}

function quickSendAction({ props, state, t }: InvoiceRowActionFactoryArgs): InvoiceRowAction {
  return {
    key: "quick-send",
    icon: "/icons/resend.svg",
    label: t("common.admin.invoices.actions.sendDocumentByEmail"),
    title: quickSendTitle(state.row, t),
    disabled: state.busy || !state.quickAllowed,
    onClick: () => props.onQuickSendDoc?.(state.row),
  };
}

function voidDunningAction({ props, state, t }: InvoiceRowActionFactoryArgs): InvoiceRowAction {
  return {
    key: "void-dunning",
    icon: "/icons/void.svg",
    label: t("common.admin.invoices.actions.voidDunningObsolete"),
    title: voidDunningTitle(state, t),
    disabled: !isDunningRow(state.row) || state.busy || isVoidedDunningRow(state.row),
    onClick: () => props.onVoidDunning?.(state.row),
  };
}

function collectionAction({ props, state, t }: InvoiceRowActionFactoryArgs): InvoiceRowAction {
  return {
    key: "collection",
    icon: "/icons/collection.svg",
    label: t("common.admin.invoices.actions.handOverToCollection"),
    title: collectionTitle(state, t),
    disabled: state.busy || !state.showCollection,
    hidden: !state.showCollection,
    tabIndex: state.showCollection ? 0 : -1,
    guard: () => state.showCollection,
    onClick: () => props.onMarkCollection?.(state.row),
  };
}

function paymentActionTitle(state: InvoiceRowState, base: string, t: TFunction) {
  if (state.isCreditNote) {
    return t("common.admin.invoices.actions.notAvailableForCreditNotes");
  }
  return actionTitle(state.row, base, t);
}

function voidDunningTitle(state: InvoiceRowState, t: TFunction) {
  if (!isDunningRow(state.row)) return t("common.admin.invoices.actions.dunningOnly");
  if (isVoidedDunningRow(state.row)) {
    return t("common.admin.invoices.actions.alreadyVoided");
  }
  return t("common.admin.invoices.actions.voidDunningPaymentReminder");
}

function collectionTitle(state: InvoiceRowState, t: TFunction) {
  if (isHandedOver(state.row)) {
    return t("common.admin.invoices.actions.alreadyHandedOverToCollection");
  }
  return t("common.admin.invoices.actions.handOverToCollection");
}
