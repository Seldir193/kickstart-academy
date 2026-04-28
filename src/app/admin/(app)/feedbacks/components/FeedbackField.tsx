import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

type FieldProps = {
  label: string;
  children: ReactNode;
};

export function FeedbackField({ label, children }: FieldProps) {
  return (
    <label className="feedback-field">
      <span className="dialog-label">{label}</span>
      {children}
    </label>
  );
}

export function FeedbackInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input" {...props} />;
}

export function FeedbackTextarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return <textarea className="textarea" rows={3} {...props} />;
}