//src\app\admin\(app)\online-bookings\hooks\useOnlineBookingsList.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Booking, ProgramFilter, Status, StatusOrAll } from "../types";
import { buildQuery, fetchOnlineBookings, PAGE_SIZE } from "../api";
import { useTranslation } from "react-i18next";

type Counts = Partial<Record<Status, number>>;

export function useOnlineBookingsList(params: {
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
  const { t } = useTranslation();

  const limit = PAGE_SIZE;

  const query = useMemo(
    () =>
      buildQuery({
        status: params.status,
        program: params.program,
        q: params.q,
        page: params.page,
        limit,
      }),
    [params.status, params.program, params.q, params.page, limit],
  );

  const pages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit],
  );

  const shouldRememberTotalAll = useMemo(
    () => params.status === "all" && !params.q.trim(),
    [params.status, params.q],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchOnlineBookings(query);
      const arr = Array.isArray(data.bookings) ? data.bookings : [];
      const t = typeof data.total === "number" ? data.total : arr.length;

      setItems(arr);
      setTotal(t);
      if (data.counts) setCounts(data.counts);
      if (shouldRememberTotalAll) setTotalAll(t);
    } catch (e) {
      setItems([]);
      setTotal(0);
      setCounts({});
      // setError(e instanceof Error ? e.message : "Load failed");
      setError(
        e instanceof Error
          ? e.message
          : t("common.admin.onlineBookings.error.loadFailed"),
      );
    } finally {
      setLoading(false);
    }
  }, [query, shouldRememberTotalAll]);

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
