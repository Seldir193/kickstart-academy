import type { Dispatch, FormEvent, SetStateAction } from "react";
import AuthFormError from "../../components/AuthFormError";
import AuthInputField from "../../components/AuthInputField";
import AuthPasswordField from "../../components/AuthPasswordField";
import AuthErrorSlot from "../../components/AuthErrorSlot";
import type { SignupErrors, SignupForm } from "../lib/types";

type Props = {
  backHref: string;
  blurField: (key: keyof SignupForm) => void;
  disabled: boolean;
  errors: SignupErrors;
  form: SignupForm;
  formError: string;
  onBack: (href: string) => void;
  onLogin: () => void;
  onSubmit: (event: FormEvent) => void;
  setField: <K extends keyof SignupForm>(key: K, value: SignupForm[K]) => void;
  setShowConfirm: Dispatch<SetStateAction<boolean>>;
  setShowPw: Dispatch<SetStateAction<boolean>>;
  showConfirm: boolean;
  showPw: boolean;
};

export default function SignupForm(props: Props) {
  return <section className="admin-auth" aria-busy={props.disabled}><div className="auth-card"><SignupHeader backHref={props.backHref} onBack={props.onBack} /><p className="auth-subtitle">Create your provider access. After registration you’ll be redirected to the login page.</p><AuthFormError error={props.formError} /><form className="auth-form" onSubmit={props.onSubmit} noValidate><fieldset disabled={props.disabled} className="auth-fieldset"><SignupFields {...props} /><TermsField {...props} /><SignupActions disabled={props.disabled} onLogin={props.onLogin} /></fieldset></form></div></section>;
}

function SignupHeader({ backHref, onBack }: Pick<Props, "backHref" | "onBack">) {
  return <div className="auth-head"><button type="button" className="auth-back" onClick={() => onBack(backHref)} aria-label="Back to login"><img src="/icons/arrow_right_alt.svg" alt="" aria-hidden="true" className="auth-back__icon" /></button><h1 className="auth-title">Provider Sign-up</h1><span aria-hidden="true" /></div>;
}

function SignupFields(props: Props) {
  return <><AuthInputField id="fullName" name="fullName" icon="/icons/user.svg" label="Name" value={props.form.fullName} onChange={(e) => props.setField("fullName", e.target.value)} onBlur={() => props.blurField("fullName")} autoComplete="name" placeholder="Name and surname" required error={props.errors.fullName} /><AuthInputField id="email" name="email" type="email" icon="/icons/mail.svg" label="E-Mail" value={props.form.email} onChange={(e) => props.setField("email", e.target.value)} onBlur={() => props.blurField("email")} autoComplete="email" placeholder="admin@example.com" required error={props.errors.email} /><SignupPasswords {...props} /></>;
}

function SignupPasswords(props: Props) {
  return <><AuthPasswordField id="password" name="password" value={props.form.password} onChange={(e) => props.setField("password", e.target.value)} onBlur={() => props.blurField("password")} minLength={6} autoComplete="new-password" placeholder="Password" required error={props.errors.password} visible={props.showPw} onToggle={() => props.setShowPw((value) => !value)} label="Password" /><AuthPasswordField id="confirm" name="confirm" value={props.form.confirm} onChange={(e) => props.setField("confirm", e.target.value)} onBlur={() => props.blurField("confirm")} minLength={6} autoComplete="new-password" placeholder="Confirm password" required error={props.errors.confirm} visible={props.showConfirm} onToggle={() => props.setShowConfirm((value) => !value)} label="Confirm password" /></>;
}

function TermsField(props: Props) {
  return <div className="auth-check-row"><label className="check"><input type="checkbox" checked={props.form.terms} onChange={(e) => props.setField("terms", e.target.checked)} onBlur={() => props.blurField("terms")} /><span className="check__box" aria-hidden="true" /><span className="check__text">I agree to the <a className="check__link" href="/agb">Terms (AGB)</a></span></label><AuthErrorSlot error={props.errors.terms} /></div>;
}

function SignupActions({ disabled, onLogin }: Pick<Props, "disabled" | "onLogin">) {
  return <div className="auth-actions"><button className="btn" disabled={disabled} aria-busy={disabled} type="submit">{disabled ? "Creating…" : "Create account"}</button><button type="button" className="btn" onClick={onLogin} disabled={disabled}>I already have an account</button></div>;
}
