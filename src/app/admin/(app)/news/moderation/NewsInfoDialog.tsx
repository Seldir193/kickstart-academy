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

function statusClass(status: string) {
  if (status.includes("Abgelehnt")) return "dialog-status--danger";
  if (status.includes("Wartet")) return "dialog-status--warning";
  return "dialog-status--success";
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
    <div className="dialog-backdrop news-info" role="dialog" aria-modal="true">
      <div className="dialog news-info__dialog">
        <div className="dialog-head news-info__head">
          <div className="news-info__head-left">
            <div className="dialog-title news-info__title">{data.title}</div>
            <div className="dialog-subtitle news-info__subtitle">
              Nur Ansicht
            </div>
          </div>

          <div className="news-info__head-right">
            <span className={`dialog-status ${statusClass(data.status)}`}>
              {data.status}
            </span>

            <div className="dialog-head__actions">
              <button
                type="button"
                className="dialog-close modal__close"
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

        <div className="dialog-body news-info__body">
          <div className="news-info__grid">
            <section className="dialog-section news-info__section">
              <div className="dialog-section__head">
                <div className="dialog-section__title">Meta</div>
              </div>

              <div className="dialog-section__body news-info__list">
                <div className="news-info__row">
                  <div className="dialog-label">Kategorie</div>
                  <div className="dialog-value">{data.category}</div>
                </div>

                <div className="news-info__row">
                  <div className="dialog-label">Slug</div>
                  <div className="dialog-value">{data.slug}</div>
                </div>

                <div className="news-info__row is-multiline">
                  <div className="dialog-label">Tags</div>
                  <div className="dialog-value">
                    {data.tags.length ? data.tags.join(", ") : "—"}
                  </div>
                </div>
              </div>
            </section>

            <section className="dialog-section news-info__section">
              <div className="dialog-section__head">
                <div className="dialog-section__title">Zeitstempel</div>
              </div>

              <div className="dialog-section__body news-info__list">
                <div className="news-info__row">
                  <div className="dialog-label">Submitted</div>
                  <div className="dialog-value">{data.submittedAt}</div>
                </div>

                <div className="news-info__row">
                  <div className="dialog-label">Approved</div>
                  <div className="dialog-value">{data.approvedAt}</div>
                </div>

                <div className="news-info__row">
                  <div className="dialog-label">Live Update</div>
                  <div className="dialog-value">{data.liveUpdatedAt}</div>
                </div>

                <div className="news-info__row">
                  <div className="dialog-label">Provider Edit</div>
                  <div className="dialog-value">{data.lastProviderEditAt}</div>
                </div>

                <div className="news-info__row">
                  <div className="dialog-label">Super Edit</div>
                  <div className="dialog-value">{data.lastSuperEditAt}</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="dialog-backdrop-hit news-info__backdrop-hit"
        aria-label="Close"
        onClick={onClose}
      />
    </div>
  );
}
