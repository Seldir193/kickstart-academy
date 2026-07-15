export function safeText(value: unknown) {
  return String(value ?? "").trim();
}

export function normalizeKey(value: string) {
  return safeText(value)
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

export function normalizeGender(raw: unknown) {
  const gender = safeText(raw).toLowerCase();
  if (gender === "male" || gender === "m" || gender === "männlich")
    return "männlich";
  if (gender === "female" || gender === "f" || gender === "weiblich")
    return "weiblich";
  return "";
}
