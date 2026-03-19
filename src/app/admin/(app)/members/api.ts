//src\app\admin\(app)\members\api.ts
export type MemberRole = "provider" | "super";

export type AdminMember = {
  id: string;
  fullName: string;
  email: string;
  role: MemberRole;
  isOwner?: boolean;
  isActive?: boolean;
  avatarUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function errorFor(status: number, msg?: string) {
  const m = clean(msg).toLowerCase();
  if (status === 401)
    return new Error("Sitzung abgelaufen. Bitte neu einloggen.");
  if (status === 403 && m.includes("disabled"))
    return new Error("Account ist deaktiviert.");
  if (status === 403) return new Error("Keine Berechtigung.");
  return new Error("Request failed.");
}

async function readJson(r: Response) {
  const txt = await r.text();
  try {
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

async function assertOk(r: Response) {
  if (r.ok) return;
  const js = await readJson(r);
  throw errorFor(r.status, js?.error);
}

type ListArgs = {
  search?: string;
  role?: MemberRole | "";
  status?: "active" | "inactive" | "";
  signal?: AbortSignal;
};

export async function fetchMembers(args: ListArgs) {
  const qs = new URLSearchParams();
  const q = clean(args.search);
  const role = clean(args.role);
  const status = clean(args.status);

  if (q) qs.set("search", q);
  if (role) qs.set("role", role);
  if (status) qs.set("status", status);

  const url = `/api/admin/auth/users?${qs.toString()}`;
  const r = await fetch(url, {
    method: "GET",
    cache: "no-store",
    signal: args.signal,
  });
  await assertOk(r);

  const js = await readJson(r);
  if (!js?.ok) throw new Error(clean(js?.error) || "Load failed.");

  return { items: Array.isArray(js.items) ? (js.items as AdminMember[]) : [] };
}

export async function setMemberRole(id: string, role: MemberRole) {
  const r = await fetch(
    `/api/admin/auth/users/${encodeURIComponent(id)}/role`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
      cache: "no-store",
    },
  );
  await assertOk(r);

  const js = await readJson(r);
  if (!js?.ok) throw new Error(clean(js?.error) || "Update failed.");
  return js.user as AdminMember;
}

export async function setMemberActive(id: string, active: boolean) {
  const r = await fetch(
    `/api/admin/auth/users/${encodeURIComponent(id)}/active`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
      cache: "no-store",
    },
  );
  await assertOk(r);
  const js = await r.json().catch(() => null);
  if (!js?.ok) throw new Error(clean(js?.error) || "Update failed.");
  return js.user as AdminMember;
}

export async function bulkSetMembersActive(ids: string[], active: boolean) {
  const r = await fetch(`/api/admin/auth/users/bulk-active`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, active }),
    cache: "no-store",
  });
  await assertOk(r);
  const js = await r.json().catch(() => null);
  if (!js?.ok) throw new Error(clean(js?.error) || "Update failed.");
  return { items: Array.isArray(js.items) ? (js.items as AdminMember[]) : [] };
}
