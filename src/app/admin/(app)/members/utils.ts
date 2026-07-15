import type { Member } from "./types";

type MemberWithFallbackId = Member & { _id?: string };

export function clean(v: unknown) {
  return String(v ?? "").trim();
}

export function idOf(u: Member) {
  const member = u as MemberWithFallbackId;
  return clean(member.id || member._id);
}

export function roleLabel(t: (key: string) => string, u: Member) {
  return u.role === "super"
    ? t("common.admin.members.roles.superadmin")
    : t("common.admin.members.roles.provider");
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
