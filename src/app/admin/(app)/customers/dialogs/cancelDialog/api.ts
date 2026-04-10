//src\app\admin\(app)\customers\dialogs\cancelDialog\api.ts
import type { Customer } from "../../types";

export async function fetchOffers(limit: number) {
  const res = await fetch(`/api/admin/offers?limit=${limit}`, {
    cache: "no-store",
    credentials: "include",
  });
  const data = res.ok ? await res.json() : [];
  const list = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data)
      ? data
      : [];
  return list as any[];
}

export async function postCancel(
  customerId: string,
  bookingId: string,
  date: string,
  endDate: string,
  reason: string,
) {
  const r = await fetch(
    `/api/admin/customers/${encodeURIComponent(customerId)}/bookings/${encodeURIComponent(bookingId)}/cancel`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ date, endDate, reason }),
    },
  );
  if (r.ok) return;
  const t = await r.text().catch(() => "");
  throw new Error(`Cancel failed (${r.status}) ${t}`);
}

export async function fetchCustomer(customerId: string) {
  const r2 = await fetch(
    `/api/admin/customers/${encodeURIComponent(customerId)}`,
    {
      cache: "no-store",
      credentials: "include",
    },
  );
  return r2.ok ? ((await r2.json()) as Customer) : null;
}
