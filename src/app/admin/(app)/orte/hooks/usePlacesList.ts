"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Place } from "@/types/place";
import { fetchPlaces } from "@/app/admin/(app)/orte/api";
import { toastErrorMessage } from "@/lib/toast-messages";

type SortKey = "newest" | "oldest" | "city_asc" | "city_desc";

type Params = {
  page: number;
  q: string;
  sort: SortKey;
};

export function usePlacesList({ page, q, sort }: Params) {
  const { t } = useTranslation();
  const state = usePlacesListState();
  const pageSize = 10;
  const pageCount = useMemo(() => Math.max(1, Math.ceil(state.total / pageSize)), [state.total]);
  const load = useCallback(async () => {
    await loadPlaces({ page, pageSize, q, sort, t, setItems: state.setItems, setTotal: state.setTotal, setError: state.setError, setLoading: state.setLoading });
  }, [page, pageSize, q, sort, t, state.setItems, state.setTotal, state.setError, state.setLoading]);
  usePlacesReload(load);
  return { items: state.items, total: state.total, loading: state.loading, error: state.error, reload: load, pageCount };
}

function usePlacesListState() {
  const [items, setItems] = useState<Array<Place & { publicId?: number }>>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return { items, setItems, total, setTotal, loading, setLoading, error, setError };
}

function usePlacesReload(load: () => Promise<void>) {
  useEffect(() => {
    const timer = setTimeout(load, 150);
    return () => clearTimeout(timer);
  }, [load]);
}

type LoadPlacesArgs = Params & {
  pageSize: number;
  t: ReturnType<typeof useTranslation>["t"];
  setItems: (items: Array<Place & { publicId?: number }>) => void;
  setTotal: (total: number) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
};

async function loadPlaces(args: LoadPlacesArgs) {
  args.setLoading(true);
  args.setError(null);
  try {
    await applyPlacesResponse(args);
  } catch (error) {
    applyPlacesError(args, error);
  } finally {
    args.setLoading(false);
  }
}

async function applyPlacesResponse(args: LoadPlacesArgs) {
  const response = await fetchPlaces(args);
  args.setItems(response.items);
  args.setTotal(response.total);
}

function applyPlacesError(args: LoadPlacesArgs, error: unknown) {
  args.setItems([]);
  args.setTotal(0);
  args.setError(toastErrorMessage(args.t, error, "common.admin.places.errors.loadFailed"));
}
