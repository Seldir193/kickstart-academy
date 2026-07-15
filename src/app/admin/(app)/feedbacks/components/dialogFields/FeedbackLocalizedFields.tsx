"use client";

import { useTranslation } from "react-i18next";
import type { FeedbackDialogTextFieldsProps } from "./feedbackDialogTextFields.types";

type FieldProps = {
  labelKey: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
};

export function FeedbackQuoteFields(props: FeedbackDialogTextFieldsProps) {
  return <>{localizedFields(props, "quote", FeedbackTextareaField)}</>;
}

export function FeedbackMetaFields(props: FeedbackDialogTextFieldsProps) {
  return <>{localizedFields(props, "meta", FeedbackInputField)}</>;
}

function localizedFields(
  props: FeedbackDialogTextFieldsProps,
  field: "quote" | "meta",
  Component: React.ComponentType<FieldProps>,
) {
  const keys = ["de", "en", "tr"] as const;
  return keys.map((lang) => (
    <Component
      key={lang}
      labelKey={`admin.feedbacks.${field}${capitalize(lang)}`}
      value={props.draft[field][lang]}
      required={field === "quote" && lang === "de"}
      onChange={(value) => props.updateLocalizedText(field, lang, value)}
    />
  ));
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function FeedbackTextareaField(props: FieldProps) {
  const { t } = useTranslation();
  return (
    <div className="field field--full">
      <label className="dialog-label">{t(props.labelKey)}</label>
      <textarea
        className="input"
        rows={3}
        value={props.value}
        required={props.required}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </div>
  );
}

function FeedbackInputField(props: FieldProps) {
  const { t } = useTranslation();
  return (
    <div className="field">
      <label className="dialog-label">{t(props.labelKey)}</label>
      <input
        className="input"
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </div>
  );
}
