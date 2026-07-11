import type { TFunction } from "i18next";
import type { MonthCell } from "./datePickerUtils";

export type PickerPosition = { left: number; top: number; width: number };

export type CalendarPanelProps = {
  cells: MonthCell[];
  filteredYears: number[];
  language: string;
  selectedIso: string;
  t: TFunction;
  viewMonth: Date;
  yearOpen: boolean;
  yearQuery: string;
  onClear: () => void;
  onNextMonth: () => void;
  onPickIso: (iso: string) => void;
  onPreviousMonth: () => void;
  onToday: () => void;
  onToggleYear: () => void;
  onYearQuery: (value: string) => void;
  onYearSelect: (year: number) => void;
};
