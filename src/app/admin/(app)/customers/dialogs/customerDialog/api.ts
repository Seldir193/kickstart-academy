//src\app\admin\(app)\customers\dialogs\customerDialog\api.ts
import type { Customer, Offer } from "../../types";
import type { FamilyApiResponse } from "./types";

export async function toggleNewsletter(
  id: string,
  checked: boolean,
  email?: string,
) {
  const r = await fetch(
    `/api/admin/customers/${encodeURIComponent(id)}/newsletter`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newsletter: checked, email: email || "" }),
    },
  );

  const data = await r.json().catch(() => null);
  if (!r.ok || data?.ok === false) {
    throw new Error(data?.error || `Failed to update newsletter (${r.status})`);
  }
  if (!data?.customer)
    throw new Error("Server did not return updated customer");
  return data.customer as Customer;
}

export async function fetchCustomerById(id: string) {
  const r = await fetch(`/api/admin/customers/${encodeURIComponent(id)}`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!r.ok) throw new Error(`Failed to load customer (${r.status})`);
  return (await r.json()) as Customer;
}

export async function fetchFamily(id: string) {
  const r = await fetch(
    `/api/admin/customers/${encodeURIComponent(id)}/family`,
    {
      cache: "no-store",
      credentials: "include",
    },
  );
  if (!r.ok) throw new Error(`Family load failed (${r.status})`);
  return (await r.json()) as FamilyApiResponse;
}

export async function fetchOffers(limit: number) {
  const res = await fetch(`/api/admin/offers?limit=${limit}`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Failed to load offers (${res.status})`);
  const data = await res.json();
  if (Array.isArray(data.items)) return data.items as Offer[];
  if (Array.isArray(data)) return data as Offer[];
  return [];
}

export async function createCustomer(body: any) {
  const res = await fetch("/api/admin/customers", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Create failed (${res.status})`);
  return await res.json();
}

export async function updateCustomer(id: string, body: any) {
  const res = await fetch(`/api/admin/customers/${encodeURIComponent(id)}`, {
    method: "PUT",
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || data?.ok === false) {
    const msg = data?.error || `Save failed (${res.status} ${res.statusText})`;
    console.error("Customer save failed", msg, data);
    throw new Error(msg);
  }
  return data || {};
}
