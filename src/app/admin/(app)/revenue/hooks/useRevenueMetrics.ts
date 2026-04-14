"use client";

import { useMemo } from "react";
import { MAX_Y, MONTHS, STEP } from "../constants";
import type { MonthRow, RevenueResponse, YearlyRow } from "../types";
import { ceilToStep, getMonthDefaultLabel, getMonthLabel } from "../utils";

export function useRevenueMetrics(
  data: RevenueResponse | null,
  month: number,
  year: number,
  yearView: "all" | number,
  yearlyTotals: YearlyRow[],
  t: any,
) {
  const monthRows = useMemo(
    () => buildMonthRows(data, month, t),
    [data, month, t],
  );
  const monthMaxValue = useMemo(
    () => getMonthMaxValue(data, month),
    [data, month],
  );
  const totalDisplayed = useMemo(
    () => getTotalDisplayed(data, month),
    [data, month],
  );
  const yearlyRows = useMemo(
    () => getYearlyRows(yearlyTotals, yearView),
    [yearlyTotals, yearView],
  );
  const highlightedYearLabel = useMemo(
    () => getHighlightedYearLabel(year, yearView),
    [year, yearView],
  );
  const yearMaxValue = useMemo(() => getYearMaxValue(yearlyRows), [yearlyRows]);
  const monthLabel = getMonthLabel(month, t);

  return buildMetrics(
    monthRows,
    totalDisplayed,
    yearlyRows,
    highlightedYearLabel,
    monthMaxValue,
    yearMaxValue,
    monthLabel,
  );
}

function buildMonthRows(data: RevenueResponse | null, month: number, t: any) {
  const arr = Array.isArray(data?.monthly) ? data!.monthly : Array(12).fill(0);
  const rows = MONTHS.map((m, i) => ({
    index: i,
    name: t(`common.admin.revenue.months.${m}`, {
      defaultValue: getMonthDefaultLabel(m),
    }),
    revenue: Number(arr[i] || 0),
  }));
  return month >= 0 ? rows.filter((_, i) => i === month) : rows;
}

function getMonthMaxValue(data: RevenueResponse | null, month: number) {
  const arr = Array.isArray(data?.monthly) ? data!.monthly : Array(12).fill(0);
  return Math.max(
    0,
    ...(month >= 0
      ? [Number(arr[month] || 0)]
      : arr.map((n) => Number(n) || 0)),
  );
}

function getTotalDisplayed(data: RevenueResponse | null, month: number) {
  if (!Array.isArray(data?.monthly)) return 0;
  return month >= 0
    ? Number(data!.monthly[month] || 0)
    : Number(data!.total || 0);
}

function getYearlyRows(yearlyTotals: YearlyRow[], yearView: "all" | number) {
  if (!yearlyTotals.length) return [];
  if (yearView === "all") return yearlyTotals;
  const hit = yearlyTotals.find((r) => r.name === String(yearView));
  return hit ? [hit] : [];
}

function getHighlightedYearLabel(year: number, yearView: "all" | number) {
  return yearView === "all" ? String(year) : String(yearView);
}

function getYearMaxValue(rows: YearlyRow[]) {
  if (!rows.length) return 0;
  return Math.max(0, ...rows.map((r) => Number(r.total) || 0));
}

function buildMetrics(
  monthRows: MonthRow[],
  totalDisplayed: number,
  yearlyRows: YearlyRow[],
  highlightedYearLabel: string,
  monthMaxValue: number,
  yearMaxValue: number,
  monthLabel: string,
) {
  const yMaxMonthly = Math.max(MAX_Y, ceilToStep(monthMaxValue, STEP));
  const yMaxYearly = Math.max(MAX_Y, ceilToStep(yearMaxValue, STEP));
  const monthTickCount = Math.min(
    8,
    Math.max(4, Math.ceil(yMaxMonthly / 2000) + 1),
  );
  const yearTickCount = Math.min(
    8,
    Math.max(4, Math.ceil(yMaxYearly / 2000) + 1),
  );
  return {
    monthRows,
    totalDisplayed,
    yearlyRows,
    highlightedYearLabel,
    yMaxMonthly,
    yMaxYearly,
    monthTickCount,
    yearTickCount,
    monthLabel,
  };
}
