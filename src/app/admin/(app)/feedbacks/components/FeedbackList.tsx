import { useTranslation } from "react-i18next";
import type { Feedback } from "../types";
import FeedbackCard from "./FeedbackCard";
import { getFeedbackId } from "../helpers";

type Props = {
  items: Feedback[];
  busy: boolean;
  onEdit: (item: Feedback) => void;
  onDelete: (item: Feedback) => void;
  onToggle: (item: Feedback) => void;
};

export default function FeedbackList(props: Props) {
  const { t } = useTranslation();
  const { items, busy, onEdit, onDelete, onToggle } = props;

  if (busy && !items.length) {
    return <div className="card">{t("admin.feedbacks.loading")}</div>;
  }

  if (!busy && !items.length) {
    return <div className="card">{t("admin.feedbacks.empty")}</div>;
  }

  return (
    <section className="feedback-admin__list">
      {items.map((item) => (
        <FeedbackCard
          key={getFeedbackId(item)}
          item={item}
          busy={busy}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ))}
    </section>
  );
}