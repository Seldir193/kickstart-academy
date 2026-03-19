"use client";

import type { Coach, Me } from "./types";
import { fullName, getSlug } from "./utils";

type ApiOk<T> = { ok: true; item?: T; items?: any; combined?: any; user?: any };
type ApiErr = { ok?: false; error?: string; message?: string };

function cleanStr(v: unknown) {
  return String(v ?? "").trim();
}

function pickError(j: any) {
  return cleanStr(j?.error || j?.message);
}

async function parseJsonSafe(r: Response) {
  try {
    return await r.json();
  } catch {
    return null;
  }
}

async function requestJson(url: string, init: RequestInit, fallback: string) {
  const r = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
  });

  const j = (await parseJsonSafe(r)) as ApiOk<any> | ApiErr | null;
  if (!r.ok) throw new Error(pickError(j) || fallback);
  if ((j as any)?.ok === false) throw new Error(pickError(j) || fallback);
  return j;
}

function slugOrThrow(slug: string) {
  const s = cleanStr(slug);
  if (!s) throw new Error("Missing slug.");
  return s;
}

export async function fetchMe(signal?: AbortSignal): Promise<Me | null> {
  const r = await fetch("/api/admin/auth/me", { cache: "no-store", signal });
  const j = (await parseJsonSafe(r)) as any;
  if (!r.ok || !j?.ok || !j?.user?.id) return null;

  return {
    id: cleanStr(j.user.id),
    isSuperAdmin: Boolean(j.user.isSuperAdmin),
    role: cleanStr(j.user.role || "provider") as any,
    fullName: cleanStr(j.user.fullName || "") || undefined,
  };
}

export async function fetchCoachesList(args: {
  page: number;
  limit: number;
  q?: string;
  sort?: string;
  view?: string;
  signal?: AbortSignal;
}) {
  const qs = new URLSearchParams();
  qs.set("page", String(args.page));
  qs.set("limit", String(args.limit));
  if (args.q) qs.set("q", args.q);
  if (args.sort) qs.set("sort", args.sort);
  if (args.view) qs.set("view", args.view);

  const r = await fetch(`/api/admin/coaches?${qs.toString()}`, {
    method: "GET",
    signal: args.signal,
    cache: "no-store",
  });

  const j = await parseJsonSafe(r);
  if (!r.ok) throw new Error(pickError(j) || "Load failed.");
  if ((j as any)?.ok === false) throw new Error(pickError(j) || "Load failed.");
  return j;
}

export async function createCoach(values: Partial<Coach>) {
  const j = await requestJson(
    "/api/admin/coaches",
    { method: "POST", body: JSON.stringify(values || {}) },
    "Create failed.",
  );

  const item = (j as any)?.item;
  if (!item) throw new Error("Create failed.");
  return item as Coach;
}

export async function updateCoach(slug: string, values: Partial<Coach>) {
  const s = slugOrThrow(slug);
  const j = await requestJson(
    `/api/admin/coaches/${encodeURIComponent(s)}`,
    { method: "PATCH", body: JSON.stringify(values || {}) },
    "Save failed.",
  );

  const item = (j as any)?.item;
  if (!item) throw new Error("Save failed.");
  return item as Coach;
}

export async function submitCoachForReview(slug: string) {
  const s = slugOrThrow(slug);
  const j = await requestJson(
    `/api/admin/coaches/${encodeURIComponent(s)}`,
    { method: "PATCH", body: JSON.stringify({ submitForReview: true }) },
    "Submit failed.",
  );

  const item = (j as any)?.item;
  if (!item) throw new Error("Submit failed.");
  return item as Coach;
}

export async function approveCoach(slug: string) {
  const s = slugOrThrow(slug);
  const j = await requestJson(
    `/api/admin/coaches/${encodeURIComponent(s)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status: "approved", published: true }),
    },
    "Approve failed.",
  );

  const item = (j as any)?.item;
  if (!item) throw new Error("Approve failed.");
  return item as Coach;
}

export async function rejectCoach(slug: string, reason: string) {
  const s = slugOrThrow(slug);
  const j = await requestJson(
    `/api/admin/coaches/${encodeURIComponent(s)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status: "rejected",
        rejectionReason: cleanStr(reason),
      }),
    },
    "Reject failed.",
  );

  const item = (j as any)?.item;
  if (!item) throw new Error("Reject failed.");
  return item as Coach;
}

