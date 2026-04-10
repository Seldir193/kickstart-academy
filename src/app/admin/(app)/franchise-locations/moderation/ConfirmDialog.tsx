"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  open: boolean;
  title: string;
  text: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export default function ConfirmDialog({
  open,
  title,
  text,
  confirmText,
  cancelText,
  danger = false,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useTranslation();

  const confirmLabel =
    confirmText || t("common.admin.franchiseLocations.confirmDialog.confirm");
  const cancelLabel =
    cancelText || t("common.admin.franchiseLocations.confirmDialog.cancel");
  const closeLabel = t("common.admin.franchiseLocations.confirmDialog.close");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setBusy(false);
    setErr(null);
  }, [open]);

  if (!open) return null;

  async function confirm() {
    setErr(null);
    try {
      setBusy(true);
      await onConfirm();
      onClose();
    } catch (e: any) {
      setErr(
        e?.message ||
          t("common.admin.franchiseLocations.confirmDialog.actionFailed"),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="dialog-backdrop fl-confirm"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog fl-confirm__dialog">
        <div className="dialog-head fl-confirm__head">
          <div className="fl-confirm__head-left">
            <div className="dialog-title fl-confirm__title">{title}</div>
          </div>

          <div className="fl-confirm__head-right">
            <div className="dialog-head__actions">
              <button
                type="button"
                className="dialog-close modal__close"
                aria-label={closeLabel}
                onClick={onClose}
                disabled={busy}
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
        </div>

        <div className="dialog-body fl-confirm__body">
          {err ? <div className="error fl-confirm__error">{err}</div> : null}

          <div className="dialog-value fl-confirm__text">{text}</div>
        </div>

        <div className="dialog-footer fl-confirm__footer">
          <button
            type="button"
            className="btn"
            onClick={onClose}
            disabled={busy}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className={danger ? "btn btn--danger" : "btn"}
            onClick={confirm}
            disabled={busy}
          >
            {busy ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
