//src\app\admin\(app)\news\moderation\NewsInfoDialog.tsx
"use client";

import React, { useMemo } from "react";
import type { News } from "../types";

type Props = {
  open: boolean;
  item: News | null;
  onClose: () => void;
};

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function val(v: unknown) {
  const s = clean(v);
  return s ? s : "—";
}

function fmtDateDE(value?: string | null) {
  const v = clean(value);
  if (!v) return "—";
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function titleOf(n: News) {
  const t = clean((n as any)?.title);
  return t ? t : "News";
}

function isRejected(n: News) {
  return clean((n as any)?.rejectionReason).length > 0;
}

function isSubmitted(n: News) {
  return clean((n as any)?.submittedAt).length > 0;
}

function statusLabel(n: News) {
  if (isRejected(n)) return "Abgelehnt";
  if (isSubmitted(n)) return "Wartet (zu prüfen)";
  return n.published ? "Freigegeben" : "Offline";
}

export default function NewsInfoDialog({ open, item, onClose }: Props) {
  const data = useMemo(() => {
    if (!item) return null;

    const anyN = item as any;

    return {
      title: titleOf(item),
      status: statusLabel(item),
      category: val(anyN?.category),
      slug: val(anyN?.slug),
      tags: Array.isArray(anyN?.tags)
        ? anyN.tags.map(clean).filter(Boolean)
        : [],
      approvedAt: fmtDateDE(anyN?.approvedAt),
      liveUpdatedAt: fmtDateDE(anyN?.liveUpdatedAt),
      submittedAt: fmtDateDE(anyN?.submittedAt),
      lastProviderEditAt: fmtDateDE(anyN?.lastProviderEditAt),
      lastSuperEditAt: fmtDateDE(anyN?.lastSuperEditAt),
    };
  }, [item]);

  if (!open || !item || !data) return null;

  return (
    <div className="modal fl-info" role="dialog" aria-modal="true">
      <div className="modal__overlay" onClick={onClose} />

      <div className="modal__panel modal__panel--md">
        <div className="card fl-info__card">
          <div className="fl-info__head">
            <div className="fl-info__head-left">
              <div className="fl-info__title">{data.title}</div>
              <div className="fl-info__subtitle">Nur Ansicht</div>
            </div>

            <div className="fl-info__head-right">
              <span
                className={`fl-info__badge ${
                  data.status.includes("Abgelehnt")
                    ? "is-rejected"
                    : data.status.includes("Wartet")
                      ? "is-pending"
                      : "is-approved"
                }`}
              >
                {data.status}
              </span>

              <div className="dialog-head__actions">
                <button
                  type="button"
                  className="modal__close"
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
            </div>
          </div>

          <div className="fl-info__body">
            <div className="fl-info__grid">
              <section className="fl-info__section">
                <div className="fl-info__section-title">Meta</div>

                <div className="fl-info__list">
                  <div className="fl-info__row">
                    <div className="fl-info__label">Kategorie</div>
                    <div className="fl-info__value">{data.category}</div>
                  </div>

                  <div className="fl-info__row">
                    <div className="fl-info__label">Slug</div>
                    <div className="fl-info__value">{data.slug}</div>
                  </div>

                  <div className="fl-info__row is-multiline">
                    <div className="fl-info__label">Tags</div>
                    <div className="fl-info__value">
                      {data.tags.length ? data.tags.join(", ") : "—"}
                    </div>
                  </div>
                </div>
              </section>

              <section className="fl-info__section">
                <div className="fl-info__section-title">Zeitstempel</div>

                <div className="fl-info__list">
                  <div className="fl-info__row">
                    <div className="fl-info__label">Submitted</div>
                    <div className="fl-info__value">{data.submittedAt}</div>
                  </div>

                  <div className="fl-info__row">
                    <div className="fl-info__label">Approved</div>
                    <div className="fl-info__value">{data.approvedAt}</div>
                  </div>

                  <div className="fl-info__row">
                    <div className="fl-info__label">Live Update</div>
                    <div className="fl-info__value">{data.liveUpdatedAt}</div>
                  </div>

                  <div className="fl-info__row">
                    <div className="fl-info__label">Provider Edit</div>
                    <div className="fl-info__value">
                      {data.lastProviderEditAt}
                    </div>
                  </div>

                  <div className="fl-info__row">
                    <div className="fl-info__label">Super Edit</div>
                    <div className="fl-info__value">{data.lastSuperEditAt}</div>
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
