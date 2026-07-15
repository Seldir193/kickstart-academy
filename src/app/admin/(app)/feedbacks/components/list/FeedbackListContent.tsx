import { useTranslation } from "react-i18next";
import FeedbackPagination from "../FeedbackPagination";
import FeedbackTable from "./FeedbackTable";
import type { FeedbackListProps } from "./feedbackList.types";
import useFeedbackSelection from "./useFeedbackSelection";

export default function FeedbackListContent(props: FeedbackListProps) {
  const { t } = useTranslation();
  const selection = useFeedbackSelection(props.items);
  const hasItems = props.items.length > 0;

  if (props.loading && !hasItems)
    return <div className="card">{t("admin.feedbacks.loading")}</div>;
  if (!props.loading && !hasItems)
    return <div className="card">{t("admin.feedbacks.empty")}</div>;

  return (
    <section className="news-admin__section">
      <FeedbackCounter total={props.total} />
      <FeedbackTable props={props} selection={selection} />
      <FeedbackPagination
        page={props.page}
        totalPages={props.totalPages}
        onPrev={props.onPrev}
        onNext={props.onNext}
      />
    </section>
  );
}

function FeedbackCounter({ total }: { total: number }) {
  return (
    <div className="news-admin__section-head-number">
      <span className="news-admin__section-meta">
        {total ? `(${total})` : ""}
      </span>
    </div>
  );
}
