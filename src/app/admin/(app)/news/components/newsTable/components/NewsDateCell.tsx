import type { NewsWithProvider, Translate } from "../types";
import { fmtDate } from "../lib/format";
import { getNeedsCorrection } from "../lib/status";

export function NewsDateCell({ item, t, lang }: { item: NewsWithProvider; t: Translate; lang: string }) {
  return <div className="news-list__cell news-list__cell--date"><div>{fmtDate(dateValue(item), lang)}</div>{alertLine(item, t)}</div>;
}

function dateValue(item: NewsWithProvider) {
  const record = item as Record<string, unknown>;
  return String(record.date || record.createdAt || "");
}

function alertLine(item: NewsWithProvider, t: Translate) {
  if (!getNeedsCorrection(item)) return null;
  return <div className="news-list__draft-date is-alert">{t("common.admin.news.table.pleaseCorrect")}</div>;
}
