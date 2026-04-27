import { useTranslation } from "react-i18next";
import type { Feedback } from "../types";
import { getFeedbackCategoryKey } from "../helpers";
import FeedbackStatusBadge from "./FeedbackStatusBadge";

type Props = {
  item: Feedback;
  busy: boolean;
  onEdit: (item: Feedback) => void;
  onDelete: (item: Feedback) => void;
  onToggle: (item: Feedback) => void;
};

export default function FeedbackCard(props: Props) {
  const { t } = useTranslation();
  const { item, busy, onEdit, onDelete, onToggle } = props;

  return (
    <article className="card feedback-admin__card">
      <div className="feedback-admin__preview">
        {item.imageUrl ? <img src={item.imageUrl} alt="" /> : null}
      </div>

      <div className="feedback-admin__body">
        <div className="feedback-admin__row">
          <strong>{item.author}</strong>
          <FeedbackStatusBadge active={item.isActive} />
        </div>

        <div className="feedback-admin__meta">
          {t(getFeedbackCategoryKey(item.category))} · {item.sortOrder}
        </div>

        <p className="feedback-admin__quote">{item.quote.de}</p>
        <p className="feedback-admin__meta">{item.meta.de}</p>

        <div className="feedback-admin__actions">
          <button className="btn btn--ghost" type="button" onClick={() => onEdit(item)}>
            {t("admin.feedbacks.editAction")}
          </button>
          <button className="btn btn--ghost" type="button" disabled={busy} onClick={() => onToggle(item)}>
            {item.isActive ? t("admin.feedbacks.inactive") : t("admin.feedbacks.active")}
          </button>
          <button className="btn btn--danger" type="button" disabled={busy} onClick={() => onDelete(item)}>
            {t("admin.feedbacks.delete")}
          </button>
        </div>
      </div>
    </article>
  );
}