"use client";

import { useTranslation } from "react-i18next";
import NewsListHead from "./NewsListHead";
import NewsListRow from "./NewsListRow";
import { getNewsId } from "./newsList.helpers";
import type { NewsListProps } from "./newsList.types";

export default function NewsListContent(props: NewsListProps) {
  const { t, i18n } = useTranslation();
  if (!props.items.length)
    return <EmptyNewsList label={t("common.admin.news.list.empty")} />;
  return (
    <section className="card news-list">
      <div className="news-list__table">
        <NewsListHead t={t} />
        <ul className="list list--bleed">
          {props.items.map((news) => (
            <NewsListRow
              key={getNewsId(news)}
              news={news}
              checked={props.selected.has(getNewsId(news))}
              isSelectMode={props.isSelectMode}
              language={i18n.language}
              onOpen={props.onOpen}
              onToggle={props.onToggle}
              t={t}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function EmptyNewsList({ label }: { label: string }) {
  return (
    <section className="card">
      <div className="card__empty">{label}</div>
    </section>
  );
}
