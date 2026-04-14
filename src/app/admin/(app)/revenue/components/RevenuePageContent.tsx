"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "@/app/styles/revenue.module.scss";
import { MONTHS } from "../constants";
import { getYears } from "../utils";
import { useRevenueData } from "../hooks/useRevenueData";
import { useRevenueDropdowns } from "../hooks/useRevenueDropdowns";
import { useRevenueMetrics } from "../hooks/useRevenueMetrics";
import RevenueMonthlyChart from "./RevenueMonthlyChart";
import RevenueSelect from "./RevenueSelect";
import RevenueYearlyChart from "./RevenueYearlyChart";

export default function RevenuePageContent() {
  const { t } = useTranslation();
  const [source, setSource] = useState<"invoices" | "derived">("invoices");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(-1);
  const [yearView, setYearView] = useState<"all" | number>("all");
  const { data, loading, yearlyTotals } = useRevenueData(source, year);
  const dd = useRevenueDropdowns();
  const vm = useRevenueMetrics(data, month, year, yearView, yearlyTotals, t);
  return (
    <RevenuePageView
      t={t}
      source={source}
      setSource={setSource}
      year={year}
      setYear={setYear}
      month={month}
      setMonth={setMonth}
      yearView={yearView}
      setYearView={setYearView}
      loading={loading}
      data={data}
      yearlyTotals={yearlyTotals}
      dd={dd}
      vm={vm}
    />
  );
}

function RevenuePageView(props: any) {
  return (
    <div className={styles.pageWrap}>
      <RevenueHeader t={props.t} />
      <div className={styles.container}>
        <RevenueTopFilters {...props} />
        <RevenueLoading loading={props.loading} t={props.t} />
        <RevenueMonthlySection {...props} />
        <RevenueYearlySection {...props} />
      </div>
    </div>
  );
}
function RevenueHeader({ t }: any) {
  return (
    <h1 className="text-2xl font-bold m-0">
      {t("common.admin.revenue.title", { defaultValue: "Revenue overview" })}
    </h1>
  );
}

function RevenueLoading({ loading, t }: any) {
  return loading ? (
    <p className={styles.loading}>
      {t("common.admin.revenue.loading", { defaultValue: "Loading revenue…" })}
    </p>
  ) : null;
}

function RevenueMonthlySection({ loading, data, month, t, vm }: any) {
  if (loading || !data) return null;
  return (
    <>
      <p className={styles.total}>
        {month >= 0
          ? t("common.admin.revenue.total.month", {
              defaultValue: "Monthly revenue",
            })
          : t("common.admin.revenue.total.all", {
              defaultValue: "Total revenue",
            })}
        : {vm.totalDisplayed.toFixed(2)} €
      </p>
      <RevenueMonthlyChart
        counts={data.counts}
        monthRows={vm.monthRows}
        yMaxMonthly={vm.yMaxMonthly}
        monthTickCount={vm.monthTickCount}
      />
    </>
  );
}

function RevenueYearlySection({
  t,
  dd,
  yearView,
  setYearView,
  yearlyTotals,
  vm,
}: any) {
  return (
    <>
      <h2 className={styles.sectionTitle}>
        {t("common.admin.revenue.yearly.title", {
          defaultValue: "Yearly revenue (totals)",
        })}
      </h2>
      <div className={styles.filtersRow}>
        <RevenueYearViewSelect
          t={t}
          dd={dd}
          yearView={yearView}
          setYearView={setYearView}
          yearlyTotals={yearlyTotals}
        />
      </div>
      <RevenueYearlyChart
        name={t("common.admin.revenue.tooltip.revenue", {
          defaultValue: "Revenue",
        })}
        yMaxYearly={vm.yMaxYearly}
        yearTickCount={vm.yearTickCount}
        yearlyRows={vm.yearlyRows}
        highlightedYearLabel={vm.highlightedYearLabel}
      />
    </>
  );
}

function RevenueTopFilters(props: any) {
  return (
    <div className={styles.filtersRow}>
      <RevenueSourceSelect {...props} />
      <RevenueYearSelect {...props} />
      <RevenueMonthSelect {...props} />
    </div>
  );
}

