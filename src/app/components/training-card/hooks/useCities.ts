//src\app\components\training-card\hooks\useCities.ts
"use client";

import { useEffect } from "react";

let cachedCities: string[] | null = null;
let inFlight: Promise<string[]> | null = null;
let cachedAt = 0;

function safeText(value: unknown) {
  return String(value ?? "").trim();
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, "de"));
}

async function readPlacesPage(page: number, signal: AbortSignal) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", "100");
  params.set("limit", "100");

  const response = await fetch(`/api/admin/places?${params.toString()}`, {
    cache: "no-store",
    signal,
  });

  const json = await response.json().catch(() => ({}));
  const items = Array.isArray(json?.items) ? json.items : [];
  const total = Number(json?.total || items.length || 0);

  return { items, total };
}

function citiesFromPlaces(items: any[]) {
  return items.map((item) => safeText(item?.city)).filter(Boolean);
}

async function fetchCities(signal: AbortSignal) {
  const first = await readPlacesPage(1, signal);
  const pageSize = Math.max(1, first.items.length || 100);
  const pageCount = Math.max(1, Math.ceil(first.total / pageSize));

  let allItems = [...first.items];

  for (let page = 2; page <= pageCount; page += 1) {
    const next = await readPlacesPage(page, signal);
    allItems = allItems.concat(next.items);
  }

  return uniqueSorted(citiesFromPlaces(allItems));
}

export function useCities(args: { setLocations: (value: string[]) => void }) {
  const { setLocations } = args;

  useEffect(() => {
    const controller = new AbortController();
    const cacheMs = 5 * 60 * 1000;
    const now = Date.now();

    if (cachedCities && now - cachedAt < cacheMs) {
      setLocations(cachedCities);
      return () => controller.abort();
    }

    const promise =
      inFlight ??
      (inFlight = fetchCities(controller.signal).finally(() => {
        inFlight = null;
      }));

    promise
      .then((cities) => {
        cachedCities = cities;
        cachedAt = Date.now();
        setLocations(cities);
      })
      .catch(() => setLocations([]));

    return () => controller.abort();
  }, [setLocations]);
}

// "use client";

// import { useEffect } from "react";

// let cachedCities: string[] | null = null;
// let inFlight: Promise<string[]> | null = null;
// let cachedAt = 0;

// async function fetchCities(signal: AbortSignal) {
//   const r = await fetch("/api/admin/places?page=1&pageSize=50", {
//     cache: "no-store", // bleibt wie bei dir
//     signal,
//   });

//   const j = await r.json().catch(() => ({}));
//   const arr: any[] = Array.isArray(j?.items) ? j.items : [];

//   const cityList = arr
//     .map((p) => String(p?.city ?? "").trim())
//     .filter((s) => s.length > 0);

//   return Array.from(new Set(cityList)).sort((a, b) => a.localeCompare(b));
// }

// export function useCities(args: { setLocations: (v: string[]) => void }) {
//   const { setLocations } = args;

//   useEffect(() => {
//     const ctrl = new AbortController();

//     const CACHE_MS = 5 * 60 * 1000; // 5 Minuten
//     const now = Date.now();

//     // ✅ Cache verwenden (Output bleibt identisch, nur schneller)
//     if (cachedCities && now - cachedAt < CACHE_MS) {
//       setLocations(cachedCities);
//       return () => ctrl.abort();
//     }

//     // ✅ Single-flight: wenn schon ein Request läuft, denselben nutzen
//     const p =
//       inFlight ??
//       (inFlight = fetchCities(ctrl.signal).finally(() => {
//         inFlight = null;
//       }));

//     p.then((unique) => {
//       cachedCities = unique;
//       cachedAt = Date.now();
//       setLocations(unique);
//     }).catch(() => {
//       setLocations([]);
//     });

//     return () => ctrl.abort();
//   }, [setLocations]);
// }
