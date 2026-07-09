export function safeText(value: unknown) {
  return String(value ?? "").trim();
}
