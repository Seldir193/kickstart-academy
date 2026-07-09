import type { NewsWithProvider, Translate } from "../types";
import { clean } from "../lib/ids";
import { getDraftDelta } from "../lib/status";
import { NewsDraftLine } from "./NewsDraftLine";

export function NewsTitleCell({ item, t }: { item: NewsWithProvider; t: Translate }) {
  const delta = getDraftDelta(item);
  return <div className="news-list__cell news-list__cell--title"><TitleText item={item} t={t} /><ExcerptText item={item} t={t} />{titleDraft(item, delta.draftTitle, t)}{leadDraft(item, delta.draftExcerpt, t)}</div>;
}

function TitleText({ item, t }: { item: NewsWithProvider; t: Translate }) {
  return <div className="news-list__title">{clean(item.title) || t("common.emptyDash")}</div>;
}

function ExcerptText({ item, t }: { item: NewsWithProvider; t: Translate }) {
  const excerpt = clean(item.excerpt);
  return <div className={`news-list__excerpt ${excerpt ? "" : "is-empty"}`}>{excerpt || t("common.emptyDash")}</div>;
}

function titleDraft(item: NewsWithProvider, draftTitle: string, t: Translate) {
  if (!draftTitle || draftTitle === clean(item.title)) return null;
  return draftWrap(t("common.admin.news.table.titleChange"), draftTitle);
}

function leadDraft(item: NewsWithProvider, draftExcerpt: string, t: Translate) {
  if (!draftExcerpt || draftExcerpt === clean(item.excerpt)) return null;
  return draftWrap(t("common.admin.news.table.leadChange"), draftExcerpt);
}

function draftWrap(label: string, value: string) {
  return <div className="news-list__draft-wrap"><NewsDraftLine label={label} value={value} /></div>;
}