export async function deleteCoach(slug: string) {
  const s = slugOrThrow(slug);
  const r = await fetch(`/api/admin/coaches/${encodeURIComponent(s)}`, {
    method: "DELETE",
    cache: "no-store",
  });

  const j = await parseJsonSafe(r);
  if (!r.ok) throw new Error(pickError(j) || "Delete failed.");
  if ((j as any)?.ok === false)
    throw new Error(pickError(j) || "Delete failed.");
  return true;
}

export function hasDraft(c: Coach) {
  return Boolean((c as any).hasDraft) && !!(c as any).draft;
}

export function draftValue<T>(c: Coach, key: string): T | undefined {
  const d = (c as any).draft;
  if (!d || typeof d !== "object") return undefined;
  return (d as any)[key] as T | undefined;
}

export function effectiveCoach(c: Coach): Coach {
  const d = (c as any).draft;
  if (!hasDraft(c) || !d || typeof d !== "object") return c;
  return { ...(c as any), ...(d as any) } as Coach;
}

export function effectiveName(c: Coach) {
  return fullName(effectiveCoach(c));
}

export function effectiveSlug(c: Coach) {
  return getSlug(effectiveCoach(c));
}

export function effectivePosition(c: Coach) {
  return cleanStr((effectiveCoach(c) as any).position);
}

// //src\app\admin\(app)\coaches\api.ts
// "use client";

// import type { Coach, Me } from "./types";
// import { fullName, getSlug } from "./utils";

// type ApiOk<T> = { ok: true; item?: T; user?: any; items?: any; combined?: any };
// type ApiErr = { ok?: false; error?: string; message?: string };

// function cleanStr(v: unknown) {
//   return String(v ?? "").trim();
// }

// function pickError(j: any) {
//   return cleanStr(j?.error || j?.message);
// }

// async function parseJsonSafe(r: Response) {
//   try {
//     return await r.json();
//   } catch {
//     return null;
//   }
// }

// async function requestJson(url: string, init: RequestInit, fallback: string) {
//   const r = await fetch(url, {
//     ...init,
//     cache: "no-store",
//     headers: { "Content-Type": "application/json", ...(init.headers || {}) },
//   });

//   const j = (await parseJsonSafe(r)) as ApiOk<any> | ApiErr | null;
//   if (!r.ok) throw new Error(pickError(j) || fallback);
//   if ((j as any)?.ok === false) throw new Error(pickError(j) || fallback);
//   return j;
// }

// function slugOrThrow(slug: string) {
//   const s = cleanStr(slug);
//   if (!s) throw new Error("Missing slug.");
//   return s;
// }

// export async function fetchMe(signal?: AbortSignal): Promise<Me | null> {
//   const r = await fetch("/api/admin/auth/me", { cache: "no-store", signal });
//   const j = (await parseJsonSafe(r)) as any;
//   if (!r.ok || !j?.ok || !j?.user?.id) return null;

//   return {
//     id: cleanStr(j.user.id),
//     isSuperAdmin: Boolean(j.user.isSuperAdmin),
//     role: cleanStr(j.user.role || "provider") as any,
//     fullName: cleanStr(j.user.fullName || "") || undefined,
//   };
// }

// // export async function fetchCoachesList(args: {
// //   page: number;
// //   limit: number;
// //   q?: string;
// //   sort?: string;
// //   view?: string;
// //   signal?: AbortSignal;
// // }) {
// //   const qs = new URLSearchParams();
// //   qs.set("page", String(args.page));
// //   qs.set("limit", String(args.limit));
// //   if (args.q) qs.set("q", args.q);
// //   if (args.sort) qs.set("sort", args.sort);
// //   if (args.view) qs.set("view", args.view);

// //   const r = await fetch(`/api/admin/coaches?${qs.toString()}`, {
// //     method: "GET",
// //     signal: args.signal,
// //     cache: "no-store",
// //   });

