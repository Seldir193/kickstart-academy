export function dateLocale(lang?: string) {
  if (lang === "tr") return "tr-TR";
  if (lang === "en") return "en-US";
  return "de-DE";
}

export function formatDateOnly(value?: string | null, lang?: string) {
  if (!value) return "—";
  const s = String(value);
  const d = new Date(s.length === 10 ? `${s}T00:00:00` : s);
  if (Number.isNaN(d.getTime())) return value;

  return new Intl.DateTimeFormat(dateLocale(lang), {
    dateStyle: "medium",
  }).format(d);
}

export function formatDateTime(value?: string | null, lang?: string) {
  if (!value) return "—";
  const s = String(value);
  const d = new Date(s.length === 10 ? `${s}T00:00:00` : s);
  if (Number.isNaN(d.getTime())) return value;

  return new Intl.DateTimeFormat(dateLocale(lang), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}
