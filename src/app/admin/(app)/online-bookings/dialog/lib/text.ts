export function safeText(v: unknown) {
  return String(v ?? "").trim();
}

export function hasRealValue(v: unknown) {
  const t = safeText(v);
  return t !== "" && t !== "-" && t !== "—";
}

export function pickValue(...values: unknown[]) {
  for (const value of values) {
    if (hasRealValue(value)) return safeText(value);
  }
  return "—";
}
