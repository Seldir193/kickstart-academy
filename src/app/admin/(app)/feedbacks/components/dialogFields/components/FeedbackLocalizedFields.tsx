import FeedbackInputField from "./FeedbackInputField";
import FeedbackTextareaField from "./FeedbackTextareaField";
import type { FeedbackDialogFieldsProps } from "../types";

export default function FeedbackLocalizedFields(
  props: FeedbackDialogFieldsProps,
) {
  return (
    <>
      <FeedbackQuoteFields {...props} />
      <FeedbackMetaFields {...props} />
    </>
  );
}

function FeedbackQuoteFields({
  draft,
  updateLocalizedText,
}: FeedbackDialogFieldsProps) {
  const update = (lang: "de" | "en" | "tr") => (value: string) =>
    updateLocalizedText("quote", lang, value);
  return (
    <>
      <FeedbackTextareaField
        labelKey="admin.feedbacks.quoteDe"
        value={draft.quote.de}
        required
        onChange={update("de")}
      />
      <FeedbackTextareaField
        labelKey="admin.feedbacks.quoteEn"
        value={draft.quote.en}
        onChange={update("en")}
      />
      <FeedbackTextareaField
        labelKey="admin.feedbacks.quoteTr"
        value={draft.quote.tr}
        onChange={update("tr")}
      />
    </>
  );
}

function FeedbackMetaFields({
  draft,
  updateLocalizedText,
}: FeedbackDialogFieldsProps) {
  const update = (lang: "de" | "en" | "tr") => (value: string) =>
    updateLocalizedText("meta", lang, value);
  return (
    <>
      <FeedbackInputField
        labelKey="admin.feedbacks.metaDe"
        value={draft.meta.de}
        onChange={update("de")}
      />
      <FeedbackInputField
        labelKey="admin.feedbacks.metaEn"
        value={draft.meta.en}
        onChange={update("en")}
      />
      <FeedbackInputField
        labelKey="admin.feedbacks.metaTr"
        value={draft.meta.tr}
        onChange={update("tr")}
      />
    </>
  );
}
