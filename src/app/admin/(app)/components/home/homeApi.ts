import { sortByUpdatedDesc } from "./homeHelpers";
import type { AdminHomeCounts, OffersResponse } from "./types";

async function fetchJson<T>(url: string, fallback: T) {
  const response = await fetch(url, { cache: "no-store", credentials: "include" });
  return response.json().catch(() => fallback) as Promise<T>;
}

async function fetchCount(url: string) {
  try {
    const json = await fetchJson<{ total?: number }>(url, {});
    return Number(json?.total || 0);
  } catch {
    return 0;
  }
}

export async function fetchAdminHomeCounts(): Promise<AdminHomeCounts> {
  return { onlineCount: await fetchCount("/api/admin/offers?onlineActive=true&limit=1"), placesCount: await fetchCount("/api/admin/places?limit=1"), newsletterLeads: await fetchCount("/api/admin/customers?tab=newsletter&limit=1"), openBookingsCount: await fetchCount("/api/admin/bookings?status=pending&limit=1") };
}

export async function fetchAdminName() {
  const json = await fetchJson<{ ok?: boolean; user?: Record<string, string> }>("/api/admin/auth/me", {});
  if (!json?.ok || !json?.user) return "";
  return json.user.fullName || json.user.displayName || json.user.email || "";
}

export async function fetchRecentOffers(page: number, limit: number) {
  const url = `/api/admin/offers?page=${page}&limit=${limit}`;
  const json = await fetchJson<OffersResponse>(url, { items: [], total: 0 });
  const items = Array.isArray(json?.items) ? json.items : [];
  return { items: sortByUpdatedDesc(items), total: Number(json?.total || items.length) };
}
