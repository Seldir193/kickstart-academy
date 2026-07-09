import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useEffect, useState } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { readLoginError, requestLogin } from "../lib/loginRequest";
import { seedAvatarCacheFromLogin } from "../lib/avatarCache";
import type { LoginErrors, LoginField, LoginValues } from "../lib/types";
import { validateLogin, validateLoginField } from "../lib/validation";

const ADMIN_HOME = "/admin";

export default function useAdminLoginState(searchParams: ReadonlyURLSearchParams) {
  const [values, setValues] = useState<LoginValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  useLoginEmailParam(searchParams, setValues);
  const submitLogin = useLoginSubmit(values, loading, setLoading, setFormError, setErrors);
  return { blurField: createBlurField(values, setErrors), errors, formError, loading, setShowPw, showPw, submitLogin, updateField: createUpdateField(setValues, setErrors), values };
}

function useLoginEmailParam(searchParams: ReadonlyURLSearchParams, setValues: Dispatch<SetStateAction<LoginValues>>) {
  useEffect(() => {
    const email = searchParams.get("email") || "";
    if (email) setValues((prev) => ({ ...prev, email }));
  }, [searchParams, setValues]);
}

function createBlurField(values: LoginValues, setErrors: Dispatch<SetStateAction<LoginErrors>>) {
  return (field: LoginField) => {
    const errors = validateLogin(values);
    setErrors((previous) => ({ ...previous, [field]: errors[field] }));
  };
}

function createUpdateField(setValues: Dispatch<SetStateAction<LoginValues>>, setErrors: Dispatch<SetStateAction<LoginErrors>>) {
  return (field: LoginField, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: validateLoginField(field, value) }));
  };
}

function useLoginSubmit(values: LoginValues, loading: boolean, setLoading: (value: boolean) => void, setFormError: (value: string) => void, setErrors: (value: LoginErrors) => void) {
  return async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;
    const errors = validateLogin(values);
    setFormError("");
    setErrors(errors);
    if (Object.keys(errors).length) return;
    await submitValidLogin(values, setLoading, setFormError);
  };
}

async function submitValidLogin(values: LoginValues, setLoading: (value: boolean) => void, setFormError: (value: string) => void) {
  setLoading(true);
  try {
    await handleLoginResponse(await requestLogin(values.email, values.password), setFormError);
  } catch {
    setFormError("Network error");
  } finally {
    setLoading(false);
  }
}

async function handleLoginResponse(response: Response, setFormError: (value: string) => void) {
  if (!response.ok) return setFormError(await readLoginError(response));
  const data = await response.json().catch(() => ({}));
  await seedAvatarCacheFromLogin(data);
  window.location.assign(ADMIN_HOME);
}
