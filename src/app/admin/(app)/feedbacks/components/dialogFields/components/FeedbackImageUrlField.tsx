import { useTranslation } from "react-i18next";
import type { FeedbackDialogFieldsProps } from "../types";

export default function FeedbackImageUrlField({
  draft,
  updateFeedback,
}: FeedbackDialogFieldsProps) {
  const { t } = useTranslation();
  const update = (value: string) => updateFeedback("imageUrl", value);
  return (
    <div className="field field--full">
      <label className="dialog-label">{t("admin.feedbacks.imageUrl")}</label>
      <input
        className="input"
        value={draft.imageUrl}
        onChange={(event) => update(event.target.value)}
      />
    </div>
  );
}
