"use client";

import React, { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import type { Voucher } from "../types";

type FormState = {
  code: string;
  amount: string;
  active: boolean;
};

type Props = {
  voucher: Voucher | null;
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onCreate: (input: FormState) => Promise<void>;
  onUpdate: (id: string, input: FormState) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

type Translate = ReturnType<typeof useTranslation>["t"];

type View = Props & {
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  t: Translate;
};

function ModalPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

function buildForm(voucher: Voucher | null): FormState {
  return {
    code: String(voucher?.code || ""),
    amount: voucher ? String(voucher.amount) : "",
    active: voucher ? voucher.active : true,
  };
}

export default function VoucherDialog(props: Props) {
  const { voucher, open } = props;
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(buildForm(voucher));

  React.useEffect(() => {
    if (!open) return;
    setForm(buildForm(voucher));
  }, [open, voucher]);

  if (!open) return null;

  return (
    <ModalPortal>
      <VoucherDialogView {...props} form={form} setForm={setForm} t={t} />
    </ModalPortal>
  );
}

function VoucherDialogView(view: View) {
  return (
    <div
      className="dialog-backdrop voucher-dialog"
      role="dialog"
      aria-modal="true"
      aria-label={view.t("common.admin.vouchers.dialog.aria.details")}
    >
      <BackdropHit onClose={view.onClose} t={view.t} />

      <div className="dialog voucher-dialog__dialog">
        <DialogHead voucher={view.voucher} onClose={view.onClose} t={view.t} />
        <DialogBody {...view} />
      </div>
    </div>
  );
}

function BackdropHit({ onClose, t }: { onClose: () => void; t: Translate }) {
  return (
    <button
      type="button"
      className="dialog-backdrop-hit"
      aria-label={t("common.admin.vouchers.dialog.close")}
      onClick={onClose}
    />
  );
}

function DialogHead(props: {
  voucher: Voucher | null;
  onClose: () => void;
  t: Translate;
}) {
  return (
    <div className="dialog-head voucher-dialog__head">
      <div className="voucher-dialog__head-main">
        <h2 className="dialog-title">
          {props.voucher
            ? props.t("common.admin.vouchers.dialog.editTitle")
            : props.t("common.admin.vouchers.dialog.newTitle")}
        </h2>
      </div>

      <div className="dialog-head__actions">
        <CloseButton onClose={props.onClose} t={props.t} />
      </div>
    </div>
  );
}

function CloseButton({ onClose, t }: { onClose: () => void; t: Translate }) {
  return (
    <button
      type="button"
      className="dialog-close"
      aria-label={t("common.admin.vouchers.dialog.close")}
      onClick={onClose}
    >
      <CloseIcon />
    </button>
  );
}

function CloseIcon() {
  return (
    <img
      src="/icons/close.svg"
      alt=""
      aria-hidden="true"
      className="icon-img"
    />
  );
}

function DialogBody(view: View) {
  return (
    <div className="dialog-body voucher-dialog__body">
      <FormSection {...view} />

      <DialogActions {...view} />
    </div>
  );
}

function FormSection(view: View) {
  return (
    <section className="dialog-section voucher-dialog__section">
      <SectionHead t={view.t} />

      <div className="dialog-section__body voucher-dialog__section-body">
        <div className="voucher-dialog__grid">
          <CodeField {...view} />

          <AmountField {...view} />

          <ActiveField {...view} />
        </div>
      </div>
    </section>
  );
}

function SectionHead({ t }: { t: Translate }) {
  return (
    <div className="dialog-section__head">
      <h3 className="dialog-section__title">
        {t("common.admin.vouchers.dialog.sectionTitle")}
      </h3>
    </div>
  );
}

function CodeField({ form, setForm, t }: View) {
  return (
    <div className="field voucher-dialog__field voucher-dialog__field--full">
      <label className="dialog-label">
        {t("common.admin.vouchers.dialog.code")}
      </label>
      <input
        className="input"
        value={form.code}
        onChange={(e) =>
          setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))
        }
      />
    </div>
  );
}

function AmountField({ form, setForm, t }: View) {
  return (
    <div className="field voucher-dialog__field voucher-dialog__field--full">
      <label className="dialog-label">
        {t("common.admin.vouchers.dialog.amount")}
      </label>
      <input
        className="input"
        type="number"
        value={form.amount}
        onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
      />
    </div>
  );
}

function ActiveField({ form, setForm, t }: View) {
  return (
    <div className="voucher-dialog__status voucher-dialog__status--full">
      <label className="checkbox">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
        />
        <span>{t("common.admin.vouchers.dialog.active")}</span>
      </label>
    </div>
  );
}

function DialogActions(view: View) {
  return (
    <div className="voucher-dialog__actions">
      {view.voucher ? <DeleteButton {...view} /> : null}

      <SaveButton {...view} />
    </div>
  );
}

function DeleteButton({ voucher, busy, onDelete, t }: View) {
  return (
    <button
      type="button"
      className="btn btn--danger"
      onClick={() => removeVoucher(voucher, onDelete)}
      disabled={busy}
    >
      {t("common.admin.vouchers.dialog.delete")}
    </button>
  );
}

function SaveButton({ form, voucher, busy, onCreate, onUpdate, t }: View) {
  return (
    <button
      type="button"
      className="btn"
      onClick={() => submitVoucher(form, voucher, onCreate, onUpdate)}
      disabled={busy}
    >
      {t("common.admin.vouchers.dialog.save")}
    </button>
  );
}

function buildPayload(form: FormState): FormState {
  return {
    code: String(form.code || "")
      .trim()
      .toUpperCase(),
    amount: String(form.amount || "").trim(),
    active: form.active,
  };
}

async function submitVoucher(
  form: FormState,
  voucher: Voucher | null,
  onCreate: Props["onCreate"],
  onUpdate: Props["onUpdate"],
) {
  const payload = buildPayload(form);

  console.log("[VoucherDialog submit]", payload);

  if (voucher?._id) await onUpdate(voucher._id, payload);
  else await onCreate(payload);
}

async function removeVoucher(
  voucher: Voucher | null,
  onDelete: Props["onDelete"],
) {
  if (!voucher?._id) return;
  await onDelete(voucher._id);
}
