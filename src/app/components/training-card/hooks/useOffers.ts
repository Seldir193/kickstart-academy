//src\app\components\training-card\hooks\useOffers.ts
"use client";

import { useEffect } from "react";
import type { Offer, OffersResponse } from "../types";
import { buildOffersQueryParams } from "../utils";

export function useOffers(args: {
  q: string;
  courseValue: string;
  locationFilter: string;
  page: number;
  limit: number;
  refreshTick: number;
  setLoading: (v: boolean) => void;
  setItems: (v: Offer[]) => void;
  setTotal: (v: number) => void;
  setSelectedIds: (v: string[]) => void;
}) {
  const {
    q,
    courseValue,
    locationFilter,
    page,
    limit,
    refreshTick,
    setLoading,
    setItems,
    setTotal,
    setSelectedIds,
  } = args;

  useEffect(() => {
    const ctrl = new AbortController();

    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const params = buildOffersQueryParams({
          q,
          locationFilter,
          page,
          limit,
          courseValue,
        });

        const r = await fetch(`/api/admin/offers?${params.toString()}`, {
          cache: "no-store",
          signal: ctrl.signal,
        });

        if (!r.ok) {
          setItems([]);
          setTotal(0);
        } else {
          const raw = await r.json().catch(() => ({}));

          const d: OffersResponse = Array.isArray(raw)
            ? { items: raw as Offer[], total: (raw as Offer[]).length }
            : {
                items: Array.isArray(raw.items) ? raw.items : [],
                total: Number(raw.total || 0),
              };

          setItems(d.items);
          setTotal(d.total);
          setSelectedIds([]);
        }
      } catch {
        setItems([]);
        setTotal(0);
        setSelectedIds([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, courseValue, locationFilter, page, limit, refreshTick]);
}
