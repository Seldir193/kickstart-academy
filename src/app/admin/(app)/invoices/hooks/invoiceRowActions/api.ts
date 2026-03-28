//src\app\admin\(app)\invoices\hooks\invoiceRowActions\api.ts
"use client";

function getProviderIdHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const v =
    localStorage.getItem("providerId") ||
    localStorage.getItem("x-provider-id") ||
    "";
  return v ? { "x-provider-id": v } : {};
}

export async function postJson(url: string, body?: Record<string, unknown>) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getProviderIdHeader() },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false)
    throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

export function postInvoiceAction(
  bookingId: string,
  path: string,
  body?: Record<string, unknown>,
) {
  return postJson(`/api/admin/invoices/${bookingId}/${path}`, body);
}
