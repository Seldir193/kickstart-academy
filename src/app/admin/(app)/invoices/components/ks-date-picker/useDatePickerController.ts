import { useEffect, useMemo, useRef, useState } from "react";
import {
  addMonths,
  buildMonthGrid,
  buildYears,
  dateFromIso,
  dateLabelFromIso,
  filterYears,
  isoFromDate,
} from "./datePickerUtils";
import type { KsDatePickerProps } from "./KsDatePicker";
import { useDatePickerPosition } from "./useDatePickerPosition";

function initViewMonth(selected: Date | null) {
  const now = new Date();
  if (!selected) return new Date(now.getFullYear(), now.getMonth(), 1);
  return new Date(selected.getFullYear(), selected.getMonth(), 1);
}

function applyPanelPosition(
  panel: HTMLDivElement | null,
  pos: { left: number; top: number; width: number },
) {
  if (!panel) return;
  panel.style.setProperty("--ks-datepicker-left", `${pos.left}px`);
  panel.style.setProperty("--ks-datepicker-top", `${pos.top}px`);
  panel.style.setProperty("--ks-datepicker-width", `${pos.width}px`);
}

export function useDatePickerController(
  props: KsDatePickerProps,
  language: string,
) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [yearQuery, setYearQuery] = useState("");
  const selected = useMemo(() => dateFromIso(props.value), [props.value]);
  const [viewMonth, setViewMonth] = useState(() => initViewMonth(selected));
  const { pos, computePos } = useDatePickerPosition();
  const label = useMemo(
    () => dateLabelFromIso(props.value, language),
    [props.value, language],
  );
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
  function toggleOpen() {
    if (open) close();
    else openPicker();
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
    const today = new Date();
    props.onChange(isoFromDate(today));
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    close();
  }
  function jumpYear(year: number) {
    setViewMonth(new Date(year, viewMonth.getMonth(), 1));
    setYearOpen(false);
  }
  function previousMonth() {
    setViewMonth(addMonths(viewMonth, -1));
  }
  function nextMonth() {
    setViewMonth(addMonths(viewMonth, 1));
  }

  useEffect(() => {
    if (selected) setViewMonth(initViewMonth(selected));
  }, [selected]);
  useEffect(() => {
    if (!open) setYearQuery("");
  }, [open]);
  useEffect(() => {
    if (open) applyPanelPosition(panelRef.current, pos);
  }, [open, pos]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (
        target &&
        (btnRef.current?.contains(target) || panelRef.current?.contains(target))
      )
        return;
      close();
    };
    const reposition = () => computePos(btnRef.current);
    document.addEventListener("mousedown", outside);
    document.addEventListener("touchstart", outside, { passive: true });
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("touchstart", outside);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, computePos]);

  return {
    btnRef,
    panelRef,
    open,
    yearOpen,
    yearQuery,
    viewMonth,
    label,
    cells,
    filteredYears,
    close,
    toggleOpen,
    pickIso,
    clear,
    goToday,
    jumpYear,
    previousMonth,
    nextMonth,
    setYearOpen,
    setYearQuery,
  };
}
