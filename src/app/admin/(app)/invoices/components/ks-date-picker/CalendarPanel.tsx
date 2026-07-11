import { monthLabel } from "./datePickerUtils";
import type { CalendarPanelProps } from "./datePicker.types";
import { CalendarGrid, Weekdays } from "./CalendarGrid";

function PanelHeader(props: CalendarPanelProps) {
  return (
    <div className="ks-datepicker__head">
      <button
        type="button"
        className="ks-datepicker__nav ks-datepicker__nav--prev"
        onClick={props.onPreviousMonth}
        aria-label={props.t("common.datePicker.previousMonth")}
      >
        <img src="/icons/arrow_right_alt.svg" alt="" />
      </button>
      <button
        type="button"
        className="ks-datepicker__title"
        onClick={props.onToggleYear}
        aria-label={props.t("common.datePicker.selectYear")}
      >
        {monthLabel(props.viewMonth, props.language)}
      </button>
      <button
        type="button"
        className="ks-datepicker__nav ks-datepicker__nav--next"
        onClick={props.onNextMonth}
        aria-label={props.t("common.datePicker.nextMonth")}
      >
        <img src="/icons/arrow_right_alt.svg" alt="" />
      </button>
    </div>
  );
}

function PanelFooter(props: {
  leftLabel: string;
  rightLabel: string;
  onLeft: () => void;
  onRight: () => void;
}) {
  return (
    <div className="ks-datepicker__foot">
      <button
        type="button"
        className="ks-datepicker__link"
        onClick={props.onLeft}
      >
        {props.leftLabel}
      </button>
      <button
        type="button"
        className="ks-datepicker__link"
        onClick={props.onRight}
      >
        {props.rightLabel}
      </button>
    </div>
  );
}

function YearPanel(props: CalendarPanelProps) {
  return (
    <div className="ks-datepicker__years">
      <input
        className="input ks-datepicker__yearinput"
        value={props.yearQuery}
        onChange={(event) => props.onYearQuery(event.target.value)}
        placeholder={props.t("common.datePicker.searchYear")}
        inputMode="numeric"
      />
      <div
        className="ks-datepicker__yearlist ks-scroll-thin"
        role="listbox"
        aria-label={props.t("common.datePicker.years")}
      >
        {props.filteredYears.map((year) => (
          <button
            key={year}
            type="button"
            className={`ks-datepicker__year${year === props.viewMonth.getFullYear() ? " is-active" : ""}`}
            onClick={() => props.onYearSelect(year)}
            role="option"
            aria-selected={year === props.viewMonth.getFullYear()}
          >
            {year}
          </button>
        ))}
      </div>
      <PanelFooter
        leftLabel={props.t("common.datePicker.back")}
        rightLabel={props.t("common.datePicker.today")}
        onLeft={props.onToggleYear}
        onRight={props.onToday}
      />
    </div>
  );
}

function MonthPanel(props: CalendarPanelProps) {
  return (
    <>
      <Weekdays t={props.t} />
      <CalendarGrid
        cells={props.cells}
        selectedIso={props.selectedIso}
        t={props.t}
        onPickIso={props.onPickIso}
      />
      <PanelFooter
        leftLabel={props.t("common.datePicker.clear")}
        rightLabel={props.t("common.datePicker.today")}
        onLeft={props.onClear}
        onRight={props.onToday}
      />
    </>
  );
}

export default function CalendarPanel(props: CalendarPanelProps) {
  return (
    <>
      <PanelHeader {...props} />
      {props.yearOpen ? <YearPanel {...props} /> : <MonthPanel {...props} />}
    </>
  );
}
