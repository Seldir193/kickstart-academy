export function dateLocale(lang?: string) {
  if (lang === "tr") return "tr-TR";
  if (lang === "en") return "en-US";
  return "de-DE";
}

export function formatDateOnly(value?: string | null, lang?: string) {
  if (!value) return "—";
  const valueText = String(value);
  const date = new Date(getDateInput(valueText));
  if (Number.isNaN(date.getTime())) return valueText;

  return new Intl.DateTimeFormat(dateLocale(lang), {
    dateStyle: "medium",
  }).format(date);
}

export function formatDateTime(value?: string | null, lang?: string) {
  if (!value) return "—";
  const valueText = String(value);
  const date = new Date(getDateInput(valueText));
  if (Number.isNaN(date.getTime())) return valueText;

  return new Intl.DateTimeFormat(dateLocale(lang), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getDateInput(value: string) {
  return value.length === 10 ? `${value}T00:00:00` : value;
}