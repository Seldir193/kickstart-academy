"use client";

import type { ListResp } from "./types";

export const PAGE_SIZE = 10;

function toQuery(params: { q: string; status: "all" | "active" | "inactive" }) {
  const p = new URLSearchParams();
  if (params.q.trim()) p.set("q", params.q.trim());
  if (params.status !== "all") p.set("status", params.status);
  return p.toString();
}

async function readJson<T>(r: Response): Promise<T> {
  return (await r.json().catch(() => ({}))) as T;
}

export async function fetchVouchers(params: {
  q: string;
  status: "all" | "active" | "inactive";
}) {
  const query = toQuery(params);
  const r = await fetch(`/api/admin/vouchers?${query}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  const data = await readJson<ListResp>(r);
  if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
  return data;
}

export async function createVoucher(input: {
  code: string;
  amount: number;
  active: boolean;
}) {
  const r = await fetch("/api/admin/vouchers", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const d = await readJson<any>(r);
  console.log("[createVoucher] status", r.status, d);

  if (!r.ok || d?.ok === false) {
    throw new Error(d?.error || r.statusText);
  }

  return "Voucher created.";
}

// export async function createVoucher(input: {
//   code: string;
//   amount: number;
//   active: boolean;
// }) {
//   const r = await fetch("/api/admin/vouchers", {
//     method: "POST",
//     credentials: "include",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(input),
//   });
//   const d = await readJson<any>(r);
//   if (!r.ok || d?.ok === false) throw new Error(d?.error || r.statusText);
//   return "Voucher created.";
// }

export async function updateVoucherMany(
  ids: string[],
  input: Partial<{ code: string; amount: number; active: boolean }>,
) {
  const results = await Promise.allSettled(
    ids.map((id) => updateVoucher(id, input)),
  );
  const failed = results.filter((x) => x.status === "rejected");
  if (!failed.length) return;
  const first = failed[0] as PromiseRejectedResult;
  throw first.reason instanceof Error
    ? first.reason
    : new Error("Bulk update failed");
}

export async function deleteVoucherMany(ids: string[]) {
  const results = await Promise.allSettled(ids.map((id) => deleteVoucher(id)));
  const failed = results.filter((x) => x.status === "rejected");
  if (!failed.length) return;
  const first = failed[0] as PromiseRejectedResult;
  throw first.reason instanceof Error
    ? first.reason
    : new Error("Bulk delete failed");
}

export async function updateVoucher(
  id: string,
  input: Partial<{ code: string; amount: number; active: boolean }>,
) {
  const r = await fetch(`/api/admin/vouchers/${encodeURIComponent(id)}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const d = await readJson<any>(r);
  if (!r.ok || d?.ok === false) throw new Error(d?.error || r.statusText);
  return "Voucher updated.";
}

export async function deleteVoucher(id: string) {
  const r = await fetch(`/api/admin/vouchers/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
  const d = await readJson<any>(r);
  if (!r.ok || d?.ok === false) throw new Error(d?.error || r.statusText);
  return "Voucher deleted.";
}
