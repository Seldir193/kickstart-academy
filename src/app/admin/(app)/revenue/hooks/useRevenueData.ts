"use client";

import { useEffect, useState } from "react";
import type { RevenueResponse, SourceMode, YearlyRow } from "../types";
import {
  buildHeaders,
  buildYearlyRow,
  getEndpointBase,
  getFallbackRevenue,
  getProviderId,
  getRecentFiveYears,
  getRevenueUrl,
} from "../utils";

export function useRevenueData(source: SourceMode, year: number) {
  const [data, setData] = useState<RevenueResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [yearlyTotals, setYearlyTotals] = useState<YearlyRow[]>([]);
  const endpointBase = getEndpointBase(source);

  useEffect(() => {
    loadCurrentYear(endpointBase, year, setData, setLoading);
  }, [endpointBase, year]);

  useEffect(() => {
    loadYearlyTotals(endpointBase, setYearlyTotals);
  }, [endpointBase]);

  return { data, loading, yearlyTotals, endpointBase };
}

function loadCurrentYear(
  base: string,
  year: number,
  setData: any,
  setLoading: any,
) {
  const pid = getProviderId();
  const url = getRevenueUrl(base, year, pid);
  setLoading(true);
  fetch(url, { credentials: "include", headers: buildHeaders(pid) })
    .then((r) => r.json())
    .then((json: RevenueResponse) => setData(json))
    .catch((err) => console.error("Revenue fetch failed", err))
    .finally(() => setLoading(false));
}

function loadYearlyTotals(base: string, setYearlyTotals: any) {
  const years = getRecentFiveYears();
  const pid = getProviderId();
  Promise.all(years.map((year) => fetchYear(base, year, pid))).then((rows) => {
    setYearlyTotals(years.map((year, idx) => buildYearlyRow(year, rows[idx])));
  });
}

function fetchYear(base: string, year: number, pid: string) {
  const url = getRevenueUrl(base, year, pid);
  return fetch(url, { credentials: "include", headers: buildHeaders(pid) })
    .then((r) => r.json())
    .catch(() => getFallbackRevenue());
}
