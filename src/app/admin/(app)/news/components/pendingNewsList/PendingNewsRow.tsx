import type { TFunction } from "i18next";
import PendingNewsActions from "./PendingNewsActions";
import PendingNewsDraft from "./PendingNewsDraft";
import {
  clean,
  hasDraftAnyField,
  isUpdateReview,
  pendingDateLabel,
  providerLabel,
} from "./pendingNewsList.helpers";
import type { PendingNews } from "./pendingNewsList.types";
import type { News } from "../../types";

type Props = {
  news: PendingNews;
  loading?: boolean;
  lang: string;
  t: TFunction;
  onApprove: (news: News) => void;
  onOpen: (news: News) => void;
  onAskReject: (news: News) => void;
};

export default function PendingNewsRow(props: Props) {
  const { news, t } = props;
  const title = clean(news.title);
  const excerpt = clean(news.excerpt);
  const category = clean(news.category);
  const statusKey = isUpdateReview(news)
    ? "common.admin.news.pendingList.statusPleaseReview"
    : "common.admin.news.pendingList.statusAwaitingApproval";
  const dateText = pendingDateLabel(news, props.lang, t);
  return (
    <div className="pending-news__row">
      <div className="pending-news__meta">
        <div className="pending-news__title">
          {title || t("common.emptyDash")}
        </div>
        <div className="pending-news__sub">
          <span className="pending-news__by">
            {t("common.admin.news.pendingList.by")}: {providerLabel(news)}
          </span>
          <span className="pending-news__sep">•</span>
          <span className="pending-news__status">
            {t("common.status")}: <b>{t(statusKey)}</b>
          </span>
        </div>
        {dateText ? <div className="pending-news__sub">{dateText}</div> : null}
        {hasDraftAnyField(news) ? (
          <PendingNewsDraft
            news={news}
            baseTitle={title}
            baseExcerpt={excerpt}
            baseCategory={category}
            t={t}
          />
        ) : null}
      </div>
      <PendingNewsActions
        news={news}
        loading={props.loading}
        onApprove={props.onApprove}
        onOpen={props.onOpen}
        onAskReject={props.onAskReject}
        t={t}
      />
    </div>
  );
}
