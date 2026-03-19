//src\app\admin\(app)\bookings\hooks\useBookingsList.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Booking, ProgramFilter, Status, StatusOrAll } from "../types";
import { buildQuery, fetchBookings, pageSize } from "../api";

type Counts = Partial<Record<Status, number>>;

export function useBookingsList(params: {
  status: StatusOrAll;
  program: ProgramFilter;
  q: string;
  page: number;
}) {
  const [items, setItems] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Counts>({});
  const [totalAll, setTotalAll] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const limit = pageSize;

  const query = useMemo(
    () => buildQuery({ ...params, limit }),
    [params, limit],
  );
  const pages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit],
  );
  const rememberTotalAll = useMemo(
    () => params.status === "all" && !params.q.trim(),
    [params],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBookings(query);
      const arr = normalizeItems(data);
      const t = typeof data.total === "number" ? data.total : arr.length;
      setItems(arr);
      setTotal(t);
      setCounts(data.counts || {});
      if (rememberTotalAll) setTotalAll(t);
    } catch (e) {
      setItems([]);
      setTotal(0);
      setCounts({});
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [query, rememberTotalAll]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    items,
    total,
    pages,
    counts,
    totalAll,
    loading,
    error,
    reload: load,
  };
}

function normalizeItems(data: any): Booking[] {
  const a = Array.isArray(data?.items) ? data.items : [];
  const b = Array.isArray(data?.bookings) ? data.bookings : [];
  return (a.length ? a : b) as Booking[];
}
