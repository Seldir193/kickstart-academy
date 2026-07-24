import type { InputHTMLAttributes } from "react";
import AuthErrorSlot from "./AuthErrorSlot";
import AuthIcon from "./AuthIcon";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  icon: string;
  inputClassName?: string;
  label: string;
};

export default function AuthInputField(props: Props) {
  const {
    error,
    icon,
    inputClassName = "input auth-input",
    label,
    ...inputProps
  } = props;
  return (
    <div className="auth-field">
      <label htmlFor={inputProps.id} className="auth-label">
        {label}
      </label>
      <div className="auth-control">
        <AuthIcon src={icon} />
        <input
          {...inputProps}
          className={inputClassName}
          aria-invalid={Boolean(error)}
        />
      </div>
      <AuthErrorSlot error={error} />
    </div>
  );
}
