"use client";

import type { ReactNode, RefObject } from "react";
import type { ProgramFilter, Status, StatusOrAll } from "../../types";
import {
  courseLabel,
  sortLabel,
  type SortKey,
  type Translate,
} from "./onlineBookingOptions";

type MenuState<T extends HTMLElement> = {
  open: boolean;
  setOpen: (updater: (open: boolean) => boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  menuRef: RefObject<T | null>;
};

type OnlineBookingsToolbarProps = {
  t: Translate;
  q: string;
  program: ProgramFilter;
  status: StatusOrAll;
  sort: SortKey;
  mutating: boolean;
  total: number;
  totalAll: number | null;
  counts: Partial<Record<Status, number>>;
  computedStatusLabel: string;
  courseMenu: MenuState<HTMLUListElement>;
  statusMenu: MenuState<HTMLUListElement>;
  sortMenu: MenuState<HTMLUListElement>;
  setQ: (value: string) => void;
  setPage: (value: number) => void;
  setProgram: (value: ProgramFilter) => void;
  setStatus: (value: StatusOrAll) => void;
  setSort: (value: SortKey) => void;
};

export default function OnlineBookingsToolbar(props: OnlineBookingsToolbarProps) {
  return (
    <div className="ks-online-bookings-toolbar">
      <SearchFilter {...props} />
      <CourseFilter {...props} />
      <StatusFilter {...props} />
      <SortFilter {...props} />
    </div>
  );
}

function SearchFilter({ q, t, setQ, setPage }: OnlineBookingsToolbarProps) {
  return (
    <div className="news-admin__filter ks-online-bookings-toolbar__search">
      <div className="input-with-icon">
        <SearchIcon />
        <SearchInput q={q} t={t} setQ={setQ} setPage={setPage} />
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <img
      src="/icons/search.svg"
      alt=""
      aria-hidden="true"
      className="input-with-icon__icon"
    />
  );
}

function SearchInput(props: Pick<OnlineBookingsToolbarProps, "q" | "t" | "setQ" | "setPage">) {
  return (
    <input
      className="input input-with-icon__input"
      placeholder={props.t("common.admin.onlineBookings.search.placeholder")}
      value={props.q}
      onChange={(e) => onSearchChange(e.target.value, props)}
      onKeyDown={(e) => onSearchKeyDown(e.key, props)}
    />
  );
}

function CourseFilter(props: OnlineBookingsToolbarProps) {
  const label = courseLabel(props.t, props.program);
  const ariaLabel = props.t("common.admin.onlineBookings.course.ariaLabel");
  return <SelectFilter kind="select" label={label} ariaLabel={ariaLabel} menu={props.courseMenu} disabled={props.mutating}><CourseMenu {...props} /></SelectFilter>;
}

function StatusFilter(props: OnlineBookingsToolbarProps) {
  const ariaLabel = props.t("common.admin.onlineBookings.status.ariaLabel");
  return <SelectFilter kind="select" label={props.computedStatusLabel} ariaLabel={ariaLabel} menu={props.statusMenu} disabled={props.mutating}><StatusMenu {...props} /></SelectFilter>;
}

function SortFilter(props: OnlineBookingsToolbarProps) {
  const label = sortLabel(props.t, props.sort);
  const ariaLabel = props.t("common.admin.onlineBookings.sort.ariaLabel");
  return <SelectFilter kind="sort" label={label} ariaLabel={ariaLabel} menu={props.sortMenu} disabled={props.mutating}><SortMenu {...props} /></SelectFilter>;
}

function SelectFilter(props: SelectFilterProps) {
  const className = `news-admin__filter ks-online-bookings-toolbar__${props.kind}`;
  return <div className={className}><TrainingSelect {...props} /></div>;
}

type SelectFilterProps = {
  kind: "select" | "sort";
  label: string;
  ariaLabel: string;
  menu: MenuState<HTMLUListElement>;
  disabled: boolean;
  children?: ReactNode;
};

function TrainingSelect({ label, menu, ariaLabel, disabled, children }: SelectFilterProps) {
  const className = "ks-training-select" + (menu.open ? " ks-training-select--open" : "");
  return <div className={className}><TrainingTrigger label={label} menu={menu} ariaLabel={ariaLabel} disabled={disabled} />{children}</div>;
}

function TrainingTrigger({ label, menu, ariaLabel, disabled }: Omit<SelectFilterProps, "kind" | "children">) {
  return (
    <button type="button" ref={menu.triggerRef} className="ks-training-select__trigger" onClick={() => menu.setOpen((open) => !open)} disabled={disabled} aria-label={ariaLabel}>
      <span className="ks-training-select__label">{label}</span>
      <span className="ks-training-select__chevron" aria-hidden="true" />
    </button>
  );
}

function CourseMenu(props: OnlineBookingsToolbarProps) {
  if (!props.courseMenu.open) return null;
  return <ul ref={props.courseMenu.menuRef} className="ks-training-select__menu ks-training-select__menu--grouped" role="listbox" aria-label={props.t("common.admin.onlineBookings.course.ariaLabel")}><CourseAllOption {...props} /><CourseGroupOptions {...props} /></ul>;
}

function CourseAllOption(props: OnlineBookingsToolbarProps) {
  return <li><OptionButton selected={props.program === "all"} top onClick={() => applyProgram("all", props)}>{props.t("common.admin.onlineBookings.course.all")}</OptionButton></li>;
}

function CourseGroupOptions(props: OnlineBookingsToolbarProps) {
  return (
    <li className="ks-training-select__group">
      <CourseGroupLabel {...props} />
      <OptionButton selected={props.program === "camp"} onClick={() => applyProgram("camp", props)}>{props.t("common.admin.onlineBookings.course.camp")}</OptionButton>
      <OptionButton selected={props.program === "power"} onClick={() => applyProgram("power", props)}>{props.t("common.admin.onlineBookings.course.power")}</OptionButton>
    </li>
  );
}

function CourseGroupLabel({ t }: OnlineBookingsToolbarProps) {
  return <div className="ks-training-select__group-label">{t("common.admin.onlineBookings.course.group.holidayPrograms")}</div>;
}

function StatusMenu(props: OnlineBookingsToolbarProps) {
  if (!props.statusMenu.open) return null;
  return <ul ref={props.statusMenu.menuRef} className="ks-training-select__menu" role="listbox" aria-label={props.t("common.admin.onlineBookings.status.ariaLabel")}><StatusOption value="all" {...props} /><StatusOption value="confirmed" {...props} /><StatusOption value="cancelled" {...props} /><StatusOption value="deleted" {...props} /></ul>;
}

function StatusOption(props: OnlineBookingsToolbarProps & { value: StatusOrAll }) {
  return <li><OptionButton selected={props.status === props.value} onClick={() => applyStatus(props.value, props)}>{statusOptionLabel(props)}</OptionButton></li>;
}

function SortMenu(props: OnlineBookingsToolbarProps) {
  if (!props.sortMenu.open) return null;
  return <ul ref={props.sortMenu.menuRef} className="ks-training-select__menu" role="listbox" aria-label={props.t("common.admin.onlineBookings.sort.ariaLabel")}><SortOption value="newest" {...props} /><SortOption value="oldest" {...props} /><SortOption value="name_asc" {...props} /><SortOption value="name_desc" {...props} /></ul>;
}

function SortOption(props: OnlineBookingsToolbarProps & { value: SortKey }) {
  return <li><OptionButton selected={props.sort === props.value} onClick={() => applySort(props.value, props)}>{sortLabel(props.t, props.value)}</OptionButton></li>;
}

function OptionButton({ selected, top, onClick, children }: { selected: boolean; top?: boolean; onClick: () => void; children?: ReactNode }) {
  const className = "ks-training-select__option" + (top ? " ks-training-select__option--top" : "") + (selected ? " is-selected" : "");
  return <button type="button" className={className} onClick={onClick}>{children}</button>;
}

function statusOptionLabel(props: OnlineBookingsToolbarProps & { value: StatusOrAll }) {
  if (props.value === "all") return `${props.t("common.admin.onlineBookings.status.all")} (${props.totalAll ?? props.total})`;
  return `${props.t(`common.admin.onlineBookings.status.${props.value}`)} (${props.counts[props.value] ?? 0})`;
}

function onSearchChange(value: string, props: Pick<OnlineBookingsToolbarProps, "setQ" | "setPage">) {
  props.setQ(value);
  props.setPage(1);
}

function onSearchKeyDown(key: string, props: Pick<OnlineBookingsToolbarProps, "setQ" | "setPage">) {
  if (key === "Escape") onSearchChange("", props);
  if (key === "Enter") props.setPage(1);
}

function applyProgram(next: ProgramFilter, props: OnlineBookingsToolbarProps) {
  props.setProgram(next);
  props.setStatus("all");
  props.setPage(1);
  props.courseMenu.setOpen(() => false);
}

function applyStatus(next: StatusOrAll, props: OnlineBookingsToolbarProps) {
  props.setStatus(next);
  props.setPage(1);
  props.statusMenu.setOpen(() => false);
}

function applySort(next: SortKey, props: OnlineBookingsToolbarProps) {
  props.setSort(next);
  props.setPage(1);
  props.sortMenu.setOpen(() => false);
}
