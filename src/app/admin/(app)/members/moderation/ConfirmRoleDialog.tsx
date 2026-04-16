"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Member } from "../types";

type Props = {
  open: boolean;
  item: Member | null;
  nextRole: "provider" | "super" | null;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  canEdit: boolean;
  lockedReason?: string;
};

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function roleLabel(t: (key: string) => string, role?: string | null) {
  const r = clean(role).toLowerCase();
  return r === "super"
    ? t("common.admin.members.roles.superadmin")
    : t("common.admin.members.roles.provider");
}

export default function ConfirmRoleDialog({
  open,
  item,
  nextRole,
  onClose,
  onConfirm,
  canEdit,
  lockedReason,
}: Props) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBusy(false);
  }, [open]);

  const txt = useMemo(() => {
    if (!item || !nextRole) return null;
    const name =
      clean((item as any)?.fullName) ||
      clean((item as any)?.email) ||
      t("common.admin.members.info.memberFallback");
    const from = roleLabel(t, (item as any)?.role);
    const to = roleLabel(t, nextRole);
    return { name, from, to };
  }, [item, nextRole, t]);

  if (!open || !item || !nextRole || !txt) return null;

  const disabled = busy || !canEdit;

  return (
    <div
      className="dialog-backdrop members-dialog members-dialog--role"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="dialog-backdrop-hit"
        aria-label={t("common.admin.members.info.close")}
        onClick={busy ? undefined : onClose}
      />

      <div className="dialog members-dialog__dialog">
        <div className="dialog-head members-dialog__head">
          <div className="members-dialog__head-main">
            <h2 className="dialog-title members-dialog__title">
              {t("common.admin.members.actions.changeRole")}
            </h2>
            <span className="badge">
              {t("common.admin.members.dialog.confirmation")}
            </span>
          </div>

          <div className="dialog-head__actions">
            <button
              type="button"
              className="dialog-close"
              aria-label={t("common.admin.members.info.close")}
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

        <div className="dialog-body members-dialog__body">
          {lockedReason && !canEdit ? (
            <div className="members-dialog__hint">{lockedReason}</div>
          ) : null}

          <section className="dialog-section members-dialog__section">
            <div className="dialog-section__head">
              <h3 className="dialog-section__title">
                {t("common.admin.members.dialog.details")}
              </h3>
            </div>

            <div className="dialog-section__body">
              <div className="members-dialog__meta">
                <div className="members-dialog__meta-row">
                  <span className="dialog-label">
                    {t("common.admin.members.info.memberFallback")}
                  </span>
                  <span className="dialog-value">{txt.name}</span>
                </div>

                <div className="members-dialog__meta-row">
                  <span className="dialog-label">
                    {t("common.admin.members.table.role")}
                  </span>
                  <span className="dialog-value">
                    {txt.from} → <b>{txt.to}</b>
                  </span>
                </div>
              </div>
            </div>
          </section>

          <div className="members-dialog__footer">
            <button
              type="button"
              className="btn btn--danger"
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
              {busy
                ? t("common.admin.members.locked.pleaseWait")
                : t("common.admin.members.dialog.confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
