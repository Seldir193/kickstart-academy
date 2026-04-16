"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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

function statusLabel(t: (key: string) => string, active: boolean) {
  return active
    ? t("common.admin.members.status.active")
    : t("common.admin.members.status.inactive");
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
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBusy(false);
  }, [open]);

  const txt = useMemo(() => {
    if (!item || typeof nextActive !== "boolean") return null;
    const name =
      clean(item.fullName) ||
      clean(item.email) ||
      t("common.admin.members.info.memberFallback");
    const from = statusLabel(t, Boolean((item as any)?.isActive));
    const to = statusLabel(t, nextActive);
    return { name, from, to };
  }, [item, nextActive, t]);

  if (!open || !item || typeof nextActive !== "boolean" || !txt) return null;

  const disabled = busy || !canEdit;
  const title = nextActive
    ? t("common.admin.members.actions.reactivateMember")
    : t("common.admin.members.actions.deactivateMember");

  return (
    <div
      className="dialog-backdrop members-dialog members-dialog--active"
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
            <h2 className="dialog-title members-dialog__title">{title}</h2>
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
                    {t("common.admin.members.table.status")}
                  </span>
                  <span className="dialog-value">
                    {txt.from} → <b>{txt.to}</b>
                  </span>
                </div>
              </div>

              {!nextActive ? (
                <div className="members-dialog__note">
                  {t(
                    "common.admin.members.dialog.loginBlockedUntilReactivated",
                  )}
                </div>
              ) : null}
            </div>
          </section>

          <div className="members-dialog__footer">
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
              {busy
                ? t("common.admin.members.locked.pleaseWait")
                : nextActive
                  ? t("common.admin.members.actions.reactivate")
                  : t("common.admin.members.actions.deactivate")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
