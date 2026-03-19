import type { Member } from "./types";

export function clean(v: unknown) {
  return String(v ?? "").trim();
}

export function idOf(u: Member) {
  return clean((u as any).id || (u as any)._id);
}

export function roleLabel(u: Member) {
  return u.role === "super" ? "Superadmin" : "Provider";
}

export function matchMember(u: Member, q: string) {
  const s = clean(q).toLowerCase();
  const n = clean(u.fullName).toLowerCase();
  const e = clean(u.email).toLowerCase();
  return n.includes(s) || e.includes(s);
}

export function sortMembers(items: Member[]) {
  const arr = [...items];
  arr.sort((a, b) =>
    clean(a.fullName).localeCompare(clean(b.fullName), "de", {
      sensitivity: "base",
    }),
  );
  return arr;
}
