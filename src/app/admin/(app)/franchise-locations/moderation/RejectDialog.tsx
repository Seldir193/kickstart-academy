"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
};

export default function RejectDialog({ open, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setReason("");
    setErr(null);
    setBusy(false);
  }, [open]);

  if (!open) return null;

  async function submit() {
    const r = reason.trim();
    if (!r) {
      setErr(t("common.admin.franchiseLocations.rejectDialog.enterReason"));
      return;
    }
    setErr(null);
    try {
      setBusy(true);
      await onSubmit(r);
      onClose();
    } catch (e: any) {
      setErr(
        e?.message || t("common.admin.franchiseLocations.rejectDialog.failed"),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="dialog-backdrop fl-reject"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog fl-reject__dialog">
        <div className="dialog-head fl-reject__head">
          <div className="fl-reject__head-left">
            <div className="dialog-title fl-reject__title">
              {t("common.admin.franchiseLocations.rejectDialog.title")}
            </div>
            <div className="dialog-subtitle fl-reject__subtitle">
              {t("common.admin.franchiseLocations.rejectDialog.subtitle")}
            </div>
          </div>

          <div className="fl-reject__head-right">
            <div className="dialog-head__actions">
              <button
                type="button"
                className="dialog-close modal__close"
                aria-label={t(
                  "common.admin.franchiseLocations.rejectDialog.close",
                )}
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

        <div className="dialog-body fl-reject__body">
          {err ? <div className="error fl-reject__error">{err}</div> : null}
          <div className="fl-reject__field">
            <label className="dialog-label fl-reject__label">
              {t("common.admin.franchiseLocations.rejectDialog.reason")}
            </label>

            <textarea
              className="input fl-reject__textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t(
                "common.admin.franchiseLocations.rejectDialog.placeholder",
              )}
            />
          </div>
        </div>

        <div className="dialog-footer fl-reject__footer">
          <button
            type="button"
            className="btn btn--danger"
            onClick={submit}
            disabled={busy}
          >
            {busy
              ? t("common.admin.franchiseLocations.rejectDialog.rejecting")
              : t("common.admin.franchiseLocations.rejectDialog.reject")}
          </button>
        </div>
      </div>
    </div>
  );
}
