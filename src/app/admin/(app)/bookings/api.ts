//src\app\admin\(app)\bookings\api.ts
"use client";

import type { ListResp, ProgramFilter, Status, StatusOrAll } from "./types";

export const pageSize = 10;

export function buildQuery(params: {
  program: ProgramFilter;
  status: StatusOrAll;
  q: string;
  page: number;
  limit: number;
}) {
  const p = new URLSearchParams();
  if (params.program !== "all") p.set("program", params.program);
  if (params.status !== "all") p.set("status", params.status);
  if (params.q.trim()) p.set("q", params.q.trim());
  p.set("page", String(params.page));
  p.set("limit", String(params.limit));
  return p.toString();
}

async function readJson<T>(r: Response): Promise<T> {
  return (await r.json().catch(() => ({}))) as T;
}

export async function fetchBookings(query: string) {
  const r = await fetch(`/api/admin/bookings?${query}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  const d = await readJson<ListResp>(r);
  if (!r.ok) throw new Error(d?.error || `HTTP ${r.status}`);
  return d;
}

export async function fetchBookingDetails(id: string) {
  const r = await fetch(`/api/admin/bookings/${encodeURIComponent(id)}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  const d = await readJson<any>(r);
  if (!r.ok || d?.ok === false) throw new Error(d?.error || r.statusText);
  return d;
}

export async function confirmBooking(
  id: string,
  resend: boolean,
  manual = false,
) {
  const p = new URLSearchParams();
  if (resend) p.set("resend", "1");
  if (manual) p.set("manual", "1");

  const r = await fetch(
    `/api/admin/bookings/${encodeURIComponent(id)}/confirm?${p.toString()}`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    },
  );

  const d = await readJson<any>(r);
  if (!r.ok || d?.ok === false) throw new Error(d?.error || r.statusText);
  return resend ? "Confirmation resent." : "Booking confirmed.";
}

export async function setBookingStatus(id: string, next: Status) {
  const r = await fetch(
    `/api/admin/bookings/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    },
  );
  const d = await readJson<any>(r);
  if (!r.ok || d?.ok === false) throw new Error(d?.error || r.statusText);
  return "Status updated.";
}

export async function deleteBooking(id: string) {
  const r = await fetch(`/api/admin/bookings/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
  const d = await readJson<any>(r);
  if (!r.ok || d?.ok === false) throw new Error(d?.error || r.statusText);
  return "Booking deleted.";
}

export async function restoreBooking(id: string) {
  const r = await fetch(
    `/api/admin/bookings/${encodeURIComponent(id)}/restore`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    },
  );
  const d = await readJson<any>(r);
  if (!r.ok || d?.ok === false) throw new Error(d?.error || r.statusText);
  return "Booking restored.";
}

export async function cancelConfirmedBooking(id: string) {
  const r = await fetch(
    `/api/admin/bookings/${encodeURIComponent(id)}/cancel-confirmed`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    },
  );
  const d = await readJson<any>(r);
  if (!r.ok || d?.ok === false) throw new Error(d?.error || r.statusText);
  return "Confirmed booking cancelled.";
}

export async function deleteBulk(ids: string[]) {
  await runAll(ids.map((id) => () => deleteBooking(id)));
}

export async function restoreBulk(ids: string[]) {
  await runAll(ids.map((id) => () => restoreBooking(id)));
}

async function runAll(tasks: Array<() => Promise<unknown>>) {
  const res = await Promise.allSettled(tasks.map((t) => t()));
  const first = res.find((x) => x.status === "rejected") as
    | PromiseRejectedResult
    | undefined;
  if (!first) return;
  throw first.reason instanceof Error
    ? first.reason
    : new Error("Bulk action failed");
}

export async function setSubscriptionEligible(params: {
  id: string;
  eligible: boolean;
}) {
  const res = await fetch(
    `/api/admin/bookings/${encodeURIComponent(params.id)}/subscription-eligible`,
    {
      method: "PATCH",
      credentials: "include",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eligible: params.eligible }),
    },
  );

  const data = await res.json().catch(() => null);
  if (!res.ok)
    throw new Error(data?.error || data?.message || "Request failed");
  return data;
}

export async function weeklyApproveBooking(id: string) {
  const res = await fetch(
    `/api/admin/bookings/${encodeURIComponent(id)}/weekly-approve`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    },
  );

  const data = await res.json().catch(() => null);
  if (!res.ok)
    throw new Error(data?.error || data?.message || "Request failed");
  return data;
}
