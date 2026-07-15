import { useTranslation } from "react-i18next";
import type { BaseFieldProps } from "../types";

export default function FeedbackAuthorField({
  draft,
  updateFeedback,
}: BaseFieldProps) {
  const { t } = useTranslation();
  const update = (value: string) => updateFeedback("author", value);
  return (
    <div className="field">
      <label className="dialog-label">{t("admin.feedbacks.author")}</label>
      <input
        className="input"
        value={draft.author}
        onChange={(event) => update(event.target.value)}
        required
      />
    </div>
  );
}