// //   const j = await parseJsonSafe(r);
// //   if (!r.ok) throw new Error(pickError(j) || "Load failed.");
// //   if ((j as any)?.ok === false) throw new Error(pickError(j) || "Load failed.");
// //   return j;
// // }

// export async function fetchCoachesList(args: {
//   page: number;
//   limit: number;
//   q?: string;
//   sort?: string;
//   view?: string;
//   signal?: AbortSignal;
//   me?: Me | null;
// }) {
//   const qs = new URLSearchParams();
//   qs.set("page", String(args.page));
//   qs.set("limit", String(args.limit));
//   if (args.q) qs.set("q", args.q);
//   if (args.sort) qs.set("sort", args.sort);
//   if (args.view) qs.set("view", args.view);

//   const headers: Record<string, string> = {};
//   const id = cleanStr(args.me?.id);
//   const role = cleanStr(args.me?.role);
//   if (id) headers["x-provider-id"] = id;
//   if (role) headers["x-admin-role"] = role === "super" ? "super" : "provider";

//   const r = await fetch(`/api/admin/coaches?${qs.toString()}`, {
//     method: "GET",
//     signal: args.signal,
//     cache: "no-store",
//     headers,
//   });

//   const j = await parseJsonSafe(r);
//   if (!r.ok) throw new Error(pickError(j) || "Load failed.");
//   if ((j as any)?.ok === false) throw new Error(pickError(j) || "Load failed.");
//   return j;
// }

// export async function createCoach(values: Partial<Coach>) {
//   const j = await requestJson(
//     "/api/admin/coaches",
//     { method: "POST", body: JSON.stringify(values || {}) },
//     "Create failed.",
//   );

//   const item = (j as any)?.item;
//   if (!item) throw new Error("Create failed.");
//   return item as Coach;
// }

// export async function updateCoach(slug: string, values: Partial<Coach>) {
//   const s = slugOrThrow(slug);
//   const j = await requestJson(
//     `/api/admin/coaches/${encodeURIComponent(s)}`,
//     { method: "PATCH", body: JSON.stringify(values || {}) },
//     "Save failed.",
//   );

//   const item = (j as any)?.item;
//   if (!item) throw new Error("Save failed.");
//   return item as Coach;
// }

// export async function submitCoachForReview(slug: string) {
//   const s = slugOrThrow(slug);
//   const j = await requestJson(
//     `/api/admin/coaches/${encodeURIComponent(s)}`,
//     { method: "PATCH", body: JSON.stringify({ submitForReview: true }) },
//     "Submit failed.",
//   );

//   const item = (j as any)?.item;
//   if (!item) throw new Error("Submit failed.");
//   return item as Coach;
// }

// export async function approveCoach(slug: string) {
//   const s = slugOrThrow(slug);
//   const j = await requestJson(
//     `/api/admin/coaches/${encodeURIComponent(s)}`,
//     {
//       method: "PATCH",
//       body: JSON.stringify({ status: "approved", published: true }),
//     },
//     "Approve failed.",
//   );

//   const item = (j as any)?.item;
//   if (!item) throw new Error("Approve failed.");
//   return item as Coach;
// }

// export async function rejectCoach(slug: string, reason: string) {
//   const s = slugOrThrow(slug);
//   const j = await requestJson(
//     `/api/admin/coaches/${encodeURIComponent(s)}`,
//     {
//       method: "PATCH",
//       body: JSON.stringify({
//         status: "rejected",
//         rejectionReason: cleanStr(reason),
//       }),
//     },
//     "Reject failed.",
//   );

//   const item = (j as any)?.item;
//   if (!item) throw new Error("Reject failed.");
//   return item as Coach;
// }

// export async function deleteCoach(slug: string) {
//   const s = slugOrThrow(slug);
//   const r = await fetch(`/api/admin/coaches/${encodeURIComponent(s)}`, {
//     method: "DELETE",
//     cache: "no-store",
//   });

//   const j = await parseJsonSafe(r);
//   if (!r.ok) throw new Error(pickError(j) || "Delete failed.");
//   if ((j as any)?.ok === false)
//     throw new Error(pickError(j) || "Delete failed.");
//   return true;
// }

