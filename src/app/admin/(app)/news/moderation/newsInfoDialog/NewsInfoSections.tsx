"use client";

import type { TFunction } from "i18next";
import type { NewsInfoDialogData } from "./newsInfoDialog.types";

type RowProps = { label: string; value: string; multiline?: boolean };
type SectionProps = { title: string; rows: RowProps[] };

function NewsInfoRow({ label, value, multiline = false }: RowProps) {
  const className = multiline ? "news-info__row is-multiline" : "news-info__row";
  return (
    <div className={className}>
      <div className="dialog-label">{label}</div>
      <div className="dialog-value">{value}</div>
    </div>
  );
}

function NewsInfoSection({ title, rows }: SectionProps) {
  return (
    <section className="dialog-section news-info__section">
      <div className="dialog-section__head">
        <div className="dialog-section__title">{title}</div>
      </div>
      <div className="dialog-section__body news-info__list">
        {rows.map(({ label, ...row }) => (
          <NewsInfoRow key={label} label={label} {...row} />
        ))}
      </div>
    </section>
  );
}

function getMetaRows(data: NewsInfoDialogData, t: TFunction): RowProps[] {
  return [
    { label: t("common.admin.news.infoDialog.category"), value: data.category },
    { label: "Slug", value: data.slug },
    { label: t("common.admin.news.infoDialog.tags"), value: data.tags.join(", ") || "—", multiline: true },
  ];
}

function getTimestampRows(data: NewsInfoDialogData, t: TFunction): RowProps[] {
  return [
    { label: t("common.admin.news.infoDialog.submitted"), value: data.submittedAt },
    { label: t("common.admin.news.infoDialog.approved"), value: data.approvedAt },
    { label: t("common.admin.news.infoDialog.liveUpdate"), value: data.liveUpdatedAt },
    { label: t("common.admin.news.infoDialog.providerEdit"), value: data.lastProviderEditAt },
    { label: t("common.admin.news.infoDialog.superEdit"), value: data.lastSuperEditAt },
  ];
}

export default function NewsInfoSections({ data, t }: { data: NewsInfoDialogData; t: TFunction }) {
  return (
    <div className="news-info__grid">
      <NewsInfoSection title={t("common.admin.news.infoDialog.meta")} rows={getMetaRows(data, t)} />
      <NewsInfoSection title={t("common.admin.news.infoDialog.timestamps")} rows={getTimestampRows(data, t)} />
    </div>
  );
}
