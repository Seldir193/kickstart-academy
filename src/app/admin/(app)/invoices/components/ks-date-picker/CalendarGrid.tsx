import type { TFunction } from "i18next";
import type { MonthCell } from "./datePickerUtils";

const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

function dayCellKey(cell: MonthCell, index: number) {
  return cell.kind === "empty" ? String(index) : cell.iso;
}

function DayCell(props: {
  cell: MonthCell;
  index: number;
  selectedIso: string;
  onPickIso: (iso: string) => void;
}) {
  if (props.cell.kind === "empty")
    return (
      <div
        key={dayCellKey(props.cell, props.index)}
        className="ks-datepicker__cell is-empty"
      />
    );
  const cell = props.cell;
  const selected = !!props.selectedIso && cell.iso === props.selectedIso;
  return (
    <button
      key={dayCellKey(cell, props.index)}
      type="button"
      className={`ks-datepicker__cell${selected ? " is-selected" : ""}`}
      onClick={() => props.onPickIso(cell.iso)}
      role="gridcell"
      aria-selected={selected}
    >
      {cell.day}
    </button>
  );
}

export function Weekdays({ t }: { t: TFunction }) {
  return (
    <div className="ks-datepicker__weekdays">
      {WEEKDAYS.map((day) => (
        <div key={day} className="ks-datepicker__weekday">
          {t(`common.datePicker.weekday.${day}`)}
        </div>
      ))}
    </div>
  );
}

export function CalendarGrid(props: {
  cells: MonthCell[];
  selectedIso: string;
  t: TFunction;
  onPickIso: (iso: string) => void;
}) {
  return (
    <div
      className="ks-datepicker__grid"
      role="grid"
      aria-label={props.t("common.datePicker.calendar")}
    >
      {props.cells.map((cell, index) => (
        <DayCell
          key={dayCellKey(cell, index)}
          cell={cell}
          index={index}
          selectedIso={props.selectedIso}
          onPickIso={props.onPickIso}
        />
      ))}
    </div>
  );
}
