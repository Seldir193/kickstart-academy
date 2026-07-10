"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import type { RowActionState } from "../../hooks/useInvoiceRowActions";

type Props = {
  state: RowActionState;
  onSubmitReturned: () => void;
  onSubmitDunning: () => void;
  onSubmitRefund: () => void;
  onSubmitWithdraw: () => void;
};

type Translate = (key: string) => string;

function noticeClass(tone?: string) {
  if (tone === "success") return " is-success";
  if (tone === "error") return " is-error";
  return "";
}

function primaryLabel(state: RowActionState, t: Translate) {
  if (state.mode === "returned") return returnedLabel(state, t);
  if (state.mode === "refund") return refundLabel(state, t);
  if (state.mode === "withdraw") return withdrawLabel(state, t);
  return state.loading
    ? t("common.admin.invoices.status.sending")
    : t("common.admin.invoices.actions.send");
}

function returnedLabel(state: RowActionState, t: Translate) {
  return state.loading
    ? t("common.admin.invoices.status.saving")
    : t("common.admin.invoices.dialog.footer.saveReturned");
}

function refundLabel(state: RowActionState, t: Translate) {
  return state.loading
    ? t("common.admin.invoices.status.processing")
    : t("common.admin.invoices.actions.refund");
}

function withdrawLabel(state: RowActionState, t: Translate) {
  return state.loading
    ? t("common.admin.invoices.status.processing")
    : t("common.admin.invoices.actions.withdraw14Days");
}

function isDisabled(state: RowActionState) {
  if (state.loading) return true;
  if (state.mode === "dunning") return !state.canSend;
  return false;
}

function pickSubmitHandler(state: RowActionState, props: Props) {
  if (state.mode === "returned") return props.onSubmitReturned;
  if (state.mode === "refund") return props.onSubmitRefund;
  if (state.mode === "withdraw") return props.onSubmitWithdraw;
  return props.onSubmitDunning;
}

function FooterButton(props: Props & { t: Translate }) {
  return (
    <button
      type="button"
      className="btn"
      onClick={pickSubmitHandler(props.state, props)}
      disabled={isDisabled(props.state)}
    >
      {primaryLabel(props.state, props.t)}
    </button>
  );
}

function FooterNotice({ state }: { state: RowActionState }) {
  if (!state.notice) return null;
  return (
    <span
      className={"ks-inv-dialog__notice" + noticeClass(state.noticeTone)}
      aria-live="polite"
    >
      {state.notice}
    </span>
  );
}

export default function DialogFooter(props: Props) {
  const { t } = useTranslation();

  return (
    <div className="dialog-footer ks-inv-dialog__footer">
      <div className="ks-inv-dialog__footerMain">
        <FooterButton {...props} t={t} />
        <FooterNotice state={props.state} />
      </div>
    </div>
  );
}
