"use client";

import React, { useMemo } from "react";
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

function roleLabel(u: AdminMember) {
  if (u?.isOwner) return "Owner";
  return clean(u?.role).toLowerCase() === "super" ? "Superadmin" : "Provider";
}

function badgeClass(u: AdminMember) {
  if (u?.isOwner) return "is-owner";
  return clean(u?.role).toLowerCase() === "super" ? "is-super" : "is-provider";
}

function titleOf(u: AdminMember) {
  const n = val(u?.fullName);
  return n !== "—" ? n : "Member";
}

export default function MembersInfoDialog({ open, item, onClose }: Props) {
  const data = useMemo(() => {
    if (!item) return null;

    return {
      title: titleOf(item),
      email: val(item.email),
      role: roleLabel(item),
      isOwner: item.isOwner === true,
      avatarUrl: val((item as any)?.avatarUrl),
      id: val((item as any)?.id || (item as any)?._id),
    };
  }, [item]);

  if (!open || !item || !data) return null;

  return (
    <div className="modal fl-info" role="dialog" aria-modal="true">
      <div className="modal__overlay" onClick={onClose} />

      <div className="fl-info__panel">
        <div className="card fl-info__card">
          <div className="fl-info__head">
            <div className="fl-info__head-left">
              <div className="fl-info__eyebrow">Member details</div>
              <div className="fl-info__title-row">
                <h2 className="fl-info__title">{data.title}</h2>
                <span className={`fl-info__badge ${badgeClass(item)}`}>
                  {data.role}
                </span>
              </div>
              <div className="fl-info__subtitle">Read only</div>
            </div>

            <button
              type="button"
              className="modal__close fl-info__close"
              aria-label="Close"
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

          <div className="fl-info__body">
            <div className="fl-info__grid">
              <section className="fl-info__section">
                <div className="fl-info__section-title">Profile</div>

                <div className="fl-info__list">
                  <div className="fl-info__row">
                    <div className="fl-info__label">Email</div>
                    <div className="fl-info__value">{data.email}</div>
                  </div>

                  <div className="fl-info__row">
                    <div className="fl-info__label">Role</div>
                    <div className="fl-info__value">{data.role}</div>
                  </div>

                  <div className="fl-info__row">
                    <div className="fl-info__label">Owner</div>
                    <div className="fl-info__value">
                      {data.isOwner ? "Yes" : "No"}
                    </div>
                  </div>

                  <div className="fl-info__row">
                    <div className="fl-info__label">ID</div>
                    <div className="fl-info__value fl-info__value--mono">
                      {data.id}
                    </div>
                  </div>
                </div>
              </section>

              <section className="fl-info__section">
                <div className="fl-info__section-title">Avatar</div>

                <div className="fl-info__list">
                  <div className="fl-info__row is-multiline">
                    <div className="fl-info__label">Avatar URL</div>
                    <div className="fl-info__value fl-info__value--break">
                      {data.avatarUrl !== "—" ? (
                        <img
                          src={data.avatarUrl}
                          alt=""
                          className="fl-info__avatar-preview"
                        />
                      ) : (
                        <div className="fl-info__value">—</div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
