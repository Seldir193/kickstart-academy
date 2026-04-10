"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toastErrorMessage } from "@/lib/toast-messages";

type Props = {
  open: boolean;
  title?: string;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  readOnly?: boolean;
  initialReason?: string;
};

function clean(v: unknown) {
  return String(v ?? "").trim();
}

export default function RejectDialog({
  open,
  title,
  onClose,
  onSubmit,
  readOnly,
  initialReason,
}: Props) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heading = useMemo(() => {
    const text = clean(title);
    return text ? t("common.admin.news.rejectDialog.headingWithTitle", { title: text })
      : t("common.admin.news.rejectDialog.heading");
  }, [t,title]);

  useEffect(() => {
    if (!open) return;
    setReason(clean(initialReason));
    setError(null);
    setBusy(false);
  }, [open, initialReason]);

  async function submit() {
    const r = clean(reason);
    if (!r)  return setError(t("common.admin.news.rejectDialog.errorEnterReason"));
    setError(null);
    setBusy(true);
    try {
      await onSubmit(r);
      onClose();
    } catch (error: unknown) {
      setError(
        toastErrorMessage(
          t,
          error,
          "common.admin.news.rejectDialog.errorRejectFailed",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="dialog-backdrop news-reject"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="dialog-backdrop-hit news-reject__backdrop-hit"
       
        aria-label={t("common.close")}
        onClick={() => {
          if (!busy) onClose();
        }}
      />

      <div className="dialog news-reject__dialog">
        <div className="dialog-head news-reject__head">
          <div className="news-reject__head-left">
            <div className="dialog-title news-reject__title">{heading}</div>
            <div className="dialog-subtitle news-reject__subtitle">
              {readOnly
                ? t("common.admin.news.rejectDialog.readOnlySubtitle")
                : t("common.admin.news.rejectDialog.subtitle")}
            </div>
          </div>

          <div className="news-reject__head-right">
            <div className="dialog-head__actions">
              <button
                type="button"
                className="dialog-close modal__close"
                aria-label={t("common.close")}
                onClick={() => {
                  if (!busy) onClose();
                }}
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

        <div className="dialog-body news-reject__body">
          {error ? (
            <div className="error news-reject__error">{error}</div>
          ) : null}

          <div className="field">
            <label className="dialog-label">{t("common.admin.news.rejectDialog.reasonLabel")}</label>
            <textarea
              className="input news-reject__textarea"
              value={reason}
              readOnly={!!readOnly}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("common.admin.news.rejectDialog.reasonPlaceholder")}
            />
          </div>
        </div>

        {!readOnly ? (
          <div className="dialog-footer news-reject__footer">
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => {
                if (!busy) submit();
              }}
              disabled={busy}
            >
              {busy ? t("common.admin.news.rejectDialog.rejecting")
                : t("common.admin.news.rejectDialog.reject")}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
