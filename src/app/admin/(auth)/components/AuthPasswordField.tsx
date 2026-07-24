import type { InputHTMLAttributes } from "react";
import AuthErrorSlot from "./AuthErrorSlot";
import AuthIcon from "./AuthIcon";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label: string;
  onToggle: () => void;
  visible: boolean;
};

export default function AuthPasswordField(props: Props) {
  const { error, label, onToggle, visible, ...inputProps } = props;
  const labelText = visible ? "Hide password" : "Show password";
  const icon = visible ? "/icons/eye-off.svg" : "/icons/eye.svg";
  return (
    <div className="auth-field">
      <label htmlFor={inputProps.id} className="auth-label">
        {label}
      </label>
      <div className="auth-control">
        <AuthIcon src="/icons/lock.svg" />
        <input
          {...inputProps}
          type={visible ? "text" : "password"}
          className="input auth-input is-with-eye"
          aria-invalid={Boolean(error)}
        />
        <button
          type="button"
          className="auth-eye"
          onClick={onToggle}
          aria-label={labelText}
        >
          <img src={icon} alt="" aria-hidden="true" />
        </button>
      </div>
      <AuthErrorSlot error={error} />
    </div>
  );
}
