"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toastErrorMessage, toastText } from "@/lib/toast-messages";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void> | void;
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
      setErr(
        toastText(t, "common.admin.coaches.rejectDialog.errors.enterReason"),
      );
      return;
    }

    setErr(null);
    try {
      setBusy(true);
      await onSubmit(r);
      onClose();
    } catch (e: any) {
      setErr(
        toastErrorMessage(
          t,
          e,
          "common.admin.coaches.rejectDialog.errors.rejectFailed",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="dialog-backdrop coach-reject"
      role="dialog"
      aria-modal="true"
    >
      <div className="dialog coach-reject__dialog">
        <div className="dialog-head coach-reject__head">
          <div className="coach-reject__head-left">
            <div className="dialog-title coach-reject__title">
              {t("common.admin.coaches.rejectDialog.title")}
            </div>

            <div className="dialog-subtitle coach-reject__subtitle">
              {t("common.admin.coaches.rejectDialog.subtitle")}
            </div>
          </div>

          <div className="coach-reject__head-right">
            <div className="dialog-head__actions">
              <button
                type="button"
                className="dialog-close modal__close"
                aria-label={t("common.actions.close")}
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

        <div className="dialog-body coach-reject__body">
          {err ? <div className="error coach-reject__error">{err}</div> : null}

          <div className="coach-reject__field">
            <label className="dialog-label coach-reject__label">
              {t("common.admin.coaches.rejectDialog.reasonRequired")}
            </label>

            <textarea
              className="input coach-reject__textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("common.admin.coaches.rejectDialog.placeholder")}
            />
          </div>
        </div>

        <div className="dialog-footer coach-reject__footer">
          <button
            type="button"
            className="btn btn--danger"
            onClick={submit}
            disabled={busy}
          >
            {busy ? "…" : t("common.admin.coaches.rejectDialog.reject")}
          </button>
        </div>
      </div>

      <button
        type="button"
        className="dialog-backdrop-hit coach-reject__backdrop-hit"
        aria-label={t("common.actions.close")}
        onClick={onClose}
        disabled={busy}
      />
    </div>
  );
}
