import { useTranslation } from "react-i18next";
import type { TextFieldProps } from "../types";

export default function FeedbackTextareaField(props: TextFieldProps) {
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
