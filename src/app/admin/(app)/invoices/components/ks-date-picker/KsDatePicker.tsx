"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import CalendarPanel from "./CalendarPanel";
import { useDatePickerController } from "./useDatePickerController";

export type KsDatePickerProps = {
  value: string;
  onChange: (nextIso: string) => void;
  placeholder?: string;
  fromYear?: number;
  toYear?: number;
  disabled?: boolean;
};

export default function KsDatePicker(props: KsDatePickerProps) {
  const { t, i18n } = useTranslation();
  const state = useDatePickerController(props, i18n.language);
  return (
    <div className={`ks-datepicker${state.open ? " ks-datepicker--open" : ""}`}>
      <button
        ref={state.btnRef}
        type="button"
        className="input ks-datepicker__trigger"
        onClick={state.toggleOpen}
        disabled={props.disabled}
        aria-haspopup="dialog"
        aria-expanded={state.open}
      >
        <span
          className={`ks-datepicker__value${state.label ? "" : " is-placeholder"}`}
        >
          {state.label ||
            props.placeholder ||
            t("common.datePicker.placeholder")}
        </span>
        <span className="ks-datepicker__icon" aria-hidden="true">
          <img src="/icons/calender.svg" alt="" />
        </span>
      </button>
      {state.open && (
        <div
          ref={state.panelRef}
          className="ks-datepicker__panel ks-datepicker__panel--floating ks-scroll-thin"
          role="dialog"
          aria-label={t("common.datePicker.selectDate")}
          onWheel={(event) => event.stopPropagation()}
          onScroll={(event) => event.stopPropagation()}
        >
          <CalendarPanel
            cells={state.cells}
            filteredYears={state.filteredYears}
            language={i18n.language}
            selectedIso={props.value}
            t={t}
            viewMonth={state.viewMonth}
            yearOpen={state.yearOpen}
            yearQuery={state.yearQuery}
            onClear={state.clear}
            onNextMonth={state.nextMonth}
            onPickIso={state.pickIso}
            onPreviousMonth={state.previousMonth}
            onToday={state.goToday}
            onToggleYear={() => state.setYearOpen((value) => !value)}
            onYearQuery={state.setYearQuery}
            onYearSelect={state.jumpYear}
          />
        </div>
      )}
    </div>
  );
}
