"use client";

import React, { useEffect, useMemo, useState } from "react";

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
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heading = useMemo(() => {
    const t = clean(title);
    return t ? `Reject: ${t}` : "Reject item";
  }, [title]);

  useEffect(() => {
    if (!open) return;
    setReason(clean(initialReason));
    setError(null);
    setBusy(false);
  }, [open, initialReason]);

  async function submit() {
    const r = clean(reason);
    if (!r) return setError("Please enter a reason.");
    setError(null);
    setBusy(true);
    try {
      await onSubmit(r);
      onClose();
    } catch (e: any) {
      setError(e?.message || "Reject failed.");
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
        aria-label="Close"
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
                ? "Review the stored rejection reason."
                : "Add a clear reason for rejecting this item."}
            </div>
          </div>

          <div className="news-reject__head-right">
            <div className="dialog-head__actions">
              <button
                type="button"
                className="dialog-close modal__close"
                aria-label="Close"
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
            <label className="dialog-label">Reason *</label>
            <textarea
              className="input news-reject__textarea"
              value={reason}
              readOnly={!!readOnly}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. missing data, implausible content, or duplicate entry"
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
              {busy ? "Rejecting..." : "Reject"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
