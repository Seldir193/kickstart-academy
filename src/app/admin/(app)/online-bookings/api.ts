//src\app\admin\(app)\online-bookings\api.ts
"use client";

import type { ListResp, ProgramFilter, Status, StatusOrAll } from "./types";

export const PAGE_SIZE = 10;

export function buildQuery(params: {
  program: ProgramFilter;
  status: StatusOrAll;
  q: string;
  page: number;
  limit: number;
}) {
  const p = new URLSearchParams();
  p.set("program", params.program);
  if (params.status !== "all") p.set("status", params.status);
  if (params.q.trim()) p.set("q", params.q.trim());
  p.set("page", String(params.page));
  p.set("limit", String(params.limit));
  return p.toString();
}

async function readJson<T>(r: Response): Promise<T> {
  return (await r.json().catch(() => ({}))) as T;
}

export async function fetchOnlineBookings(query: string) {
  const r = await fetch(`/api/admin/online-bookings?${query}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  const data = await readJson<ListResp>(r);
  if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
  return data;
}

export async function confirmBooking(id: string, resend: boolean) {
  const params = new URLSearchParams();
  if (resend) params.set("resend", "1");
  params.set("withInvoice", "1");

  const url = `/api/admin/bookings/${encodeURIComponent(
    id,
  )}/confirm?${params.toString()}`;

  const r = await fetch(url, { method: "POST", credentials: "include" });
  const d = await readJson<any>(r);
  if (!r.ok || d?.ok === false) throw new Error(d?.error || r.statusText);

  return resend
    ? "Bestätigung erneut gesendet."
    : "Buchung bestätigt + Rechnung geschickt.";
}

export async function setBookingStatus(id: string, next: Status) {
  const url = `/api/admin/bookings/${encodeURIComponent(id)}/status`;
  const r = await fetch(url, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: next }),
  });
  const d = await readJson<any>(r);
  if (!r.ok || d?.ok === false) throw new Error(d?.error || r.statusText);
  return "Status aktualisiert.";
}

export async function deleteBooking(id: string) {
  const r = await fetch(`/api/admin/bookings/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
  const d = await readJson<any>(r);
  if (!r.ok || d?.ok === false) throw new Error(d?.error || r.statusText);
  return "Buchung gelöscht.";
}

export async function cancelConfirmedBooking(id: string) {
  const r = await fetch(
    `/api/admin/bookings/${encodeURIComponent(id)}/cancel-confirmed`,
    { method: "POST", credentials: "include", cache: "no-store" },
  );
  const d = await readJson<any>(r);
  if (!r.ok || d?.ok === false) throw new Error(d?.error || r.statusText);
  return "Termin abgesagt.";
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
}

export async function deleteBookingsBulk(ids: string[]) {
  const results = await Promise.allSettled(ids.map((id) => deleteBooking(id)));
  const failed = results.filter((x) => x.status === "rejected");
  if (!failed.length) return;
  const first = failed[0] as PromiseRejectedResult;
  throw first.reason instanceof Error
    ? first.reason
    : new Error("Delete failed");
}

export async function restoreBookingsBulk(ids: string[]) {
  const results = await Promise.allSettled(ids.map((id) => restoreBooking(id)));
  const failed = results.filter((x) => x.status === "rejected");
  if (!failed.length) return;
  const first = failed[0] as PromiseRejectedResult;
  throw first.reason instanceof Error
    ? first.reason
    : new Error("Restore failed");
}

export async function approvePayment(id: string) {
  const r = await fetch(
    `/api/admin/bookings/${encodeURIComponent(id)}/approve-payment`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    },
  );
  const d = await readJson<any>(r);
  if (!r.ok || d?.ok === false) throw new Error(d?.error || r.statusText);
  return "Zahlung freigegeben.";
}
