"use client";

import { useTranslation } from "react-i18next";
import PendingNewsRow from "./PendingNewsRow";
import { pickFirst } from "./pendingNewsList.helpers";
import type { PendingNewsListProps } from "./pendingNewsList.types";

export default function PendingNewsListContent(props: PendingNewsListProps) {
  const { t, i18n } = useTranslation();
  if (!props.items.length) {
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
        {props.items.map((news) => (
          <PendingNewsRow
            key={pickFirst(news._id, news.slug)}
            news={news}
            loading={props.loading}
            lang={i18n.language}
            t={t}
            onApprove={props.onApprove}
            onOpen={props.onOpen}
            onAskReject={props.onAskReject}
          />
        ))}
      </div>
    </section>
  );
}
