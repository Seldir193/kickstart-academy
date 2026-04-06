export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function isoFromDate(d: Date) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

function dateLocale(lang?: string) {
  if (lang === "tr") return "tr-TR";
  if (lang === "en") return "en-US";
  return "de-DE";
}

export function dateFromIso(iso?: string) {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const da = Number(m[3]);
  const d = new Date(y, mo, da);
  if (Number.isNaN(d.getTime())) return null;
  if (d.getFullYear() !== y || d.getMonth() !== mo || d.getDate() !== da)
    return null;
  return d;
}

export function weekdayIndexMondayFirst(jsDay: number) {
  return (jsDay + 6) % 7;
}

export type MonthCell =
  | { kind: "empty" }
  | { kind: "day"; iso: string; day: number };

export function buildMonthGrid(viewMonth: Date) {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = weekdayIndexMondayFirst(first.getDay());
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: MonthCell[] = [];
  for (let i = 0; i < startOffset; i++) cells.push({ kind: "empty" });
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    cells.push({ kind: "day", iso: isoFromDate(d), day });
  }
  while (cells.length % 7 !== 0) cells.push({ kind: "empty" });
  return cells;
}

export function addMonths(base: Date, delta: number) {
  const d = new Date(base.getFullYear(), base.getMonth(), 1);
  d.setMonth(d.getMonth() + delta);
  return d;
}

export function monthLabel(d: Date, lang?: string) {
  return new Intl.DateTimeFormat(dateLocale(lang), {
    month: "long",
    year: "numeric",
  }).format(d);
}

export function dateLabelFromIso(value: string, lang?: string) {
  if (!value) return "";
  const d = dateFromIso(value);
  if (!d) return "";
  return new Intl.DateTimeFormat(dateLocale(lang), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function buildYears(fromYear: number, toYear: number) {
  const ys: number[] = [];
  for (let y = toYear; y >= fromYear; y--) ys.push(y);
  return ys;
}

export function filterYears(years: number[], query: string) {
  const q = query.trim();
  if (!q) return years;
  return years.filter((y) => String(y).includes(q));
}
