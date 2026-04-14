"use client";

import React, { useState } from "react";
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

export default function VoucherDialog({
  voucher,
  open,
  busy,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(buildForm(voucher));

  React.useEffect(() => {
    if (!open) return;
    setForm(buildForm(voucher));
  }, [open, voucher]);

  if (!open) return null;

  async function submit() {
    const payload = {
      code: String(form.code || "")
        .trim()
        .toUpperCase(),
      amount: String(form.amount || "").trim(),
      active: form.active,
    };

    console.log("[VoucherDialog submit]", payload);

    if (voucher?._id) await onUpdate(voucher._id, payload);
    else await onCreate(payload);
  }

  async function remove() {
    if (!voucher?._id) return;
    await onDelete(voucher._id);
  }

  return (
    <ModalPortal>
      <div
        className="dialog-backdrop voucher-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={t("common.admin.vouchers.dialog.aria.details")}
      >
        <button
          type="button"
          className="dialog-backdrop-hit"
          aria-label={t("common.admin.vouchers.dialog.close")}
          onClick={onClose}
        />

        <div className="dialog voucher-dialog__dialog">
          <div className="dialog-head voucher-dialog__head">
            <div className="voucher-dialog__head-main">
              <h2 className="dialog-title">
                {voucher
                  ? t("common.admin.vouchers.dialog.editTitle")
                  : t("common.admin.vouchers.dialog.newTitle")}
              </h2>
            </div>

            <div className="dialog-head__actions">
              <button
                type="button"
                className="dialog-close"
                aria-label={t("common.admin.vouchers.dialog.close")}
                onClick={onClose}
              >
                <img
                  src="/icons/close.svg"
                  alt=""
                  aria-hidden="true"
                  className="icon-img"
                />
              </button>
            </div>
          </div>

          <div className="dialog-body voucher-dialog__body">
            <section className="dialog-section voucher-dialog__section">
              <div className="dialog-section__head">
                <h3 className="dialog-section__title">
                  {t("common.admin.vouchers.dialog.sectionTitle")}
                </h3>
              </div>

              <div className="dialog-section__body voucher-dialog__section-body">
                <div className="voucher-dialog__grid">
                  <div className="field voucher-dialog__field voucher-dialog__field--full">
                    <label className="dialog-label">
                      {t("common.admin.vouchers.dialog.code")}
                    </label>
                    <input
                      className="input"
                      value={form.code}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          code: e.target.value.toUpperCase(),
                        }))
                      }
                    />
                  </div>

                  <div className="field voucher-dialog__field voucher-dialog__field--full">
                    <label className="dialog-label">
                      {t("common.admin.vouchers.dialog.amount")}
                    </label>
                    <input
                      className="input"
                      type="number"
                      value={form.amount}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, amount: e.target.value }))
                      }
                    />
                  </div>

                  <div className="voucher-dialog__status voucher-dialog__status--full">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, active: e.target.checked }))
                        }
                      />
                      <span>{t("common.admin.vouchers.dialog.active")}</span>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            <div className="voucher-dialog__actions">
              {voucher ? (
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={remove}
                  disabled={busy}
                >
                  {t("common.admin.vouchers.dialog.delete")}
                </button>
              ) : null}

              <button
                type="button"
                className="btn"
                onClick={submit}
                disabled={busy}
              >
                {t("common.admin.vouchers.dialog.save")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
