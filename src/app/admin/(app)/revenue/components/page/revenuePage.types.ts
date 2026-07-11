import type { Dispatch, SetStateAction } from "react";
import type { TFunction } from "i18next";
import type { RevenueResponse, SourceMode, YearlyRow } from "../../types";

export type YearView = "all" | number;

export type RevenueDropdownState = ReturnType<
  typeof import("../../hooks/useRevenueDropdowns").useRevenueDropdowns
>;

export type RevenueMetrics = ReturnType<
  typeof import("../../hooks/useRevenueMetrics").useRevenueMetrics
>;

export type RevenuePageProps = {
  t: TFunction;
  source: SourceMode;
  setSource: Dispatch<SetStateAction<SourceMode>>;
  year: number;
  setYear: Dispatch<SetStateAction<number>>;
  month: number;
  setMonth: Dispatch<SetStateAction<number>>;
  yearView: YearView;
  setYearView: Dispatch<SetStateAction<YearView>>;
  loading: boolean;
  data: RevenueResponse | null;
  yearlyTotals: YearlyRow[];
  dd: RevenueDropdownState;
  vm: RevenueMetrics;
};
