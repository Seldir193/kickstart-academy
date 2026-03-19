//src\app\admin\(app)\members\moderation\ConfirmActiveDialog.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { AdminMember } from "../api";

type Props = {
  open: boolean;
  item: AdminMember | null;
  nextActive: boolean | null;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  canEdit: boolean;
  lockedReason?: string;
};

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function statusLabel(active: boolean) {
  return active ? "Active" : "Inactive";
}

export default function ConfirmActiveDialog({
  open,
  item,
  nextActive,
  onClose,
  onConfirm,
  canEdit,
  lockedReason,
}: Props) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBusy(false);
  }, [open]);

  const txt = useMemo(() => {
    if (!item || typeof nextActive !== "boolean") return null;
    const name = clean(item.fullName) || clean(item.email) || "Member";
    const from = statusLabel(Boolean((item as any)?.isActive));
    const to = statusLabel(nextActive);
    return { name, from, to };
  }, [item, nextActive]);

  if (!open || !item || typeof nextActive !== "boolean" || !txt) return null;

  const disabled = busy || !canEdit;
  const title = nextActive ? "Reactivate member" : "Deactivate member";

  return (
    <div className="ks-modal-root" role="dialog" aria-modal="true">
      <div className="ks-backdrop" onClick={busy ? undefined : onClose} />

      <div
        className="ks-panel card members-dialog members-dialog--active"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="members-dialog__head">
          <div className="members-dialog__head-left">
            <h2 className="members-dialog__title">{title}</h2>
            <span className="badge">Confirmation</span>
          </div>

          <div className="members-dialog__head-actions">
            <button
              type="button"
              className="modal__close"
              aria-label="Close"
              onClick={onClose}
              aria-disabled={busy}
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

        {lockedReason && !canEdit ? (
          <div className="members-dialog__hint">{lockedReason}</div>
        ) : null}

        <div className="members-dialog__body">
          <div className="members-dialog__meta">
            <div className="members-dialog__meta-row">
              <span className="members-dialog__meta-key">Member</span>
              <span className="members-dialog__meta-val">{txt.name}</span>
            </div>

            <div className="members-dialog__meta-row">
              <span className="members-dialog__meta-key">Status</span>
              <span className="members-dialog__meta-val">
                {txt.from} → <b>{txt.to}</b>
              </span>
            </div>
          </div>

          {!nextActive ? (
            <div className="members-dialog__note">
              Login will be blocked until reactivated.
            </div>
          ) : null}
        </div>

        <div className="members-dialog__footer">
          <button
            type="button"
            className="btn"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>

          <button
            type="button"
            className={"btn" + (nextActive ? "" : " btn--danger")}
            disabled={disabled}
            onClick={async () => {
              if (disabled) return;
              setBusy(true);
              try {
                await onConfirm();
                onClose();
              } finally {
                setBusy(false);
              }
            }}
            title={!canEdit && lockedReason ? lockedReason : undefined}
          >
            {busy ? "Please wait..." : nextActive ? "Reactivate" : "Deactivate"}
          </button>
        </div>
      </div>
    </div>
  );
}
