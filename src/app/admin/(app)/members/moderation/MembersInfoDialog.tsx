"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { AdminMember } from "../api";

type Props = {
  open: boolean;
  item: AdminMember | null;
  onClose: () => void;
};

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function val(v: unknown) {
  const s = clean(v);
  return s ? s : "—";
}

function roleLabel(t: (key: string) => string, u: AdminMember) {
  if (u?.isOwner) return t("common.admin.members.roles.owner");
  return clean(u?.role).toLowerCase() === "super"
    ? t("common.admin.members.roles.superadmin")
    : t("common.admin.members.roles.provider");
}

function badgeClass(u: AdminMember) {
  if (u?.isOwner) return "is-owner";
  return clean(u?.role).toLowerCase() === "super" ? "is-super" : "is-provider";
}

function titleOf(t: (key: string) => string, u: AdminMember) {
  const n = val(u?.fullName);
  return n !== "—" ? n : t("common.admin.members.info.memberFallback");
}

export default function MembersInfoDialog({ open, item, onClose }: Props) {
  const { t } = useTranslation();
  const data = useMemo(() => {
    if (!item) return null;

    return {
      title: titleOf(t, item),
      email: val(item.email),
      role: roleLabel(t, item),
      isOwner: item.isOwner === true,
      avatarUrl: val((item as any)?.avatarUrl),
      id: val((item as any)?.id || (item as any)?._id),
    };
  }, [item, t]);

  if (!open || !item || !data) return null;

  return (
    <div
      className="dialog-backdrop members-info-dialog"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="dialog-backdrop-hit"
        aria-label={t("common.admin.members.info.close")}
        onClick={onClose}
      />

      <div className="dialog members-info-dialog__dialog">
        <div className="dialog-head members-info-dialog__head">
          <div className="members-info-dialog__head-main">
            <div className="members-info-dialog__eyebrow">
              {t("common.admin.members.info.details")}
            </div>

            <div className="members-info-dialog__title-row">
              <h2 className="dialog-title members-info-dialog__title">
                {data.title}
              </h2>
              <span
                className={`members-info-dialog__badge ${badgeClass(item)}`}
              >
                {data.role}
              </span>
            </div>

            <div className="members-info-dialog__subtitle">
              {t("common.admin.members.readOnly.label")}
            </div>
          </div>

          <div className="dialog-head__actions">
            <button
              type="button"
              className="dialog-close"
              aria-label={t("common.admin.members.info.close")}
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

        <div className="dialog-body members-info-dialog__body">
          <div className="members-info-dialog__grid">
            <section className="dialog-section members-info-dialog__section">
              <div className="dialog-section__head">
                <h3 className="dialog-section__title">
                  {t("common.admin.members.info.profile")}
                </h3>
              </div>

              <div className="dialog-section__body">
                <div className="members-info-dialog__list">
                  <div className="members-info-dialog__row">
                    <div className="dialog-label">
                      {t("common.admin.members.table.email")}
                    </div>
                    <div className="dialog-value">{data.email}</div>
                  </div>

                  <div className="members-info-dialog__row">
                    <div className="dialog-label">
                      {t("common.admin.members.table.role")}
                    </div>
                    <div className="dialog-value">{data.role}</div>
                  </div>

                  <div className="members-info-dialog__row">
                    <div className="dialog-label">
                      {t("common.admin.members.info.owner")}
                    </div>
                    <div className="dialog-value">
                      {data.isOwner
                        ? t("common.admin.common.yes")
                        : t("common.admin.common.no")}
                    </div>
                  </div>

                  <div className="members-info-dialog__row">
                    <div className="dialog-label">
                      {t("common.admin.members.info.id")}
                    </div>
                    <div className="dialog-value members-info-dialog__value--mono">
                      {data.id}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="dialog-section members-info-dialog__section">
              <div className="dialog-section__head">
                <h3 className="dialog-section__title">
                  {t("common.admin.members.info.avatar")}
                </h3>
              </div>

              <div className="dialog-section__body">
                <div className="members-info-dialog__list">
                  <div className="members-info-dialog__row members-info-dialog__row--multiline">
                    <div className="dialog-label">
                      {t("common.admin.members.info.avatarUrl")}
                    </div>
                    <div className="dialog-value members-info-dialog__value--break">
                      {data.avatarUrl !== "—" ? (
                        <img
                          src={data.avatarUrl}
                          alt=""
                          className="members-info-dialog__avatar-preview"
                        />
                      ) : (
                        <div className="dialog-value">—</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
