"use client";

import { useEffect } from "react";

let cachedCities: string[] | null = null;
let inFlight: Promise<string[]> | null = null;
let cachedAt = 0;

async function fetchCities(signal: AbortSignal) {
  const r = await fetch("/api/admin/places?page=1&pageSize=50", {
    cache: "no-store", // bleibt wie bei dir
    signal,
  });

  const j = await r.json().catch(() => ({}));
  const arr: any[] = Array.isArray(j?.items) ? j.items : [];

  const cityList = arr
    .map((p) => String(p?.city ?? "").trim())
    .filter((s) => s.length > 0);

  return Array.from(new Set(cityList)).sort((a, b) => a.localeCompare(b));
}

export function useCities(args: { setLocations: (v: string[]) => void }) {
  const { setLocations } = args;

  useEffect(() => {
    const ctrl = new AbortController();

    const CACHE_MS = 5 * 60 * 1000; // 5 Minuten
    const now = Date.now();

    // ✅ Cache verwenden (Output bleibt identisch, nur schneller)
    if (cachedCities && now - cachedAt < CACHE_MS) {
      setLocations(cachedCities);
      return () => ctrl.abort();
    }

    // ✅ Single-flight: wenn schon ein Request läuft, denselben nutzen
    const p =
      inFlight ??
      (inFlight = fetchCities(ctrl.signal).finally(() => {
        inFlight = null;
      }));

    p.then((unique) => {
      cachedCities = unique;
      cachedAt = Date.now();
      setLocations(unique);
    }).catch(() => {
      setLocations([]);
    });

    return () => ctrl.abort();
  }, [setLocations]);
}
