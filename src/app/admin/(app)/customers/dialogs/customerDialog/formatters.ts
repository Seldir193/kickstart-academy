//src\app\admin\(app)\customers\dialogs\customerDialog\formatters.ts
import type { FamilyMember } from "./types";

export function dateLocale(lang?: string) {
  if (lang === "tr") return "tr-TR";
  if (lang === "en") return "en-US";
  return "de-DE";
}

export function fmtDE(dt: any, lang?: string) {
  if (!dt) return "";
  const d = new Date(dt);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(dateLocale(lang), {
    timeZone: "Europe/Berlin",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function statusLabel(s?: string, t?: (key: string) => string) {
  switch ((s || "").toLowerCase()) {
    case "subscribed":
      return t
        ? t("common.admin.customers.customerDialog.statusSubscribed")
        : "Subscribed";
    case "pending":
      return t
        ? t("common.admin.customers.customerDialog.statusPending")
        : "Pending (DOI)";
    case "unsubscribed":
      return t
        ? t("common.admin.customers.customerDialog.statusUnsubscribed")
        : "Unsubscribed";
    case "error":
      return t
        ? t("common.admin.customers.customerDialog.statusError")
        : "Error";
    default:
      return "—";
  }
}

function safeText(v: unknown) {
  return String(v ?? "").trim();
}

function childIndexFromId(id: string) {
  const v = safeText(id);
  const i = v.indexOf("::child::");
  if (i < 0) return null;
  const raw = v.slice(i + "::child::".length);
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return n;
}

export function firstChildOf(member: FamilyMember | null | undefined) {
  if (!member) return null;
  if (member.child) return member.child;
  if (member.children && member.children.length > 0) return member.children[0];
  return null;
}

export function formatChildLabel(
  m: FamilyMember,
  t?: (key: string, options?: Record<string, unknown>) => string,
): string {
  const ch = firstChildOf(m);
  if (!ch)
    return t
      ? t("common.admin.customers.customerDialog.noChild")
      : "(kein Kind)";

  const parts: string[] = [];

  if (typeof m.childNumber === "number" && m.childNumber > 0) {
    parts.push(
      t
        ? t("common.admin.customers.customerDialog.childNumber", {
            number: m.childNumber,
          })
        : `Kind ${m.childNumber}`,
    );
  } else {
    const idx = childIndexFromId(m._id);
    if (idx != null)
      parts.push(
        t
          ? t("common.admin.customers.customerDialog.childNumber", {
              number: idx >= 0 ? idx + 1 : 1,
            })
          : `Kind ${idx >= 0 ? idx + 1 : 1}`,
      );
  }

  parts.push(childBase(ch.firstName, ch.lastName));

  return parts.join(" · ");
}

function childBase(first?: string, last?: string, t?: (key: string) => string) {
  return (
    `${first || ""} ${last || ""}`.trim() ||
    (t
      ? t("common.admin.customers.customerDialog.childWithoutName")
      : "(Kind ohne Namen)")
  );
}

// function childBirth(birthDate?: string | null) {
//   if (!birthDate) return "";
//   const d = new Date(birthDate);
//   if (isNaN(d.getTime())) return "";
//   return new Intl.DateTimeFormat("de-DE", {
//     timeZone: "Europe/Berlin",
//     dateStyle: "medium",
//   }).format(d);
// }

// function childBirth(birthDate?: string | null, lang?: string) {
//   if (!birthDate) return "";
//   const d = new Date(birthDate);
//   if (isNaN(d.getTime())) return "";
//   return new Intl.DateTimeFormat(dateLocale(lang), {
//     timeZone: "Europe/Berlin",
//     dateStyle: "medium",
//   }).format(d);
// }
