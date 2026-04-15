import type { AdminMember } from "../api";

export type Me = {
  id: string;
  role: string;
  isSuperAdmin: boolean;
  isOwner: boolean;
};

function clean(v: unknown) {
  return String(v ?? "").trim();
}

export function idOf(u: AdminMember) {
  return clean(u?.id);
}

export function displayName(u: AdminMember) {
  const n = clean(u?.fullName);
  return n || clean(u?.email) || "—";
}

export function roleLabel(t: (key: string) => string, u: AdminMember) {
  const r = clean(u?.role).toLowerCase();
  if (u?.isOwner) return t("common.admin.members.roles.owner");
  if (r === "super") return t("common.admin.members.roles.superadmin");
  return t("common.admin.members.roles.provider");
}

export async function fetchMe(): Promise<Me | null> {
  const r = await fetch("/api/admin/auth/me", { cache: "no-store" }).catch(
    () => null,
  );
  if (!r) return null;

  const js = await r.json().catch(() => null);
  if (!js?.ok || !js?.user?.id) return null;

  return {
    id: clean(js.user.id),
    role: clean(js.user.role),
    isSuperAdmin: Boolean(js.user.isSuperAdmin),
    isOwner: Boolean(js.user.isOwner),
  };
}

export function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
