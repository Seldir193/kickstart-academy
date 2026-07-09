import type { SignupErrors, SignupForm } from "./types";

export function isValidEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value);
}

export function validateSignup(form: SignupForm) {
  const errors: SignupErrors = {};
  if (!form.fullName.trim()) errors.fullName = "Please fill in this field";
  if (!isValidEmail(form.email)) errors.email = "*Please fill out the email field";
  if (form.password.length < 6) errors.password = "Min. 6 characters";
  setConfirmError(form, errors);
  if (!form.terms) errors.terms = "Please accept the terms to continue";
  return errors;
}

function setConfirmError(form: SignupForm, errors: SignupErrors) {
  if (form.confirm.length < 6) errors.confirm = "Min. 6 characters";
  else if (form.password !== form.confirm) errors.confirm = "Passwords do not match";
}
