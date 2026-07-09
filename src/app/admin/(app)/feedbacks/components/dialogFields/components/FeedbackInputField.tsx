import { useTranslation } from "react-i18next";
import type { TextFieldProps } from "../types";

export default function FeedbackInputField(props: TextFieldProps) {
  const { t } = useTranslation();
  return (
    <div className="field">
      <label className="dialog-label">{t(props.labelKey)}</label>
      <input className="input" value={props.value} onChange={(event) => props.onChange(event.target.value)} />
    </div>
  );
}