// export function hasDraft(c: Coach) {
//   return Boolean((c as any).hasDraft) && !!(c as any).draft;
// }

// export function draftValue<T>(c: Coach, key: string): T | undefined {
//   const d = (c as any).draft;
//   if (!d || typeof d !== "object") return undefined;
//   return (d as any)[key] as T | undefined;
// }

// export function effectiveCoach(c: Coach): Coach {
//   const d = (c as any).draft;
//   if (!hasDraft(c) || !d || typeof d !== "object") return c;
//   return { ...(c as any), ...(d as any) } as Coach;
// }

// export function effectiveName(c: Coach) {
//   return fullName(effectiveCoach(c));
// }

// export function effectiveSlug(c: Coach) {
//   return getSlug(effectiveCoach(c));
// }

// export function effectivePosition(c: Coach) {
//   return cleanStr((effectiveCoach(c) as any).position);
// }

// // src/app/admin/(app)/coaches/api.ts
// import type { Coach, ListResp, Me } from "./types";

// async function readJson(r: Response) {
//   const text = await r.text();
//   try {
//     return JSON.parse(text);
//   } catch {
//     return { ok: false, raw: text };
//   }
// }

// export async function fetchMe(signal?: AbortSignal): Promise<Me | null> {
//   const r = await fetch("/api/admin/auth/me", { cache: "no-store", signal });
//   const js = await readJson(r);
//   if (!r.ok || !js?.ok || !js?.user?.id) return null;

//   return {
//     id: String(js.user.id),
//     isSuperAdmin: Boolean(js.user.isSuperAdmin),
//     role: String(js.user.role || "provider") as any,
//     fullName: String(js.user.fullName || "").trim() || undefined,
//   };
// }

// export async function fetchCoachesList(params: {
//   page: number;
//   limit: number;
//   view?: string;
//   q?: string;
//   sort?: string;
//   signal?: AbortSignal;
// }): Promise<ListResp> {
//   const { page, limit, view, q, sort, signal } = params;

//   const sp = new URLSearchParams();
//   sp.set("page", String(page));
//   sp.set("limit", String(limit));
//   if (view) sp.set("view", view);
//   if (q) sp.set("q", q);
//   if (sort) sp.set("sort", sort);

//   const r = await fetch(`/api/admin/coaches?${sp.toString()}`, {
//     cache: "no-store",
//     signal,
//   });

//   const js = (await readJson(r)) as ListResp;
//   if (!r.ok || js?.ok === false) {
//     const msg = (js as any)?.error || "Could not load coaches.";
//     throw new Error(msg);
//   }
//   return js;
// }

// export async function fetchAllCoaches(
//   limit: number,
//   signal?: AbortSignal,
// ): Promise<Coach[]> {
//   const js = await fetchCoachesList({
//     page: 1,
//     limit,
//     view: "mine",
//     signal,
//   });

//   if ((js as any)?.combined) {
//     const mine = (js as any)?.mine?.items;
//     return Array.isArray(mine) ? mine : [];
//   }

//   const items = (js as any)?.items;
//   return Array.isArray(items) ? items : [];
// }

// export async function createCoach(values: Partial<Coach>) {
//   const r = await fetch("/api/admin/coaches", {
//     method: "POST",
//     headers: { "content-type": "application/json" },
//     body: JSON.stringify(values),
//   });

//   const js = await readJson(r);
//   if (!r.ok || js?.ok === false) throw new Error(js?.error || "Create failed.");
//   return js?.item as Coach;
// }

// export async function updateCoach(slug: string, values: Partial<Coach>) {
//   const r = await fetch(`/api/admin/coaches/${encodeURIComponent(slug)}`, {
//     method: "PATCH",
//     headers: { "content-type": "application/json" },
//     body: JSON.stringify(values),
//   });

//   const js = await readJson(r);
//   if (!r.ok || js?.ok === false) throw new Error(js?.error || "Save failed.");
//   return js?.item as Coach;
// }

