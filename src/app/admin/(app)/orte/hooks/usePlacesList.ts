//src\app\admin\(app)\orte\hooks\usePlacesList.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Place } from "@/types/place";
import { fetchPlaces } from "@/app/admin/(app)/orte/api";

type SortKey = "newest" | "oldest" | "city_asc" | "city_desc";

type Params = {
  page: number;
  q: string;
  sort: SortKey;
};

export function usePlacesList({ page, q, sort }: Params) {
  const [items, setItems] = useState<Array<Place & { publicId?: number }>>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 10;
  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPlaces({ page, pageSize, q, sort });
      setItems(res.items as any);
      setTotal(res.total);
    } catch (e) {
      setItems([]);
      setTotal(0);
      setError(e instanceof Error ? e.message : "Load failed.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, q, sort]);

  useEffect(() => {
    const t = setTimeout(load, 150);
    return () => clearTimeout(t);
  }, [load]);

  return { items, total, loading, error, reload: load, pageCount };
}
