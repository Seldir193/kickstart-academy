// src/app/admin/franchise-locations/components/PendingLocationsList.tsx

"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import type { FranchiseLocation } from "../types";
import { buildDraftHint, hasReviewChange } from "./LocationsTableList.hints";
import { formatDateOnly } from "../utils/dateFormat";

type Props = {
  items: FranchiseLocation[];
  loading?: boolean;
  showChangeInfo?: boolean;
  onApprove: (it: FranchiseLocation) => void;
  onReject: (it: FranchiseLocation) => void;
  onOpen: (it: FranchiseLocation) => void;
};

function pickFirst(...vals: any[]) {
  for (const v of vals) {
    const s = String(v ?? "").trim();
    if (s) return s;
  }
  return "";
}

function ownerLabel(it: FranchiseLocation) {
  const full =
    `${it.licenseeFirstName || ""} ${it.licenseeLastName || ""}`.trim();
  return pickFirst(
    full,
    it.ownerName,
    it.ownerEmail,
    it.ownerId,
    (it as any).owner,
    "—",
  );
}

function changeAtRaw(it: FranchiseLocation) {
  const x: any = it as any;
  return pickFirst(
    x.lastProviderEditAt,
    x.submittedAt,
    x.updatedAt,
    x.updated_at,
    x.modifiedAt,
    x.modified_at,
  );
}

// function formatDateDe(raw: string) {
//   const d = new Date(raw);
//   if (Number.isNaN(d.getTime())) return raw;
//   return d.toLocaleDateString("de-DE");
// }

function dateLabel(it: FranchiseLocation, t: (key: string) => string) {
  return hasReviewChange(it)
    ? t("common.admin.franchiseLocations.pending.dateOfChange")
    : t("common.admin.franchiseLocations.pending.date");
}

function pendingStatus(it: FranchiseLocation, t: (key: string) => string) {
  return hasReviewChange(it)
    ? t("common.admin.franchiseLocations.status.pleaseReview")
    : t("common.admin.franchiseLocations.status.awaitingApproval");
}

function hintText(
  it: FranchiseLocation,
  t: (key: string) => string,
  show?: boolean,
) {
  if (!show) return "";
  if (!hasReviewChange(it)) return "";
  return buildDraftHint(it, t);
}

function changeDate(it: FranchiseLocation, lang?: string, show?: boolean) {
  if (!show) return "";
  const raw = changeAtRaw(it);
  return raw ? formatDateOnly(raw, lang) : "";
}

function EmptyState({ t }: { t: (key: string) => string }) {
  return (
    <section className="card">
      <div className="card__empty">
        {t("common.admin.franchiseLocations.pending.empty")}
      </div>
    </section>
  );
}

export default function PendingLocationsList(p: Props) {
  const { t, i18n } = useTranslation();

  if (!p.items.length) return <EmptyState t={t} />;

  return (
    <section className="card">
      <div className="card__body pending-news">
        {p.items.map((it) => {
          const hint = hintText(it, t, p.showChangeInfo);
          const date = changeDate(it, i18n.language, p.showChangeInfo);
          const status = pendingStatus(it, t);

          return (
            <div key={String((it as any).id)} className="pending-news__row">
              <div className="pending-news__meta">
                <div className="pending-news__title">{ownerLabel(it)}</div>
                {hint ? <div className="pending-news__sub">{hint}</div> : null}
                {date ? (
                  <div className="pending-news__sub">
                    <span>{dateLabel(it, t)}</span>
                    <span>{date}</span>
                  </div>
                ) : null}
                <div className="pending-news__sub">
                  <span>
                    {it.country || "—"} • {it.city || "—"}
                  </span>
                  <span>•</span>
                  <span>
                    {t("common.admin.franchiseLocations.pending.status")}:{" "}
                    <b>{status}</b>
                  </span>
                </div>
              </div>

              <div className="pending-news__actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => p.onOpen(it)}
                  disabled={p.loading}
                >
                  {t("common.admin.franchiseLocations.pending.open")}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => p.onApprove(it)}
                  disabled={p.loading}
                >
                  {t("common.admin.franchiseLocations.pending.approve")}
                </button>
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={() => p.onReject(it)}
                  disabled={p.loading}
                >
                  {t("common.admin.franchiseLocations.pending.reject")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