// export async function submitCoachForReview(slug: string) {
//   const r = await fetch(`/api/admin/coaches/${encodeURIComponent(slug)}`, {
//     method: "PATCH",
//     headers: { "content-type": "application/json" },
//     body: JSON.stringify({ submitForReview: true }),
//   });

//   const js = await readJson(r);
//   if (!r.ok || js?.ok === false) throw new Error(js?.error || "Submit failed.");
//   return js?.item as Coach;
// }

// export async function rejectCoach(slug: string, reason: string) {
//   const r = await fetch(`/api/admin/coaches/${encodeURIComponent(slug)}`, {
//     method: "PATCH",
//     headers: { "content-type": "application/json" },
//     body: JSON.stringify({ status: "rejected", rejectionReason: reason }),
//   });

//   const js = await readJson(r);
//   if (!r.ok || js?.ok === false) throw new Error(js?.error || "Reject failed.");
//   return js?.item as Coach;
// }

// export async function approveCoach(slug: string) {
//   const r = await fetch(`/api/admin/coaches/${encodeURIComponent(slug)}`, {
//     method: "PATCH",
//     headers: { "content-type": "application/json" },
//     body: JSON.stringify({ status: "approved", published: true }),
//   });

//   const js = await readJson(r);
//   if (!r.ok || js?.ok === false)
//     throw new Error(js?.error || "Approve failed.");
//   return js?.item as Coach;
// }

// export async function deleteCoach(slug: string) {
//   const r = await fetch(`/api/admin/coaches/${encodeURIComponent(slug)}`, {
//     method: "DELETE",
//   });

//   const js = await readJson(r);
//   if (!r.ok || js?.ok === false) throw new Error(js?.error || "Delete failed.");
//   return true;
// }

// //src\app\admin\(app)\coaches\api.ts
// import type { Coach, ListResp, Me } from "./types";

// export async function fetchMe(signal?: AbortSignal): Promise<Me | null> {
//   const r = await fetch("/api/admin/auth/me", { cache: "no-store", signal });
//   const js = await r.json().catch(() => null);
//   if (!js?.ok || !js?.user?.id) return null;
//   return {
//     id: String(js.user.id),
//     isSuperAdmin: Boolean(js.user.isSuperAdmin),
//   };
// }

// export async function fetchAllCoaches(
//   limit: number,
//   signal?: AbortSignal,
// ): Promise<Coach[]> {
//   const r = await fetch(`/api/admin/coaches?limit=${limit}&page=1`, {
//     cache: "no-store",
//     signal,
//   });
//   const js = (await r.json().catch(() => null)) as ListResp | null;
//   if (!r.ok || !js?.ok) throw new Error(js?.error || "Could not load coaches.");
//   return Array.isArray(js.items) ? js.items : [];
// }

// export async function createCoach(values: Partial<Coach>) {
//   const r = await fetch("/api/admin/coaches", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(values),
//   });
//   const js = await r.json().catch(() => null);
//   if (!r.ok || js?.ok === false) throw new Error(js?.error || "Create failed.");
//   return js?.item as Coach;
// }

// export async function updateCoach(slug: string, values: Partial<Coach>) {
//   const r = await fetch(`/api/admin/coaches/${encodeURIComponent(slug)}`, {
//     method: "PATCH",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(values),
//   });
//   const js = await r.json().catch(() => null);
//   if (!r.ok || js?.ok === false) throw new Error(js?.error || "Save failed.");
//   return js?.item as Coach;
// }

// export async function rejectCoach(slug: string, reason: string) {
//   const r = await fetch(`/api/admin/coaches/${encodeURIComponent(slug)}`, {
//     method: "PATCH",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ published: false, rejectionReason: reason }),
//   });

//   const js = await r.json().catch(() => null);
//   if (!r.ok || js?.ok === false) throw new Error(js?.error || "Reject failed.");
// }

// export async function deleteCoach(slug: string) {
//   const r = await fetch(`/api/admin/coaches/${encodeURIComponent(slug)}`, {
//     method: "DELETE",
//   });
//   const js = await r.json().catch(() => null);
//   if (!r.ok || js?.ok === false) throw new Error(js?.error || "Delete failed.");
// }
