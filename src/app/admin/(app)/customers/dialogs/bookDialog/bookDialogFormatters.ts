import type { Offer } from "../../types";
import type { FamilyChild, FamilyMember } from "./types";

export function isWeeklyOffer(o?: Offer | null) {
  if (!o) return false;
  if (o.category === "Weekly") return true;
  if (o.category === "ClubPrograms" || o.category === "RentACoach")
    return false;
  return o.type === "Foerdertraining" || o.type === "Kindergarten";
}

export function isNum(v: any): v is number {
  return typeof v === "number" && isFinite(v);
}

// export function fmtEUR(n: number) {
//   try {
//     return new Intl.NumberFormat("de-DE", {
//       style: "currency",
//       currency: "EUR",
//     }).format(n);
//   } catch {
//     return `${n.toFixed(2)} €`;
//   }
// }

// rein
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

// export function fmtDE(dateISO: string) {
//   if (!dateISO) return "—";
//   try {
//     const [y, m, d] = dateISO.split("-").map(Number);
//     return `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.${y}`;
//   } catch {
//     return dateISO;
//   }
// }

// export function formatMemberChildLabel(m: FamilyMember): string {
//   const kid = firstChildOf(m);
//   const idPart =
//     m.userId != null ? `#${m.userId}` : `#${m._id.slice(-4) || "????"}`;
//   if (!kid) return `${idPart} - (Kind ohne Namen)`;
//   const name =
//     `${kid.firstName || ""} ${kid.lastName || ""}`.trim() ||
//     "(Kind ohne Namen)";
//   const birth = formatBirth(kid.birthDate);
//   return birth ? `${idPart} - ${name} - ${birth}` : `${idPart} - ${name}`;
// }

// function formatBirth(birthDate: string | null) {
//   if (!birthDate) return "";
//   const d = new Date(birthDate);
//   if (isNaN(d.getTime())) return "";
//   return new Intl.DateTimeFormat("de-DE", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   }).format(d);
// }