function RevenueSourceSelect({ t, source, setSource, dd }: any) {
  const value =
    source === "invoices"
      ? t("common.admin.revenue.source.invoices", {
          defaultValue: "Invoices (actual)",
        })
      : t("common.admin.revenue.source.derived", {
          defaultValue: "Subscription (derived)",
        });
  return (
    <RevenueSelect
      id="rev-source"
      label={t("common.admin.revenue.filters.source", {
        defaultValue: "Source:",
      })}
      open={dd.sourceOpen}
      value={value}
      innerRef={dd.refs.sourceRef}
      onToggle={() => dd.setSourceOpen((o: boolean) => !o)}
    >
      <RevenueSourceOptions
        t={t}
        source={source}
        setSource={setSource}
        close={() => dd.setSourceOpen(false)}
      />
    </RevenueSelect>
  );
}

function RevenueSourceOptions({ t, source, setSource, close }: any) {
  return (
    <>
      <RevenueOption
        active={source === "invoices"}
        onClick={() => selectValue("invoices", setSource, close)}
      >
        {t("common.admin.revenue.source.invoices", {
          defaultValue: "Invoices (actual)",
        })}
      </RevenueOption>
      <RevenueOption
        active={source === "derived"}
        onClick={() => selectValue("derived", setSource, close)}
      >
        {t("common.admin.revenue.source.derived", {
          defaultValue: "Subscription (derived)",
        })}
      </RevenueOption>
    </>
  );
}

function RevenueYearSelect({ t, year, setYear, dd }: any) {
  return (
    <RevenueSelect
      id="rev-year"
      label={t("common.admin.revenue.filters.year", { defaultValue: "Year:" })}
      open={dd.yearOpen}
      value={String(year)}
      innerRef={dd.refs.yearRef}
      onToggle={() => dd.setYearOpen((o: boolean) => !o)}
    >
      {getYears(7).map((y) => (
        <RevenueOption
          key={y}
          active={year === y}
          onClick={() => selectValue(y, setYear, () => dd.setYearOpen(false))}
        >
          {y}
        </RevenueOption>
      ))}
    </RevenueSelect>
  );
}

function RevenueMonthSelect({ t, month, setMonth, dd, vm }: any) {
  return (
    <RevenueSelect
      id="rev-month"
      label={t("common.admin.revenue.filters.month", {
        defaultValue: "Month:",
      })}
      open={dd.monthOpen}
      value={vm.monthLabel}
      innerRef={dd.refs.monthRef}
      onToggle={() => dd.setMonthOpen((o: boolean) => !o)}
      month
    >
      <RevenueOption
        active={month === -1}
        onClick={() => selectValue(-1, setMonth, () => dd.setMonthOpen(false))}
      >
        {t("common.admin.revenue.months.all", { defaultValue: "All months" })}
      </RevenueOption>
      {MONTHS.map((m, i) => (
        <RevenueOption
          key={m}
          active={month === i}
          onClick={() => selectValue(i, setMonth, () => dd.setMonthOpen(false))}
        >
          {t(`common.admin.revenue.months.${m}`, {
            defaultValue: m.toUpperCase(),
          })}
        </RevenueOption>
      ))}
    </RevenueSelect>
  );
}

function RevenueYearViewSelect({
  t,
  dd,
  yearView,
  setYearView,
  yearlyTotals,
}: any) {
  const value =
    yearView === "all"
      ? t("common.admin.revenue.yearly.allYears", { defaultValue: "All years" })
      : String(yearView);
  return (
    <RevenueSelect
      id="rev-year-view"
      label={t("common.admin.revenue.filters.view", { defaultValue: "View:" })}
      open={dd.yearViewOpen}
      value={value}
      innerRef={dd.refs.yearViewRef}
      onToggle={() => dd.setYearViewOpen((o: boolean) => !o)}
    >
      <RevenueOption
        active={yearView === "all"}
        onClick={() =>
          selectValue("all", setYearView, () => dd.setYearViewOpen(false))
        }
      >
        {t("common.admin.revenue.yearly.allYears", {
          defaultValue: "All years",
        })}
      </RevenueOption>
      {yearlyTotals.map((r: any) => (
        <RevenueOption
          key={r.name}
          active={yearView !== "all" && String(yearView) === r.name}
          onClick={() =>
            selectValue(Number(r.name), setYearView, () =>
              dd.setYearViewOpen(false),
            )
          }
        >
          {r.name}
        </RevenueOption>
      ))}
    </RevenueSelect>
  );
}

function RevenueOption({ active, onClick, children }: any) {
  return (
    <button
      type="button"
      className={`ks-selectbox__option${active ? " ks-selectbox__option--active" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function selectValue(value: any, setter: any, close: () => void) {
  setter(value);
  close();
}
