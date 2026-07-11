import styles from "@/app/styles/revenue.module.scss";
import RevenueMonthlyChart from "../RevenueMonthlyChart";
import RevenueSelect from "../RevenueSelect";
import RevenueYearlyChart from "../RevenueYearlyChart";
import RevenueOption from "./RevenueOption";
import type { RevenuePageProps, YearView } from "./revenuePage.types";

type YearlyProps = Pick<
  RevenuePageProps,
  "t" | "dd" | "yearView" | "setYearView" | "yearlyTotals" | "vm"
>;

export default function RevenueSections(props: RevenuePageProps) {
  return (
    <>
      <RevenueLoading loading={props.loading} t={props.t} />
      <RevenueMonthlySection {...props} />
      <RevenueYearlySection {...props} />
    </>
  );
}

function RevenueLoading({
  loading,
  t,
}: Pick<RevenuePageProps, "loading" | "t">) {
  if (!loading) return null;
  return (
    <p className={styles.loading}>
      {t("common.admin.revenue.loading", { defaultValue: "Loading revenue…" })}
    </p>
  );
}

function RevenueMonthlySection({
  loading,
  data,
  month,
  t,
  vm,
}: RevenuePageProps) {
  if (loading || !data) return null;
  return (
    <>
      <p className={styles.total}>
        {monthlyTotalLabel(t, month)}: {vm.totalDisplayed.toFixed(2)} €
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

function RevenueYearlySection(props: YearlyProps) {
  return (
    <>
      <h2 className={styles.sectionTitle}>
        {props.t("common.admin.revenue.yearly.title", {
          defaultValue: "Yearly revenue (totals)",
        })}
      </h2>
      <div className={styles.filtersRow}>
        <RevenueYearViewSelect {...props} />
      </div>
      <YearlyChart {...props} />
    </>
  );
}

function RevenueYearViewSelect({
  t,
  dd,
  yearView,
  setYearView,
  yearlyTotals,
}: YearlyProps) {
  const close = () => dd.setYearViewOpen(false);
  return (
    <RevenueSelect
      id="rev-year-view"
      label={t("common.admin.revenue.filters.view", { defaultValue: "View:" })}
      open={dd.yearViewOpen}
      value={yearViewLabel(t, yearView)}
      innerRef={dd.refs.yearViewRef}
      onToggle={() => dd.setYearViewOpen((open) => !open)}
    >
      <YearViewOptions
        t={t}
        yearView={yearView}
        setYearView={setYearView}
        yearlyTotals={yearlyTotals}
        close={close}
      />
    </RevenueSelect>
  );
}

type YearViewOptionsProps = Pick<
  YearlyProps,
  "t" | "yearView" | "setYearView" | "yearlyTotals"
> & { close: () => void };

function YearViewOptions(props: YearViewOptionsProps) {
  return (
    <>
      <RevenueOption
        active={props.yearView === "all"}
        onClick={() => chooseYear("all", props)}
      >
        {allYearsLabel(props.t)}
      </RevenueOption>
      {props.yearlyTotals.map((row) => (
        <RevenueOption
          key={row.name}
          active={String(props.yearView) === row.name}
          onClick={() => chooseYear(Number(row.name), props)}
        >
          {row.name}
        </RevenueOption>
      ))}
    </>
  );
}

function YearlyChart({ t, vm }: YearlyProps) {
  return (
    <RevenueYearlyChart
      name={t("common.admin.revenue.tooltip.revenue", {
        defaultValue: "Revenue",
      })}
      yMaxYearly={vm.yMaxYearly}
      yearTickCount={vm.yearTickCount}
      yearlyRows={vm.yearlyRows}
      highlightedYearLabel={vm.highlightedYearLabel}
    />
  );
}

function chooseYear(value: YearView, props: YearViewOptionsProps) {
  props.setYearView(value);
  props.close();
}

function monthlyTotalLabel(t: RevenuePageProps["t"], month: number) {
  const key =
    month >= 0
      ? "common.admin.revenue.total.month"
      : "common.admin.revenue.total.all";
  const defaultValue = month >= 0 ? "Monthly revenue" : "Total revenue";
  return t(key, { defaultValue });
}

function yearViewLabel(t: RevenuePageProps["t"], yearView: YearView) {
  return yearView === "all" ? allYearsLabel(t) : String(yearView);
}

function allYearsLabel(t: RevenuePageProps["t"]) {
  return t("common.admin.revenue.yearly.allYears", {
    defaultValue: "All years",
  });
}
