import type { KeyboardEvent } from "react";
import type { TFunction } from "i18next";
import type { News } from "../../types";
import { toDisplayDate } from "../../news";
import NewsActionCell from "./NewsActionCell";
import { clean, getNewsId, getProviderLabel, getStatusClass, getStatusLabel } from "./newsList.helpers";
import type { NewsWithProvider } from "./newsList.types";

type Props = {
  news: NewsWithProvider;
  checked: boolean;
  isSelectMode: boolean;
  language: string;
  onOpen: (news: News) => void;
  onToggle: (id: string) => void;
  t: TFunction;
};

export default function NewsListRow(props: Props) {
  const { news, checked, isSelectMode, language, onOpen, onToggle, t } = props;
  const id = getNewsId(news);
  const activate = () => handleActivate(id, news, isSelectMode, onOpen, onToggle);
  const onKeyDown = (event: KeyboardEvent) => handleRowKey(event, activate);
  return (
    <li className={getRowClass(checked, isSelectMode)} onClick={activate} onKeyDown={onKeyDown} tabIndex={0} role="button" aria-pressed={isSelectMode ? checked : undefined} aria-label={getAriaLabel(news, isSelectMode, t)}>
      <TitleCell news={news} t={t} />
      <CategoryCell news={news} t={t} />
      <div className="news-list__cell news-list__cell--date">{toDisplayDate(news.date, language)}</div>
      <div className="news-list__cell news-list__cell--status"><span className={`news-list__status ${getStatusClass(news)}`}>{getStatusLabel(news, t)}</span></div>
      <AuthorCell news={news} t={t} />
      <NewsActionCell news={news} hidden={isSelectMode || checked} onOpen={onOpen} t={t} />
    </li>
  );
}

function handleActivate(id: string, news: News, isSelectMode: boolean, onOpen: (news: News) => void, onToggle: (id: string) => void) {
  if (!id) return;
  if (isSelectMode) onToggle(id);
  else onOpen(news);
}

function handleRowKey(event: KeyboardEvent, activate: () => void) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  activate();
}

function getRowClass(checked: boolean, isSelectMode: boolean) {
  return `list__item chip is-fullhover is-interactive news-list__row ${checked ? "is-selected" : ""} ${isSelectMode ? "is-selectmode" : ""}`;
}

function getAriaLabel(news: NewsWithProvider, isSelectMode: boolean, t: TFunction) {
  const key = isSelectMode ? "selectAria" : "openAria";
  const title = clean(news.title) || t("common.admin.news.list.defaultTitle");
  return t(`common.admin.news.list.${key}`, { title });
}

function TitleCell({ news, t }: { news: NewsWithProvider; t: TFunction }) {
  return <div className="news-list__cell news-list__cell--title"><div className="news-list__title">{clean(news.title) || t("common.emptyDash")}</div><div className={`news-list__excerpt ${clean(news.excerpt) ? "" : "is-empty"}`}>{clean(news.excerpt) || t("common.emptyDash")}</div></div>;
}

function CategoryCell({ news, t }: { news: NewsWithProvider; t: TFunction }) {
  return <div className="news-list__cell news-list__cell--cat"><span className="news-list__pill">{clean(news.category) || t("common.admin.news.list.defaultTitle")}</span></div>;
}

function AuthorCell({ news, t }: { news: NewsWithProvider; t: TFunction }) {
  const author = getProviderLabel(news);
  return <div className="news-list__cell news-list__cell--author">{author || <span className="news-list__muted">{t("common.admin.news.list.authorEmpty")}</span>}</div>;
}
