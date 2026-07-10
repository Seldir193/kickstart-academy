"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { ProgramFilter, StatusOrAll } from "../types";
import type { useBookingsList } from "../hooks/useBookingsList";
import SearchInput from "./SearchInput";
import SelectBox from "./SelectBox";
import SelectGroup from "./SelectGroup";
import SelectOption from "./SelectOption";
import type { useDropdown } from "./useDropdown";

type SortKey = "newest" | "oldest" | "nameAsc" | "nameDesc";
type Translate = (key: string) => string;
type FilterKind = "booking-search" | "booking-select" | "booking-sort";

type Props = {
  q: string;
  onSearchChange: (v: string) => void;
  onSearchKeyDown: (key: string) => void;
  programDd: ReturnType<typeof useDropdown>;
  statusDd: ReturnType<typeof useDropdown>;
  sortDd: ReturnType<typeof useDropdown>;
  programLabel: string;
  statusLabel: string;
  sortLabel: string;
  program: ProgramFilter;
  status: StatusOrAll;
  sort: SortKey;
  list: ReturnType<typeof useBookingsList>;
  onProgram: (v: ProgramFilter) => void;
  onStatus: (v: StatusOrAll) => void;
  onSort: (v: SortKey) => void;
};

const weeklyOptions: ProgramOption[] = [
  ["weekly_foerdertraining", "weeklyFoerdertraining"],
  ["weekly_kindergarten", "weeklyKindergarten"],
  ["weekly_goalkeeper", "weeklyGoalkeeper"],
  ["weekly_development_athletik", "weeklyDevelopmentAthletik"],
];

const individualOptions: ProgramOption[] = [
  ["ind_1to1", "individual1to1"],
  ["ind_1to1_athletik", "individual1to1Athletik"],
  ["ind_1to1_goalkeeper", "individual1to1Goalkeeper"],
];

const clubOptions: ProgramOption[] = [
  ["club_rentacoach", "clubRentACoach"],
  ["club_trainingcamps", "clubTrainingCamps"],
  ["club_coacheducation", "clubCoachEducation"],
];

const statusOptions: StatusOrAll[] = [
  "all",
  "pending",
  "processing",
  "confirmed",
  "cancelled",
  "deleted",
];

const sortOptions: SortKey[] = ["newest", "oldest", "nameAsc", "nameDesc"];

type ProgramOption = [ProgramFilter, string];

type OptionsProps = Props & { t: Translate };

export default function FiltersBar(props: Props) {
  const { t } = useTranslation();

  return (
    <div className="news-admin__filters">
      <SearchFilter {...props} />
      <ProgramFilterBox {...props} t={t} />
      <StatusFilterBox {...props} t={t} />
      <SortFilterBox {...props} t={t} />
    </div>
  );
}

function filterClass(kind: FilterKind) {
  return `news-admin__filter news-admin__filter--${kind}`;
}

function SearchFilter(props: Props) {
  return (
    <div className={filterClass("booking-search")}>
      <SearchInput
        value={props.q}
        onChange={props.onSearchChange}
        onKeyDown={props.onSearchKeyDown}
      />
    </div>
  );
}

function ProgramFilterBox(props: OptionsProps) {
  return (
    <FilterBox kind="booking-select">
      <SelectBox
        dd={props.programDd}
        label={props.programLabel}
        disabled={false}
        ariaLabel={props.t("common.admin.bookings.filters.programAria")}
      >
        <ProgramOptions {...props} />
      </SelectBox>
    </FilterBox>
  );
}

function ProgramOptions(props: OptionsProps) {
  return (
    <>
      <ProgramOptionRow value="all" labelKey="all" props={props} />
      <ProgramGroup
        labelKey="weeklyGroup"
        options={weeklyOptions}
        props={props}
      />
      <ProgramGroup
        labelKey="individualGroup"
        options={individualOptions}
        props={props}
      />
      <ProgramGroup labelKey="clubGroup" options={clubOptions} props={props} />
    </>
  );
}

function ProgramGroup(args: ProgramGroupProps) {
  return (
    <SelectGroup label={programText(args.props.t, args.labelKey)}>
      {args.options.map(([value, labelKey]) => (
        <ProgramOptionRow
          key={value}
          value={value}
          labelKey={labelKey}
          props={args.props}
        />
      ))}
    </SelectGroup>
  );
}

type ProgramGroupProps = {
  labelKey: string;
  options: ProgramOption[];
  props: OptionsProps;
};

function ProgramOptionRow(args: ProgramOptionRowProps) {
  return (
    <SelectOption
      active={args.props.program === args.value}
      onClick={() => args.props.onProgram(args.value)}
      text={programText(args.props.t, args.labelKey)}
    />
  );
}

type ProgramOptionRowProps = {
  value: ProgramFilter;
  labelKey: string;
  props: OptionsProps;
};

function programText(t: Translate, key: string) {
  return t(`common.admin.bookings.filters.program.${key}`);
}

function StatusFilterBox(props: OptionsProps) {
  return (
    <FilterBox kind="booking-select">
      <SelectBox
        dd={props.statusDd}
        label={props.statusLabel}
        disabled={false}
        ariaLabel={props.t("common.admin.bookings.filters.statusAria")}
      >
        <StatusOptions {...props} />
      </SelectBox>
    </FilterBox>
  );
}

function StatusOptions(props: OptionsProps) {
  return (
    <>
      {statusOptions.map((status) => (
        <SelectOption
          key={status}
          active={props.status === status}
          onClick={() => props.onStatus(status)}
          text={statusText(props, status)}
        />
      ))}
    </>
  );
}

function statusText(props: OptionsProps, status: StatusOrAll) {
  const count = status === "all" ? totalAll(props) : props.list.counts[status];
  return `${statusLabel(props.t, status)} (${count ?? 0})`;
}

function totalAll(props: OptionsProps) {
  return props.list.totalAll ?? props.list.total;
}

function statusLabel(t: Translate, status: StatusOrAll) {
  return t(`common.admin.bookings.filters.status.${status}`);
}

function SortFilterBox(props: OptionsProps) {
  return (
    <FilterBox kind="booking-sort">
      <SelectBox
        dd={props.sortDd}
        label={props.sortLabel}
        disabled={false}
        ariaLabel={props.t("common.admin.bookings.filters.sortAria")}
      >
        <SortOptions {...props} />
      </SelectBox>
    </FilterBox>
  );
}

function SortOptions(props: OptionsProps) {
  return (
    <>
      {sortOptions.map((sort) => (
        <SelectOption
          key={sort}
          active={props.sort === sort}
          onClick={() => props.onSort(sort)}
          text={props.t(`common.admin.bookings.sort.${sort}`)}
        />
      ))}
    </>
  );
}

function FilterBox(props: { kind: FilterKind; children: ReactNode }) {
  return <div className={filterClass(props.kind)}>{props.children}</div>;
}
