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

export function fmtEUR(n: number) {
  try {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(n);
  } catch {
    return `${n.toFixed(2)} €`;
  }
}

export function fmtDE(dateISO: string) {
  if (!dateISO) return "—";
  try {
    const [y, m, d] = dateISO.split("-").map(Number);
    return `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.${y}`;
  } catch {
    return dateISO;
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

export function formatMemberChildLabel(m: FamilyMember): string {
  const kid = firstChildOf(m);
  const idPart =
    m.userId != null ? `#${m.userId}` : `#${m._id.slice(-4) || "????"}`;
  if (!kid) return `${idPart} - (Kind ohne Namen)`;
  const name =
    `${kid.firstName || ""} ${kid.lastName || ""}`.trim() ||
    "(Kind ohne Namen)";
  const birth = formatBirth(kid.birthDate);
  return birth ? `${idPart} - ${name} - ${birth}` : `${idPart} - ${name}`;
}

function formatBirth(birthDate: string | null) {
  if (!birthDate) return "";
  const d = new Date(birthDate);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}
