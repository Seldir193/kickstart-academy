"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  addMonths,
  buildMonthGrid,
  buildYears,
  dateFromIso,
  dateLabelFromIso,
  filterYears,
  isoFromDate,
  monthLabel,
  type MonthCell,
} from "./datePickerUtils";
import { useDatePickerPosition } from "./useDatePickerPosition";

export type KsDatePickerProps = {
  value: string;
  onChange: (nextIso: string) => void;
  placeholder?: string;
  fromYear?: number;
  toYear?: number;
  disabled?: boolean;
};

function initViewMonth(selected: Date | null) {
  const now = new Date();
  if (!selected) return new Date(now.getFullYear(), now.getMonth(), 1);
  return new Date(selected.getFullYear(), selected.getMonth(), 1);
}

function dayCellKey(c: MonthCell, idx: number) {
  return c.kind === "empty" ? String(idx) : c.iso;
}

export default function KsDatePicker(props: KsDatePickerProps) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [yearQuery, setYearQuery] = useState("");

  const selected = useMemo(() => dateFromIso(props.value), [props.value]);
  const [viewMonth, setViewMonth] = useState(() => initViewMonth(selected));

  const { pos, computePos } = useDatePickerPosition();
  const label = useMemo(() => dateLabelFromIso(props.value), [props.value]);

  useEffect(() => {
    if (!selected) return;
    setViewMonth(initViewMonth(selected));
  }, [selected]);

  const cells = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);
  const years = useMemo(
    () =>
      buildYears(
        props.fromYear ?? 1970,
        props.toYear ?? new Date().getFullYear() + 2,
      ),
    [props.fromYear, props.toYear],
  );
  const filteredYears = useMemo(
    () => filterYears(years, yearQuery),
    [years, yearQuery],
  );

  function close() {
    setOpen(false);
    setYearOpen(false);
  }

  function openPicker() {
    computePos(btnRef.current);
    setYearOpen(false);
    setOpen(true);
  }

  function pickIso(iso: string) {
    props.onChange(iso);
    close();
  }

  function clear() {
    props.onChange("");
    close();
  }

  function goToday() {
    const t = new Date();
    props.onChange(isoFromDate(t));
    setViewMonth(new Date(t.getFullYear(), t.getMonth(), 1));
    close();
  }

  function jumpYear(nextYear: number) {
    setViewMonth(new Date(nextYear, viewMonth.getMonth(), 1));
    setYearOpen(false);
  }

  useEffect(() => {
    if (!open) setYearQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      const inButton = !!(target && btnRef.current?.contains(target));
      const inPanel = !!(target && panelRef.current?.contains(target));
      if (inButton || inPanel) return;
      close();
    };

    const onViewportChange = () => computePos(btnRef.current);

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
    };
  }, [open, computePos]);

  return (
    <div className={"ks-datepicker" + (open ? " ks-datepicker--open" : "")}>
      <button
        ref={btnRef}
        type="button"
        className="input ks-datepicker__trigger"
        onClick={() => (open ? close() : openPicker())}
        disabled={props.disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span
          className={"ks-datepicker__value" + (label ? "" : " is-placeholder")}
        >
          {label || props.placeholder || "tt.mm.jjjj"}
        </span>
        <span className="ks-datepicker__icon" aria-hidden="true">
          <img src="/icons/calender.svg" alt="" />
        </span>
      </button>

      {open && (
        <div
          ref={panelRef}
          className="ks-datepicker__panel ks-scroll-thin"
          role="dialog"
          aria-label="Datum auswählen"
          style={{
            position: "fixed",
            left: pos.left,
            top: pos.top,
            width: pos.width,
            scrollbarWidth: "thin",
          }}
          onWheel={(e) => e.stopPropagation()}
          onScroll={(e) => e.stopPropagation()}
        >
          <div className="ks-datepicker__head">
            <button
              type="button"
              className="ks-datepicker__nav ks-datepicker__nav--prev"
              onClick={() => setViewMonth(addMonths(viewMonth, -1))}
              aria-label="Vorheriger Monat"
            >
              <img src="/icons/arrow_right_alt.svg" alt="" />
            </button>

            <button
              type="button"
              className="ks-datepicker__title"
              onClick={() => setYearOpen((v) => !v)}
              aria-label="Jahr auswählen"
            >
              {monthLabel(viewMonth)}
            </button>

            <button
              type="button"
              className="ks-datepicker__nav ks-datepicker__nav--next"
              onClick={() => setViewMonth(addMonths(viewMonth, 1))}
              aria-label="Nächster Monat"
            >
              <img src="/icons/arrow_right_alt.svg" alt="" />
            </button>
          </div>

          {yearOpen ? (
            <div className="ks-datepicker__years">
              <input
                className="input ks-datepicker__yearinput"
                value={yearQuery}
                onChange={(e) => setYearQuery(e.target.value)}
                placeholder="Jahr suchen…"
                inputMode="numeric"
              />

              <div
                className="ks-datepicker__yearlist ks-scroll-thin"
                role="listbox"
                aria-label="Jahre"
                style={{ scrollbarWidth: "thin" }}
              >
                {filteredYears.map((y) => (
                  <button
                    key={y}
                    type="button"
                    className={
                      "ks-datepicker__year" +
                      (y === viewMonth.getFullYear() ? " is-active" : "")
                    }
                    onClick={() => jumpYear(y)}
                    role="option"
                    aria-selected={y === viewMonth.getFullYear()}
                  >
                    {y}
                  </button>
                ))}
              </div>

              <div className="ks-datepicker__foot">
                <button
                  type="button"
                  className="ks-datepicker__link"
                  onClick={() => setYearOpen(false)}
                >
                  Zurück
                </button>
                <button
                  type="button"
                  className="ks-datepicker__link"
                  onClick={goToday}
                >
                  Heute
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="ks-datepicker__weekdays">
                <div className="ks-datepicker__weekday">Mo</div>
                <div className="ks-datepicker__weekday">Di</div>
                <div className="ks-datepicker__weekday">Mi</div>
                <div className="ks-datepicker__weekday">Do</div>
                <div className="ks-datepicker__weekday">Fr</div>
                <div className="ks-datepicker__weekday">Sa</div>
                <div className="ks-datepicker__weekday">So</div>
              </div>

              <div
                className="ks-datepicker__grid"
                role="grid"
                aria-label="Kalender"
              >
                {cells.map((c, idx) => {
                  if (c.kind === "empty")
                    return (
                      <div
                        key={dayCellKey(c, idx)}
                        className="ks-datepicker__cell is-empty"
                      />
                    );
                  const isSel = !!props.value && c.iso === props.value;
                  return (
                    <button
                      key={dayCellKey(c, idx)}
                      type="button"
                      className={
                        "ks-datepicker__cell" + (isSel ? " is-selected" : "")
                      }
                      onClick={() => pickIso(c.iso)}
                      role="gridcell"
                      aria-selected={isSel}
                    >
                      {c.day}
                    </button>
                  );
                })}
              </div>

              <div className="ks-datepicker__foot">
                <button
                  type="button"
                  className="ks-datepicker__link"
                  onClick={clear}
                >
                  Löschen
                </button>
                <button
                  type="button"
                  className="ks-datepicker__link"
                  onClick={goToday}
                >
                  Heute
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
