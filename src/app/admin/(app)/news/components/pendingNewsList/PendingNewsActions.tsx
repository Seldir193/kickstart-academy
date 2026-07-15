import type { News } from "../../types";

type Props = {
  news: News;
  loading?: boolean;
  onApprove: (news: News) => void;
  onOpen: (news: News) => void;
  onAskReject: (news: News) => void;
  t: (key: string) => string;
};

function ActionButton({
  className,
  label,
  loading,
  onClick,
}: {
  className: string;
  label: string;
  loading?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={className}
      aria-disabled={!!loading}
      onClick={() => !loading && onClick()}
      title={label}
    >
      {label}
    </button>
  );
}

export default function PendingNewsActions(props: Props) {
  const { news, loading, onApprove, onOpen, onAskReject, t } = props;
  return (
    <div className="pending-news__actions">
      <ActionButton
        className="btn"
        label={t("common.admin.news.pendingList.open")}
        loading={loading}
        onClick={() => onOpen(news)}
      />
      <ActionButton
        className="btn"
        label={t("common.admin.news.pendingList.approve")}
        loading={loading}
        onClick={() => onApprove(news)}
      />
      <ActionButton
        className="btn btn--danger"
        label={t("common.admin.news.pendingList.reject")}
        loading={loading}
        onClick={() => onAskReject(news)}
      />
    </div>
  );
}
