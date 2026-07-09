import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useEffect, useState } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { buildSignupPayload, getSignupError, isSignupSuccess, mergeServerErrors, readSignupData, requestSignup } from "../lib/signupRequest";
import type { SignupErrors, SignupForm, SignupStatus } from "../lib/types";
import { validateSignup } from "../lib/validation";

const initialForm: SignupForm = { confirm: "", email: "", fullName: "", password: "", terms: false };

export default function useSignupState(params: ReadonlyURLSearchParams, router: { replace: (href: string) => void }) {
  const [form, setForm] = useState<SignupForm>(initialForm);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState<SignupStatus>("idle");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  useSignupEmailParam(params, setForm);
  return buildSignupState({ errors, form, formError, params, router, setErrors, setForm, setFormError, setShowConfirm, setShowPw, setStatus, showConfirm, showPw, status });
}

function buildSignupState(ctx: SignupContext) {
  const disabled = ctx.status === "sending";
  const backHref = ctx.params.get("from") || "/admin/login";
  const blurField = createBlurField(ctx.form, ctx.setErrors);
  return { ...ctx, backHref, blurField, disabled, onSubmit: createSubmitHandler(ctx), setField: createSetField(ctx.setForm, ctx.setErrors) };
}

function useSignupEmailParam(params: ReadonlyURLSearchParams, setForm: Dispatch<SetStateAction<SignupForm>>) {
  useEffect(() => {
    const email = params.get("email") || "";
    if (email) setForm((form) => ({ ...form, email }));
  }, [params, setForm]);
}

function createBlurField(form: SignupForm, setErrors: Dispatch<SetStateAction<SignupErrors>>) {
  return (key: keyof SignupForm) => {
    const errors = validateSignup(form);
    setErrors((previous) => ({ ...previous, [key]: errors[key] }));
  };
}

function createSetField(setForm: Dispatch<SetStateAction<SignupForm>>, setErrors: Dispatch<SetStateAction<SignupErrors>>) {
  return <K extends keyof SignupForm>(key: K, value: SignupForm[K]) => {
    setForm((previous) => updateSignupForm(previous, key, value, setErrors));
  };
}

function updateSignupForm<K extends keyof SignupForm>(previous: SignupForm, key: K, value: SignupForm[K], setErrors: Dispatch<SetStateAction<SignupErrors>>) {
  const next = { ...previous, [key]: value };
  setErrors(validateSignup(next));
  return next;
}

function createSubmitHandler(ctx: SignupContext) {
  return async (event: FormEvent) => {
    event.preventDefault();
    if (ctx.status === "sending") return;
    const errors = validateSignup(ctx.form);
    ctx.setFormError("");
    ctx.setErrors(errors);
    if (Object.keys(errors).length) return;
    await submitSignup(ctx);
  };
}

async function submitSignup(ctx: SignupContext) {
  ctx.setStatus("sending");
  try {
    await handleSignupResponse(ctx, await requestSignup(buildSignupPayload(ctx.form)));
  } catch {
    ctx.setFormError("Network error. Please try again.");
    ctx.setStatus("idle");
  }
}

async function handleSignupResponse(ctx: SignupContext, response: Response) {
  const data = await readSignupData(response);
  if (!isSignupSuccess(response, data)) return handleSignupError(ctx, data, response);
  ctx.setStatus("done");
  ctx.router.replace(`/admin/login?email=${encodeURIComponent(ctx.form.email.trim().toLowerCase())}`);
}

function handleSignupError(ctx: SignupContext, data: any, response: Response) {
  ctx.setErrors((previous) => mergeServerErrors(previous, data));
  ctx.setFormError(data?.errors && typeof data.errors === "object" ? "Please fix the errors above." : getSignupError(data, response));
  ctx.setStatus("idle");
}

type SignupContext = {
  errors: SignupErrors;
  form: SignupForm;
  formError: string;
  params: ReadonlyURLSearchParams;
  router: { replace: (href: string) => void };
  setErrors: Dispatch<SetStateAction<SignupErrors>>;
  setForm: Dispatch<SetStateAction<SignupForm>>;
  setFormError: Dispatch<SetStateAction<string>>;
  setShowConfirm: Dispatch<SetStateAction<boolean>>;
  setShowPw: Dispatch<SetStateAction<boolean>>;
  setStatus: Dispatch<SetStateAction<SignupStatus>>;
  showConfirm: boolean;
  showPw: boolean;
  status: SignupStatus;
};
