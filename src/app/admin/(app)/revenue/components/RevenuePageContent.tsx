"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRevenueData } from "../hooks/useRevenueData";
import { useRevenueDropdowns } from "../hooks/useRevenueDropdowns";
import { useRevenueMetrics } from "../hooks/useRevenueMetrics";
import type { SourceMode } from "../types";
import RevenuePageView from "./page/RevenuePageView";
import type { YearView } from "./page/revenuePage.types";

export default function RevenuePageContent() {
  const { t } = useTranslation();
  const [source, setSource] = useState<SourceMode>("invoices");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(-1);
  const [yearView, setYearView] = useState<YearView>("all");
  const { data, loading, yearlyTotals } = useRevenueData(source, year);
  const dd = useRevenueDropdowns();
  const vm = useRevenueMetrics(data, month, year, yearView, yearlyTotals, t);
  return (
    <RevenuePageView
      {...{ t, source, setSource, year, setYear, month, setMonth }}
      {...{ yearView, setYearView, loading, data, yearlyTotals, dd, vm }}
    />
  );
}
