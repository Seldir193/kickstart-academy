export function toastText(
  t: (key: string) => string,
  key: string,
  fallback?: string,
) {
  const text = t(key);
  return text === key ? fallback || key : text;
}

export function toastErrorMessage(
  t: (key: string) => string,
  error: unknown,
  fallbackKey: string,
) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string" &&
    (error as { message: string }).message.trim()
  ) {
    return (error as { message: string }).message;
  }

  return toastText(t, fallbackKey);
}
