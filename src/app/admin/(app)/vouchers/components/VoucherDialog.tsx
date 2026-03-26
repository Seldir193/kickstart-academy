"use client";

import React, { useState } from "react";
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
      <div className="ks-modal-root ks-modal-root--top">
        <div className="ks-backdrop" onClick={onClose} />
        <div
          className="ks-panel ks-panel--md card"
          role="dialog"
          aria-modal="true"
          aria-label="Voucher details"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="dialog-head">
            <div className="dialog-head__left">
              <h2 className="text-xl font-bold">
                {voucher ? "Edit voucher" : "New voucher"}
              </h2>
            </div>

            <div className="dialog-head__actions">
              <button
                type="button"
                className="modal__close"
                aria-label="Close"
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

          <div className="form-columns mb-3">
            <fieldset className="card">
              <legend className="font-bold">Voucher</legend>

              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <label className="lbl">Code</label>
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

                <div>
                  <label className="lbl">Amount</label>
                  <input
                    className="input"
                    type="number"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, amount: e.target.value }))
                    }
                  />
                </div>

                <div className="flex items-end">
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, active: e.target.checked }))
                      }
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>
            </fieldset>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            {voucher ? (
              <button
                type="button"
                className="btn btn--danger"
                onClick={remove}
                disabled={busy}
              >
                Delete
              </button>
            ) : null}

            <button
              type="button"
              className="btn btn--ghost"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn"
              onClick={submit}
              disabled={busy}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
