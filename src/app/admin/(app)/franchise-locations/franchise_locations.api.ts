//src\app\admin\(app)\franchise-locations\franchise_locations.api.ts
"use client";

import type { FranchiseLocation, LocationPayload } from "./types";

type MeUser = { role?: string | null; isSuperAdmin?: boolean };
type ApiAny = any;

function cleanQuery(query: string) {
  const q = String(query || "").trim();
  if (!q) return "";
  return q.startsWith("?") ? q : `?${q}`;
}

function toError(d: any, status: number) {
  const msg = typeof d?.error === "string" ? d.error : `HTTP ${status}`;
  return new Error(msg);
}

async function readJson(r: Response) {
  try {
    return await r.json();
  } catch {
    return {};
  }
}

async function assertOk(r: Response) {
  const d = (await readJson(r)) as ApiAny;
  if (!r.ok || d?.ok === false) throw toError(d, r.status);
  return d;
}

async function req(url: string, init?: RequestInit) {
  const r = await fetch(url, { credentials: "include", ...init });
  return await assertOk(r);
}

function pickLocationPayload(p: LocationPayload) {
  const src: any = p || {};
  return {
    licenseeFirstName: src.licenseeFirstName,
    licenseeLastName: src.licenseeLastName,
    country: src.country,
    city: src.city,
    state: src.state,
    address: src.address,
    zip: src.zip,
    website: src.website,
    emailPublic: src.emailPublic,
    phonePublic: src.phonePublic,
  };
}

export async function fetchMe(): Promise<MeUser | null> {
  try {
    const r = await fetch("/api/admin/auth/me", { cache: "no-store" });
    const d = await readJson(r);
    return d?.user || null;
  } catch {
    return null;
  }
}

export async function fetchAdmin(query = "") {
  const qs = cleanQuery(query);
  return await req(`/api/admin/franchise-locations${qs}`, {
    cache: "no-store",
  });
}

export async function fetchMine(): Promise<FranchiseLocation[]> {
  const d = await fetchAdmin("view=mine");
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.mine?.items)) return d.mine.items;
  return [];
}

export async function createMine(payload: LocationPayload) {
  await req("/api/admin/franchise-locations", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
}

export async function updateMine(id: string, payload: LocationPayload) {
  await req(`/api/admin/franchise-locations/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(pickLocationPayload(payload || ({} as any))),
  });
}

export async function deleteMine(id: string) {
  await req(`/api/admin/franchise-locations/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function patchAdmin(id: string, body: Record<string, any>) {
  return await req(`/api/admin/franchise-locations/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body || {}),
  });
}

export async function deleteAdmin(id: string) {
  await req(`/api/admin/franchise-locations/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function submitForReview(id: string) {
  return await patchAdmin(id, { submitForReview: true });
}

export async function setPublished(id: string, published: boolean) {
  return await patchAdmin(id, { published: Boolean(published) });
}

export async function approve(id: string) {
  return await patchAdmin(id, { approve: true });
}

export async function reject(id: string, rejectionReason: string) {
  return await patchAdmin(id, { status: "rejected", rejectionReason });
}
