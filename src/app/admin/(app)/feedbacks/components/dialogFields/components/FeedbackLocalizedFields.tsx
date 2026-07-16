import FeedbackInputField from "./FeedbackInputField";
import FeedbackTextareaField from "./FeedbackTextareaField";
import type { FeedbackDialogFieldsProps } from "../types";

type Lang = "de" | "en" | "tr";

const QUOTE_FIELDS: { lang: Lang; labelKey: string; required: boolean }[] = [
  { lang: "de", labelKey: "admin.feedbacks.quoteDe", required: true },
  { lang: "en", labelKey: "admin.feedbacks.quoteEn", required: false },
  { lang: "tr", labelKey: "admin.feedbacks.quoteTr", required: false },
];

const META_FIELDS: { lang: Lang; labelKey: string }[] = [
  { lang: "de", labelKey: "admin.feedbacks.metaDe" },
  { lang: "en", labelKey: "admin.feedbacks.metaEn" },
  { lang: "tr", labelKey: "admin.feedbacks.metaTr" },
];

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
  return (
    <>
      {QUOTE_FIELDS.map((field) => (
        <FeedbackTextareaField
          key={field.lang}
          labelKey={field.labelKey}
          value={draft.quote[field.lang]}
          required={field.required}
          onChange={(value) => updateLocalizedText("quote", field.lang, value)}
        />
      ))}
    </>
  );
}

function FeedbackMetaFields({
  draft,
  updateLocalizedText,
}: FeedbackDialogFieldsProps) {
  return (
    <>
      {META_FIELDS.map((field) => (
        <FeedbackInputField
          key={field.lang}
          labelKey={field.labelKey}
          value={draft.meta[field.lang]}
          onChange={(value) => updateLocalizedText("meta", field.lang, value)}
        />
      ))}
    </>
  );
}
