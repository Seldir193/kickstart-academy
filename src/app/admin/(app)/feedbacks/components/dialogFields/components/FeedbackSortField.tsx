import { useTranslation } from "react-i18next";
import type { BaseFieldProps } from "../types";

export default function FeedbackSortField({
  draft,
  updateFeedback,
}: BaseFieldProps) {
  const { t } = useTranslation();
  const update = (value: string) =>
    updateFeedback("sortOrder", Number(value || 100));
  return (
    <div className="field">
      <label className="dialog-label">{t("admin.feedbacks.sortOrder")}</label>
      <input
        className="input"
        type="number"
        value={draft.sortOrder}
        onChange={(event) => update(event.target.value)}
      />
    </div>
  );
}
