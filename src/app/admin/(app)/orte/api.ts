//src\app\admin\(app)\orte\api.ts
"use client";

type SortKey = "newest" | "oldest" | "city_asc" | "city_desc";

export async function fetchPlaces({
  page,
  pageSize,
  q,
  sort,
}: {
  page: number;
  pageSize: number;
  q: string;
  sort: SortKey;
}) {
  const params = new URLSearchParams();
  if (q.trim().length >= 2) params.set("q", q.trim());
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  params.set("limit", String(pageSize));
  params.set("sort", sort);

  const r = await fetch(`/api/admin/places?${params.toString()}`, {
    cache: "no-store",
  });
  const j = await r.json().catch(() => ({}));

  const list: any[] = Array.isArray(j?.items) ? j.items : [];
  const total = Number(j?.total || list.length || 0);

  return { items: list, total };
}

export async function deletePlace(id: string) {
  const r = await fetch(`/api/admin/places/${encodeURIComponent(id)}`, {
    method: "DELETE",
    cache: "no-store",
  });

  if (r.status === 409) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j?.error || "Cannot delete: place is in use.");
  }

  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j?.error || `Delete failed (${r.status})`);
  }
}

export async function deletePlacesBulk(ids: string[]) {
  const results = await Promise.allSettled(ids.map((id) => deletePlace(id)));
  const failed = results.filter((x) => x.status === "rejected");
  if (!failed.length) return;
}
