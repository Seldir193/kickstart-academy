import type { Dispatch, FormEvent, SetStateAction } from "react";
import AuthFormError from "../../components/AuthFormError";
import AuthInputField from "../../components/AuthInputField";
import AuthPasswordField from "../../components/AuthPasswordField";
import type { LoginErrors, LoginField, LoginValues } from "../lib/types";

type Props = {
  blurField: (field: LoginField) => void;
  errors: LoginErrors;
  formError: string;
  loading: boolean;
  onSubmit: (event: FormEvent) => void;
  setShowPw: Dispatch<SetStateAction<boolean>>;
  showPw: boolean;
  updateField: (field: LoginField, value: string) => void;
  values: LoginValues;
  onCreateAccount: () => void;
};

export default function AdminLoginForm(props: Props) {
  return <section className="admin-auth" aria-busy={props.loading}><div className="auth-card"><h1 className="auth-title">Provider Login</h1><p className="auth-subtitle">Please enter your email and password (internal use only).</p><AuthFormError error={props.formError} /><form className="auth-form" onSubmit={props.onSubmit} noValidate><fieldset disabled={props.loading} className="auth-fieldset"><LoginFields {...props} /><LoginLinks /><LoginActions loading={props.loading} onCreateAccount={props.onCreateAccount} /></fieldset></form></div></section>;
}

function LoginFields(props: Props) {
  return <><AuthInputField id="email" name="email" type="email" icon="/icons/mail.svg" label="E-Mail" required value={props.values.email} onChange={(e) => props.updateField("email", e.target.value)} onBlur={() => props.blurField("email")} placeholder="admin@example.com" autoComplete="email" error={props.errors.email} /><AuthPasswordField id="password" name="password" required value={props.values.password} onChange={(e) => props.updateField("password", e.target.value)} onBlur={() => props.blurField("password")} placeholder="Password" autoComplete="current-password" error={props.errors.password} visible={props.showPw} onToggle={() => props.setShowPw((value) => !value)} label="Password" /></>;
}

function LoginLinks() {
  return <div className="auth-links"><a href="/admin/password-reset" className="auth-link">Forgot password?</a></div>;
}

function LoginActions({ loading, onCreateAccount }: Pick<Props, "loading" | "onCreateAccount">) {
  return <div className="auth-actions"><button type="submit" className="btn" disabled={loading} aria-busy={loading}>{loading ? "Signing in…" : "Login"}</button><button type="button" className="btn" onClick={onCreateAccount} disabled={loading}>Create Account</button></div>;
}
