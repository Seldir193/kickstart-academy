import styles from "@/app/styles/revenue.module.scss";
import { MONTHS } from "../../constants";
import { getYears } from "../../utils";
import RevenueSelect from "../RevenueSelect";
import RevenueOption from "./RevenueOption";
import type { RevenuePageProps } from "./revenuePage.types";

type SourceProps = Pick<RevenuePageProps, "t" | "source" | "setSource" | "dd">;
type YearProps = Pick<RevenuePageProps, "t" | "year" | "setYear" | "dd">;
type MonthProps = Pick<
  RevenuePageProps,
  "t" | "month" | "setMonth" | "dd" | "vm"
>;

export default function RevenueFilters(props: RevenuePageProps) {
  return (
    <div className={styles.filtersRow}>
      <RevenueSourceSelect {...props} />
      <RevenueYearSelect {...props} />
      <RevenueMonthSelect {...props} />
    </div>
  );
}

function RevenueSourceSelect({ t, source, setSource, dd }: SourceProps) {
  const value = source === "invoices" ? invoiceLabel(t) : derivedLabel(t);
  return (
    <RevenueSelect
      id="rev-source"
      label={t("common.admin.revenue.filters.source", {
        defaultValue: "Source:",
      })}
      open={dd.sourceOpen}
      value={value}
      innerRef={dd.refs.sourceRef}
      onToggle={() => dd.setSourceOpen((open) => !open)}
    >
      <SourceOptions t={t} source={source} setSource={setSource} dd={dd} />
    </RevenueSelect>
  );
}

function SourceOptions({ t, source, setSource, dd }: SourceProps) {
  const close = () => dd.setSourceOpen(false);
  return (
    <>
      <RevenueOption
        active={source === "invoices"}
        onClick={() => choose("invoices", setSource, close)}
      >
        {invoiceLabel(t)}
      </RevenueOption>
      <RevenueOption
        active={source === "derived"}
        onClick={() => choose("derived", setSource, close)}
      >
        {derivedLabel(t)}
      </RevenueOption>
    </>
  );
}

function RevenueYearSelect({ t, year, setYear, dd }: YearProps) {
  const close = () => dd.setYearOpen(false);
  return (
    <RevenueSelect
      id="rev-year"
      label={t("common.admin.revenue.filters.year", { defaultValue: "Year:" })}
      open={dd.yearOpen}
      value={String(year)}
      innerRef={dd.refs.yearRef}
      onToggle={() => dd.setYearOpen((open) => !open)}
    >
      {getYears(7).map((value) => (
        <RevenueOption
          key={value}
          active={year === value}
          onClick={() => choose(value, setYear, close)}
        >
          {value}
        </RevenueOption>
      ))}
    </RevenueSelect>
  );
}

function RevenueMonthSelect({ t, month, setMonth, dd, vm }: MonthProps) {
  const close = () => dd.setMonthOpen(false);
  return (
    <RevenueSelect
      id="rev-month"
      label={t("common.admin.revenue.filters.month", {
        defaultValue: "Month:",
      })}
      open={dd.monthOpen}
      value={vm.monthLabel}
      innerRef={dd.refs.monthRef}
      onToggle={() => dd.setMonthOpen((open) => !open)}
      month
    >
      <MonthOptions t={t} month={month} setMonth={setMonth} close={close} />
    </RevenueSelect>
  );
}

type MonthOptionsProps = Pick<MonthProps, "t" | "month" | "setMonth"> & {
  close: () => void;
};

function MonthOptions({ t, month, setMonth, close }: MonthOptionsProps) {
  return (
    <>
      <RevenueOption
        active={month === -1}
        onClick={() => choose(-1, setMonth, close)}
      >
        {t("common.admin.revenue.months.all", { defaultValue: "All months" })}
      </RevenueOption>
      {MONTHS.map((value, index) => (
        <RevenueOption
          key={value}
          active={month === index}
          onClick={() => choose(index, setMonth, close)}
        >
          {t(`common.admin.revenue.months.${value}`, {
            defaultValue: value.toUpperCase(),
          })}
        </RevenueOption>
      ))}
    </>
  );
}

function choose<T>(value: T, setter: (value: T) => void, close: () => void) {
  setter(value);
  close();
}

function invoiceLabel(t: RevenuePageProps["t"]) {
  return t("common.admin.revenue.source.invoices", {
    defaultValue: "Invoices (actual)",
  });
}

function derivedLabel(t: RevenuePageProps["t"]) {
  return t("common.admin.revenue.source.derived", {
    defaultValue: "Subscription (derived)",
  });
}
