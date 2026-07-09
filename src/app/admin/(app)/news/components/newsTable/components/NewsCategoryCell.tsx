import type { NewsWithProvider, Translate } from "../types";
import { clean } from "../lib/ids";
import { getDraftDelta } from "../lib/status";

export function NewsCategoryCell({ item, t }: { item: NewsWithProvider; t: Translate }) {
  const draftCategory = getDraftDelta(item).draftCategory;
  return <div className="news-list__cell news-list__cell--cat"><span className="news-list__pill">{clean(item.category) || t("common.emptyDash")}</span>{draftPill(item, draftCategory, t)}</div>;
}

function draftPill(item: NewsWithProvider, draftCategory: string, t: Translate) {
  if (!draftCategory || draftCategory === clean(item.category)) return null;
  return <span className="news-list__pill news-list__pill--draft">{t("common.admin.news.table.change")}: {draftCategory}</span>;
}
