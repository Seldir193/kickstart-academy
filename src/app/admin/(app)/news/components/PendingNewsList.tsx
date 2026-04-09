//src\app\admin\(app)\news\components\PendingNewsList.tsx
"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import type { News } from "../types";
import { formatDateOnly } from "../utils/dateFormat";

type ProviderInfo = { id?: string; fullName?: string; email?: string } | null;

type PendingNews = News & {
  provider?: ProviderInfo;
  providerId?: any;
};

type Props = {
  items: PendingNews[];
  loading?: boolean;
  onApprove: (n: News) => void;
  onReject: (n: News, reason: string) => void;
  onOpen: (n: News) => void;
  onAskReject: (n: News) => void;
};

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function pickFirst(...vals: any[]) {
  for (const v of vals) {
    const s = clean(v);
    if (s) return s;
  }
  return "";
}

// function fmtDateDe(value?: string) {
//   const raw = clean(value);
//   if (!raw) return "";
//   const d = new Date(raw);
//   if (Number.isNaN(d.getTime())) return raw;
//   return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(d);
// }

function fmtDate(value?: string, lang?: string) {
  const raw = clean(value);
  if (!raw) return "";
  return formatDateOnly(raw, lang);
}

function providerLabel(n: any) {
  const p = n?.provider;
  return pickFirst(p?.fullName, p?.email, n?.providerId, "—");
}

function hasDraft(n: any) {
  return n?.hasDraft === true && n?.draft && typeof n.draft === "object";
}

function draftOf(n: any) {
  return hasDraft(n) ? (n.draft as any) : null;
}

function hasDraftAnyField(n: any) {
  const d = draftOf(n);
  if (!d) return false;
  return Object.keys(d).some((k) => clean((d as any)[k]).length > 0);
}

function draftLine(label: string, value: string) {
  const v = clean(value);
  if (!v) return null;
  return (
    <div className="news-list__draft">
      <span className="news-list__draft-label">{label}:</span> {v}
    </div>
  );
}

function isUpdateReview(n: any) {
  return Boolean(clean(n?.approvedAt)) && Boolean(clean(n?.submittedAt));
}

function pendingDate(n: any) {
  if (isUpdateReview(n))
    return pickFirst(n?.draftUpdatedAt, n?.submittedAt, n?.updatedAt);
  return pickFirst(
    (n as any)?.date,
    n?.createdAt,
    n?.submittedAt,
    n?.updatedAt,
  );
}

function pendingDateLabel(
  n: any,
  lang: string,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  const d = fmtDate(pendingDate(n), lang);
  if (!d) return "";
  return isUpdateReview(n)
    ? t("common.admin.news.pendingList.dateOfChange", { date: d })
    : t("common.admin.news.pendingList.date", { date: d });
}

export default function PendingNewsList({
  items,
  loading,
  onApprove,
  onOpen,
  onAskReject,
}: Props) {
  const { t, i18n } = useTranslation();
  if (!items.length) {
    return (
      <section className="card">
        <div className="card__empty">
          {t("common.admin.news.pendingList.empty")}
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="card__body pending-news">
        {items.map((n) => {
          const id = pickFirst((n as any)._id, (n as any)?.slug);
          const d = draftOf(n);

          const draftTitle = clean(d?.title);
          const draftExcerpt = clean(d?.excerpt);
          const draftCategory = clean(d?.category);

          const baseTitle = clean((n as any)?.title);
          const baseExcerpt = clean((n as any)?.excerpt);
          const baseCategory = clean((n as any)?.category);

          const showDraft = hasDraftAnyField(n);
          const statusText = isUpdateReview(n)
            ? t("common.admin.news.pendingList.statusPleaseReview")
            : t("common.admin.news.pendingList.statusAwaitingApproval");
          const dateText = pendingDateLabel(n, i18n.language, t);

          return (
            <div key={id} className="pending-news__row">
              <div className="pending-news__meta">
                <div className="pending-news__title">
                  {baseTitle || t("common.emptyDash")}
                </div>

                <div className="pending-news__sub">
                  <span className="pending-news__by">
                    {t("common.admin.news.pendingList.by")}: {providerLabel(n)}
                  </span>
                  <span className="pending-news__sep">•</span>
                  <span className="pending-news__status">
                    {t("common.status")}: <b>{statusText}</b>
                  </span>
                </div>

                {dateText ? (
                  <div className="pending-news__sub">{dateText}</div>
                ) : null}

                {showDraft ? (
                  <div className="news-list__draft-wrap">
                    {draftTitle && draftTitle !== baseTitle
                      ? draftLine(
                          t("common.admin.news.pendingList.titleChange"),
                          draftTitle,
                        )
                      : null}
                    {draftExcerpt && draftExcerpt !== baseExcerpt
                      ? draftLine(
                          t("common.admin.news.pendingList.leadChange"),
                          draftExcerpt,
                        )
                      : null}
                    {draftCategory && draftCategory !== baseCategory
                      ? draftLine(
                          t("common.admin.news.pendingList.categoryChange"),
                          draftCategory,
                        )
                      : null}
                  </div>
                ) : null}
              </div>

              <div className="pending-news__actions">
                <button
                  type="button"
                  className="btn"
                  aria-disabled={!!loading}
                  onClick={() => {
                    if (!loading) onOpen(n);
                  }}
                  title={t("common.admin.news.pendingList.openEdit")}
                >
                  {t("common.admin.news.pendingList.open")}
                </button>

                <button
                  type="button"
                  className="btn"
                  aria-disabled={!!loading}
                  onClick={() => {
                    if (!loading) onApprove(n);
                  }}
                  title={t("common.admin.news.pendingList.approve")}
                >
                  {t("common.admin.news.pendingList.approve")}
                </button>

                <button
                  type="button"
                  className="btn btn--danger"
                  aria-disabled={!!loading}
                  onClick={() => {
                    if (!loading) onAskReject(n);
                  }}
                  title={t("common.admin.news.pendingList.reject")}
                >
                  {t("common.admin.news.pendingList.reject")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
