// // src/app/admin/(app)/customers/dialogs/customerDialog/formatters.ts
// import type { FamilyMember } from "./types";

// export function fmtDE(dt: any) {
//   if (!dt) return "";
//   const d = new Date(dt);
//   if (isNaN(d.getTime())) return "";
//   return new Intl.DateTimeFormat("de-DE", {
//     timeZone: "Europe/Berlin",
//     dateStyle: "medium",
//     timeStyle: "short",
//   }).format(d);
// }

// export function statusLabel(s?: string) {
//   switch ((s || "").toLowerCase()) {
//     case "subscribed":
//       return "Subscribed";
//     case "pending":
//       return "Pending (DOI)";
//     case "unsubscribed":
//       return "Unsubscribed";
//     case "error":
//       return "Error";
//     default:
//       return "—";
//   }
// }

// function safeText(v: unknown) {
//   return String(v ?? "").trim();
// }

// function childIndexFromId(id: string) {
//   const v = safeText(id);
//   const i = v.indexOf("::child::");
//   if (i < 0) return null;
//   const raw = v.slice(i + "::child::".length);
//   const n = Number(raw);
//   if (!Number.isFinite(n)) return null;
//   return n;
// }

// export function firstChildOf(member: FamilyMember | null | undefined) {
//   if (!member) return null;
//   if (member.child) return member.child;
//   if (member.children && member.children.length > 0) return member.children[0];
//   return null;
// }

// // export function formatChildLabel(m: FamilyMember): string {
// //   const ch = firstChildOf(m);
// //   if (!ch)
// //     return m.userId != null ? `#${m.userId} · (kein Kind)` : "(kein Kind)";

// //   const parts: string[] = [];

// //   if (m.userId != null) parts.push(`#${m.userId}`);

// //   const idx = childIndexFromId(m._id);
// //   if (idx != null) {
// //     if (idx >= 0) parts.push(`Kind ${idx + 1}`);
// //     if (idx === -1) parts.push("Kind");
// //   }

// //   parts.push(childBase(ch.firstName, ch.lastName));

// //   const birth = childBirth(ch.birthDate);
// //   if (birth) parts.push(birth);

// //   return parts.join(" · ");
// // }

// function childBirth(birthDate?: string | null) {
//   if (!birthDate) return "";
//   const d = new Date(birthDate);
//   if (isNaN(d.getTime())) return "";
//   return new Intl.DateTimeFormat("de-DE", {
//     timeZone: "Europe/Berlin",
//     dateStyle: "medium",
//   }).format(d);
// }

import type { FamilyMember } from "./types";

export function fmtDE(dt: any) {
  if (!dt) return "";
  const d = new Date(dt);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function statusLabel(s?: string) {
  switch ((s || "").toLowerCase()) {
    case "subscribed":
      return "Subscribed";
    case "pending":
      return "Pending (DOI)";
    case "unsubscribed":
      return "Unsubscribed";
    case "error":
      return "Error";
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

export function formatChildLabel(m: FamilyMember): string {
  const ch = firstChildOf(m);
  if (!ch) {
    return m.userId != null ? `#${m.userId} · (kein Kind)` : "(kein Kind)";
  }

  const parts: string[] = [];

  if (m.userId != null) parts.push(`#${m.userId}`);

  if (typeof m.childNumber === "number" && m.childNumber > 0) {
    parts.push(`Kind ${m.childNumber}`);
  } else {
    const idx = childIndexFromId(m._id);
    if (idx != null) parts.push(`Kind ${idx >= 0 ? idx + 1 : 1}`);
  }

  parts.push(childBase(ch.firstName, ch.lastName));

  const birth = childBirth(ch.birthDate);
  if (birth) parts.push(birth);

  return parts.join(" · ");
}

function childBase(first?: string, last?: string) {
  return `${first || ""} ${last || ""}`.trim() || "(Kind ohne Namen)";
}

function childBirth(birthDate?: string | null) {
  if (!birthDate) return "";
  const d = new Date(birthDate);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    dateStyle: "medium",
  }).format(d);
}

// //src\app\admin\(app)\customers\dialogs\customerDialog\formatters.ts
// import type { FamilyMember } from "./types";

// export function fmtDE(dt: any) {
//   if (!dt) return "";
//   const d = new Date(dt);
//   if (isNaN(d.getTime())) return "";
//   return new Intl.DateTimeFormat("de-DE", {
//     timeZone: "Europe/Berlin",
//     dateStyle: "medium",
//     timeStyle: "short",
//   }).format(d);
// }

// export function statusLabel(s?: string) {
//   switch ((s || "").toLowerCase()) {
//     case "subscribed":
//       return "Subscribed";
//     case "pending":
//       return "Pending (DOI)";
//     case "unsubscribed":
//       return "Unsubscribed";
//     case "error":
//       return "Error";
//     default:
//       return "—";
//   }
// }

// export function firstChildOf(member: FamilyMember | null | undefined) {
//   if (!member) return null;
//   if (member.child) return member.child;
//   if (member.children && member.children.length > 0) return member.children[0];
//   return null;
// }

// export function formatChildLabel(m: FamilyMember): string {
//   const ch = firstChildOf(m);
//   if (!ch)
//     return m.userId != null ? `#${m.userId} · (kein Kind)` : "(kein Kind)";
//   const parts: string[] = [];
//   if (m.userId != null) parts.push(`#${m.userId}`);
//   parts.push(childBase(ch.firstName, ch.lastName));
//   const birth = childBirth(ch.birthDate);
//   if (birth) parts.push(birth);
//   return parts.join(" · ");
// }

// function childBase(first?: string, last?: string) {
//   return `${first || ""} ${last || ""}`.trim() || "(Kind ohne Namen)";
// }

// function childBirth(birthDate?: string | null) {
//   if (!birthDate) return "";
//   const d = new Date(birthDate);
//   if (isNaN(d.getTime())) return "";
//   return new Intl.DateTimeFormat("de-DE", {
//     timeZone: "Europe/Berlin",
//     dateStyle: "medium",
//   }).format(d);
// }
