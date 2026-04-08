"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { News } from "../types";

import { formatDateTime } from "../utils/dateFormat";

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

// function fmtDateDE(value?: string | null) {
//   const v = clean(value);
//   if (!v) return "—";
//   const d = new Date(v);
//   if (isNaN(d.getTime())) return v;
//   return new Intl.DateTimeFormat("de-DE", {
//     dateStyle: "medium",
//     timeStyle: "short",
//   }).format(d);
// }

function titleOf(
  n: News,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  const text = clean((n as any)?.title);
  return text ? text : t("common.admin.news.infoDialog.defaultTitle");
}

function isRejected(n: News) {
  return clean((n as any)?.rejectionReason).length > 0;
}

function isSubmitted(n: News) {
  return clean((n as any)?.submittedAt).length > 0;
}

// function statusLabel(n: News) {
//   if (isRejected(n)) return "Abgelehnt";
//   if (isSubmitted(n)) return "Wartet (zu prüfen)";
//   return n.published ? "Freigegeben" : "Offline";
// }

// function statusClass(status: string) {
//   if (status.includes("Abgelehnt")) return "dialog-status--danger";
//   if (status.includes("Wartet")) return "dialog-status--warning";
//   return "dialog-status--success";
// }

function statusKey(n: News) {
  if (isRejected(n)) return "common.admin.news.infoDialog.statusRejected";
  if (isSubmitted(n)) return "common.admin.news.infoDialog.statusPending";
  return n.published
    ? "common.admin.news.infoDialog.statusPublished"
    : "common.admin.news.infoDialog.statusOffline";
}

function statusClass(status: string) {
  if (status === "common.admin.news.infoDialog.statusRejected") {
    return "dialog-status--danger";
  }

  if (status === "common.admin.news.infoDialog.statusPending") {
    return "dialog-status--warning";
  }

  return "dialog-status--success";
}

export default function NewsInfoDialog({ open, item, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const data = useMemo(() => {
    if (!item) return null;

    const anyN = item as any;

    return {
      title: titleOf(item, t),
      status: statusKey(item),
      category: val(anyN?.category),
      slug: val(anyN?.slug),
      tags: Array.isArray(anyN?.tags)
        ? anyN.tags.map(clean).filter(Boolean)
        : [],
      approvedAt: formatDateTime(anyN?.approvedAt, i18n.language),
      liveUpdatedAt: formatDateTime(anyN?.liveUpdatedAt, i18n.language),
      submittedAt: formatDateTime(anyN?.submittedAt, i18n.language),
      lastProviderEditAt: formatDateTime(
        anyN?.lastProviderEditAt,
        i18n.language,
      ),
      lastSuperEditAt: formatDateTime(anyN?.lastSuperEditAt, i18n.language),
    };
  }, [i18n.language, item, t]);

  if (!open || !item || !data) return null;

  return (
    <div className="dialog-backdrop news-info" role="dialog" aria-modal="true">
      <div className="dialog news-info__dialog">
        <div className="dialog-head news-info__head">
          <div className="news-info__head-left">
            <div className="dialog-title news-info__title">{data.title}</div>
            <div className="dialog-subtitle news-info__subtitle">
              {t("common.admin.news.infoDialog.readOnly")}
            </div>
          </div>

          <div className="news-info__head-right">
            <span className={`dialog-status ${statusClass(data.status)}`}>
              {t(data.status)}
            </span>

            <div className="dialog-head__actions">
              <button
                type="button"
                className="dialog-close modal__close"
                aria-label={t("common.close")}
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
                <div className="dialog-section__title">
                  {" "}
                  {t("common.admin.news.infoDialog.meta")}
                </div>
              </div>

              <div className="dialog-section__body news-info__list">
                <div className="news-info__row">
                  <div className="dialog-label">
                    {t("common.admin.news.infoDialog.category")}
                  </div>
                  <div className="dialog-value">{data.category}</div>
                </div>

                <div className="news-info__row">
                  <div className="dialog-label">Slug</div>
                  <div className="dialog-value">{data.slug}</div>
                </div>

                <div className="news-info__row is-multiline">
                  <div className="dialog-label">
                    {t("common.admin.news.infoDialog.tags")}
                  </div>
                  <div className="dialog-value">
                    {data.tags.length ? data.tags.join(", ") : "—"}
                  </div>
                </div>
              </div>
            </section>

            <section className="dialog-section news-info__section">
              <div className="dialog-section__head">
                <div className="dialog-section__title">
                  {" "}
                  {t("common.admin.news.infoDialog.timestamps")}
                </div>
              </div>

              <div className="dialog-section__body news-info__list">
                <div className="news-info__row">
                  <div className="dialog-label">
                    {t("common.admin.news.infoDialog.submitted")}
                  </div>
                  <div className="dialog-value">{data.submittedAt}</div>
                </div>

                <div className="news-info__row">
                  <div className="dialog-label">
                    {t("common.admin.news.infoDialog.approved")}
                  </div>
                  <div className="dialog-value">{data.approvedAt}</div>
                </div>

                <div className="news-info__row">
                  <div className="dialog-label">
                    {t("common.admin.news.infoDialog.liveUpdate")}
                  </div>
                  <div className="dialog-value">{data.liveUpdatedAt}</div>
                </div>

                <div className="news-info__row">
                  <div className="dialog-label">
                    {t("common.admin.news.infoDialog.providerEdit")}
                  </div>
                  <div className="dialog-value">{data.lastProviderEditAt}</div>
                </div>

                <div className="news-info__row">
                  <div className="dialog-label">
                    {t("common.admin.news.infoDialog.superEdit")}
                  </div>
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
        aria-label={t("common.close")}
        onClick={onClose}
      />
    </div>
  );
}
