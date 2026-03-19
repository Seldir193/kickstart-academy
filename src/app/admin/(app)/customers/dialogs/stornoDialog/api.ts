//src\app\admin\(app)\customers\dialogs\stornoDialog\api.ts
import type { Customer } from "../../types";

export async function fetchOffers(limit: number) {
  const r = await fetch(`/api/admin/offers?limit=${limit}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  const data = r.ok ? await r.json() : [];
  const list = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data)
      ? data
      : [];
  return list as any[];
}

export async function postStornoStatus(
  customerId: string,
  bookingId: string,
  note: string,
) {
  const r1 = await fetch(
    `/api/admin/customers/${encodeURIComponent(customerId)}/bookings/${encodeURIComponent(bookingId)}/storno`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ note }),
    },
  );
  if (r1.ok || r1.status === 409) return;
  throw new Error(`Storno status failed (${r1.status}) ${await safeText(r1)}`);
}

export async function postStornoMail(
  customerId: string,
  bookingId: string,
  note: string,
) {
  const r2 = await fetch(
    `/api/admin/customers/${encodeURIComponent(customerId)}/bookings/${encodeURIComponent(bookingId)}/email/storno`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ currency: "EUR", note }),
    },
  );
  if (r2.ok) return;
  throw new Error(`Storno mail failed (${r2.status}) ${await safeText(r2)}`);
}

export async function fetchCustomer(customerId: string) {
  const r3 = await fetch(
    `/api/admin/customers/${encodeURIComponent(customerId)}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );
  return r3.ok ? ((await r3.json()) as Customer) : null;
}

async function safeText(r: Response) {
  return r.text().catch(() => "");
}
