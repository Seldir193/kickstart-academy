"use client";

import React, { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
};

export default function RejectDialog({ open, onClose, onSubmit }: Props) {
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
      setErr("Please enter a reason.");
      return;
    }
    setErr(null);
    try {
      setBusy(true);
      await onSubmit(r);
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Reject failed.");
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
            <div className="dialog-title fl-reject__title">Reject location</div>
            <div className="dialog-subtitle fl-reject__subtitle">
              Please provide a clear reason for the rejection.
            </div>
          </div>

          <div className="fl-reject__head-right">
            <div className="dialog-head__actions">
              <button
                type="button"
                className="dialog-close modal__close"
                aria-label="Close"
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
            <label className="dialog-label fl-reject__label">Reason *</label>

            <textarea
              className="input fl-reject__textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. address incomplete / not plausible / duplicate"
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
            {busy ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
