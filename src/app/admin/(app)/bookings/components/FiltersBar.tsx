"use client";

import type { CSSProperties } from "react";
import type { ProgramFilter, StatusOrAll } from "../types";
import type { useBookingsList } from "../hooks/useBookingsList";
import SearchInput from "./SearchInput";
import SelectBox from "./SelectBox";
import SelectGroup from "./SelectGroup";
import SelectOption from "./SelectOption";
import type { useDropdown } from "./useDropdown";

type SortKey = "newest" | "oldest" | "nameAsc" | "nameDesc";

type Props = {
  q: string;
  onSearchChange: (v: string) => void;
  onSearchKeyDown: (key: string) => void;

  searchItemStyle: CSSProperties;
  ddItemStyle: CSSProperties;
  sortItemStyle: CSSProperties;

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

export default function FiltersBar(props: Props) {
  return (
    <div className="news-admin__filters">
      <SearchFilter
        value={props.q}
        style={props.searchItemStyle}
        onChange={props.onSearchChange}
        onKeyDown={props.onSearchKeyDown}
      />
      <ProgramFilterBox {...props} />
      <StatusFilterBox {...props} />
      <SortFilterBox {...props} />
    </div>
  );
}

function SearchFilter(props: {
  value: string;
  style: React.CSSProperties;
  onChange: (v: string) => void;
  onKeyDown: (key: string) => void;
}) {
  return (
    <div className="news-admin__filter" style={props.style}>
      <label className="lbl news-admin__filter-label">Search</label>
      <SearchInput
        value={props.value}
        onChange={props.onChange}
        onKeyDown={props.onKeyDown}
      />
    </div>
  );
}

function ProgramFilterBox(props: Props) {
  return (
    <div className="news-admin__filter" style={props.ddItemStyle}>
      <label className="lbl news-admin__filter-label">Course</label>
      <SelectBox
        dd={props.programDd}
        label={props.programLabel}
        disabled={false}
        ariaLabel="Course"
      >
        <ProgramOptions {...props} />
      </SelectBox>
    </div>
  );
}

function ProgramOptions(props: Props) {
  return (
    <>
      <SelectOption
        active={props.program === "all"}
        onClick={() => props.onProgram("all")}
        text="All courses"
      />
      <SelectGroup label="Weekly Courses">
        <SelectOption
          active={props.program === "weekly_foerdertraining"}
          onClick={() => props.onProgram("weekly_foerdertraining")}
          text="Foerdertraining"
        />
        <SelectOption
          active={props.program === "weekly_kindergarten"}
          onClick={() => props.onProgram("weekly_kindergarten")}
          text="Soccer Kindergarten"
        />
        <SelectOption
          active={props.program === "weekly_goalkeeper"}
          onClick={() => props.onProgram("weekly_goalkeeper")}
          text="Goalkeeper Training"
        />
        <SelectOption
          active={props.program === "weekly_development_athletik"}
          onClick={() => props.onProgram("weekly_development_athletik")}
          text="Development Training • Athletik"
        />
      </SelectGroup>
      <SelectGroup label="Individual Courses">
        <SelectOption
          active={props.program === "ind_1to1"}
          onClick={() => props.onProgram("ind_1to1")}
          text="1:1 Training"
        />
        <SelectOption
          active={props.program === "ind_1to1_athletik"}
          onClick={() => props.onProgram("ind_1to1_athletik")}
          text="1:1 Training Athletik"
        />
        <SelectOption
          active={props.program === "ind_1to1_goalkeeper"}
          onClick={() => props.onProgram("ind_1to1_goalkeeper")}
          text="1:1 Training Torwart"
        />
      </SelectGroup>
      <SelectGroup label="Club Programs">
        <SelectOption
          active={props.program === "club_rentacoach"}
          onClick={() => props.onProgram("club_rentacoach")}
          text="Rent-a-Coach"
        />
        <SelectOption
          active={props.program === "club_trainingcamps"}
          onClick={() => props.onProgram("club_trainingcamps")}
          text="Training Camps"
        />
        <SelectOption
          active={props.program === "club_coacheducation"}
          onClick={() => props.onProgram("club_coacheducation")}
          text="Coach Education"
        />
      </SelectGroup>
    </>
  );
}

function StatusFilterBox(props: Props) {
  return (
    <div className="news-admin__filter" style={props.ddItemStyle}>
      <label className="lbl news-admin__filter-label">Status</label>
      <SelectBox
        dd={props.statusDd}
        label={props.statusLabel}
        disabled={false}
        ariaLabel="Status"
      >
        <StatusOptions {...props} />
      </SelectBox>
    </div>
  );
}

function StatusOptions(props: Props) {
  const totalAll = props.list.totalAll ?? props.list.total;
  return (
    <>
      <SelectOption
        active={props.status === "all"}
        onClick={() => props.onStatus("all")}
        text={`All (${totalAll})`}
      />
      <SelectOption
        active={props.status === "pending"}
        onClick={() => props.onStatus("pending")}
        text={`Pending (${props.list.counts.pending ?? 0})`}
      />
      <SelectOption
        active={props.status === "processing"}
        onClick={() => props.onStatus("processing")}
        text={`Processing (${props.list.counts.processing ?? 0})`}
      />
      <SelectOption
        active={props.status === "confirmed"}
        onClick={() => props.onStatus("confirmed")}
        text={`Confirmed (${props.list.counts.confirmed ?? 0})`}
      />
      <SelectOption
        active={props.status === "cancelled"}
        onClick={() => props.onStatus("cancelled")}
        text={`Cancelled (${props.list.counts.cancelled ?? 0})`}
      />
      <SelectOption
        active={props.status === "deleted"}
        onClick={() => props.onStatus("deleted")}
        text={`Deleted (${props.list.counts.deleted ?? 0})`}
      />
    </>
  );
}

function SortFilterBox(props: Props) {
  return (
    <div className="news-admin__filter" style={props.sortItemStyle}>
      <label className="lbl news-admin__filter-label">Sort</label>
      <SelectBox
        dd={props.sortDd}
        label={props.sortLabel}
        disabled={false}
        ariaLabel="Sort"
      >
        <SortOptions {...props} />
      </SelectBox>
    </div>
  );
}

function SortOptions(props: Props) {
  return (
    <>
      <SelectOption
        active={props.sort === "newest"}
        onClick={() => props.onSort("newest")}
        text="Neueste zuerst"
      />
      <SelectOption
        active={props.sort === "oldest"}
        onClick={() => props.onSort("oldest")}
        text="Älteste zuerst"
      />
      <SelectOption
        active={props.sort === "nameAsc"}
        onClick={() => props.onSort("nameAsc")}
        text="Name A–Z"
      />
      <SelectOption
        active={props.sort === "nameDesc"}
        onClick={() => props.onSort("nameDesc")}
        text="Name Z–A"
      />
    </>
  );
}
