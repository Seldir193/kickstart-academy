import type { LoginErrors, LoginValues } from "./types";

export function isValidEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value);
}

export function validateLogin(values: LoginValues) {
  const errors: LoginErrors = {};
  if (!isValidEmail(values.email)) errors.email = "*Please fill out the email field";
  if (values.password.length < 6) errors.password = "Min. 6 characters";
  return errors;
}

export function validateLoginField(field: keyof LoginValues, value: string) {
  if (field === "email") return isValidEmail(value) ? undefined : "Invalid email";
  return value.length >= 6 ? undefined : "Min. 6 characters";
}
