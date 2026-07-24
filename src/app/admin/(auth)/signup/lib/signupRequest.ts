import type { SignupErrors, SignupForm } from "./types";

export function buildSignupPayload(form: SignupForm) {
  return {
    email: form.email.trim().toLowerCase(),
    fullName: form.fullName.trim(),
    password: form.password,
  };
}

export async function requestSignup(
  payload: ReturnType<typeof buildSignupPayload>,
) {
  return fetch("/api/admin/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
    cache: "no-store",
  });
}

export async function readSignupData(response: Response) {
  return response.json().catch(() => ({}) as any);
}

export function isSignupSuccess(response: Response, data: any) {
  return (
    response.ok && (data?.ok === true || data?.user || response.status === 201)
  );
}

export function getSignupError(data: any, response: Response) {
  return (
    data?.error ||
    data?.message ||
    rawMessage(data) ||
    `Registration failed (${response.status}). Please try again.`
  );
}

export function mergeServerErrors(current: SignupErrors, data: any) {
  if (!data?.errors || typeof data.errors !== "object") return current;
  return { ...current, ...data.errors };
}

function rawMessage(data: any) {
  return typeof data?.raw === "string" ? data.raw.slice(0, 200) : "";
}
