import type { Offer } from "../../types";
import type { FamilyChild, FamilyMember } from "./types";

export function isWeeklyOffer(o?: Offer | null) {
  if (!o) return false;
  if (o.category === "Weekly") return true;
  if (o.category === "ClubPrograms" || o.category === "RentACoach")
    return false;
  return o.type === "Foerdertraining" || o.type === "Kindergarten";
}

export function isIndividualOffer(o?: Offer | null) {
  const category = String((o as any)?.category ?? "").trim();
  const type = String((o as any)?.type ?? "")
    .trim()
    .toLowerCase();
  const subType = String((o as any)?.sub_type ?? "")
    .trim()
    .toLowerCase();

  return (
    category === "Individual" ||
    type.includes("individual") ||
    subType.includes("individual") ||
    subType.includes("personaltraining")
  );
}

const DAY_ALIASES: Record<string, string> = {
  m: "Mo",
  mo: "Mo",
  montag: "Mo",
  monday: "Mo",
  mon: "Mo",
  di: "Di",
  dienstag: "Di",
  tuesday: "Di",
  tue: "Di",
  mi: "Mi",
  mittwoch: "Mi",
  wednesday: "Mi",
  wed: "Mi",
  do: "Do",
  donnerstag: "Do",
  thursday: "Do",
  thu: "Do",
  fr: "Fr",
  freitag: "Fr",
  friday: "Fr",
  fri: "Fr",
  sa: "Sa",
  samstag: "Sa",
  saturday: "Sa",
  sat: "Sa",
  so: "So",
  sonntag: "So",
  sunday: "So",
  sun: "So",
};

const DAY_LONG_DE: Record<string, string> = {
  Mo: "Montag",
  Di: "Dienstag",
  Mi: "Mittwoch",
  Do: "Donnerstag",
  Fr: "Freitag",
  Sa: "Samstag",
  So: "Sonntag",
};

function normalizeDay(value: unknown) {
  const key = String(value ?? "")
    .trim()
    .toLowerCase();

  if (DAY_ALIASES[key]) return DAY_ALIASES[key];

  const hit = Object.keys(DAY_ALIASES).find((part) => {
    const pattern = new RegExp(`(^|\\s|·|,|-)${part}(\\s|·|,|-|$)`, "i");
    return pattern.test(key);
  });

  return hit ? DAY_ALIASES[hit] : "";
}

function firstDayEntry(offer?: Offer | null) {
  const days = Array.isArray((offer as any)?.days) ? (offer as any).days : [];
  return days[0] || null;
}

function offerDayValue(offer?: Offer | null) {
  const entry = firstDayEntry(offer);

  if (entry && typeof entry === "object") {
    return (
      (entry as any).day ||
      (entry as any).weekday ||
      (entry as any).tag ||
      (entry as any).label ||
      (entry as any).name ||
      ""
    );
  }

  return (
    (offer as any)?.day ||
    (offer as any)?.weekday ||
    (offer as any)?.tag ||
    (offer as any)?.dayLabel ||
    entry ||
    ""
  );
}

export function getOfferDayLabel(offer?: Offer | null) {
  const day = normalizeDay(offerDayValue(offer));
  return day ? DAY_LONG_DE[day] || day : "";
}

function offerTimeValue(offer?: Offer | null) {
  const entry = firstDayEntry(offer);

  if (entry && typeof entry === "object") {
    const from =
      (entry as any).timeFrom ||
      (entry as any).from ||
      (entry as any).start ||
      "";
    const to =
      (entry as any).timeTo || (entry as any).to || (entry as any).end || "";

    if (from || to) return [from, to].filter(Boolean).join(" – ");

    return (entry as any).time || (entry as any).zeit || "";
  }

  return "";
}

export function getOfferTimeLine(offer?: Offer | null) {
  const from = String((offer as any)?.timeFrom ?? "").trim();
  const to = String((offer as any)?.timeTo ?? "").trim();
  const direct = from && to ? `${from} – ${to}` : from || to;
  return direct || String(offerTimeValue(offer)).trim();
}

export function getOfferScheduleLabel(offer?: Offer | null) {
  const day = getOfferDayLabel(offer);
  if (!day) return "";

  if (isWeeklyOffer(offer)) return `Jeden ${day}`;
  if (isIndividualOffer(offer)) return day;

  return "";
}

export function getOfferScheduleLine(offer?: Offer | null) {
  const label = getOfferScheduleLabel(offer);
  const time = getOfferTimeLine(offer);
  return [label, time].filter(Boolean).join(" · ");
}

export function isNum(v: any): v is number {
  return typeof v === "number" && isFinite(v);
}

export function fmtEUR(n: number, lang?: string) {
  try {
    return new Intl.NumberFormat(dateLocale(lang), {
      style: "currency",
      currency: "EUR",
    }).format(n);
  } catch {
    return `${n.toFixed(2)} €`;
  }
}

export function prorateForStart(dateISO: string, monthlyPrice?: number | null) {
  if (!dateISO || !isNum(monthlyPrice)) return null;
  const d = new Date(`${dateISO}T00:00:00`);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = d.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const startDay = d.getDate();
  const daysRemaining = Math.max(0, daysInMonth - startDay + 1);
  const factor = Math.max(0, Math.min(1, daysRemaining / daysInMonth));
  const firstMonthPrice = Math.round(monthlyPrice * factor * 100) / 100;
  return { daysInMonth, daysRemaining, factor, firstMonthPrice, monthlyPrice };
}

export function firstChildOf(
  m: FamilyMember | null | undefined,
): FamilyChild | null {
  if (!m) return null;
  if (m.child) return m.child;
  if (Array.isArray(m.children) && m.children.length > 0) return m.children[0];
  return null;
}

// rein
function dateLocale(lang?: string) {
  if (lang === "tr") return "tr-TR";
  if (lang === "en") return "en-US";
  return "de-DE";
}

export function fmtDE(dateISO: string, lang?: string) {
  if (!dateISO) return "—";
  const d = new Date(`${dateISO}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateISO;
  return new Intl.DateTimeFormat(dateLocale(lang), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatMemberChildLabel(
  m: FamilyMember,
  t: (key: string) => string,
  lang?: string,
): string {
  const kid = firstChildOf(m);
  const missingName = t("common.admin.customers.bookDialog.childWithoutName");
  const idPart =
    m.userId != null ? `#${m.userId}` : `#${m._id.slice(-4) || "????"}`;
  if (!kid) return `${idPart} - ${missingName}`;
  const name =
    `${kid.firstName || ""} ${kid.lastName || ""}`.trim() || missingName;
  const birth = formatBirth(kid.birthDate, lang);
  return birth ? `${idPart} - ${name} - ${birth}` : `${idPart} - ${name}`;
}

function formatBirth(birthDate: string | null, lang?: string) {
  if (!birthDate) return "";
  const d = new Date(birthDate);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(dateLocale(lang), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}
