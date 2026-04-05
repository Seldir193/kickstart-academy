"use client";

import type { CSSProperties } from "react";
import type { ProgramFilter, StatusOrAll } from "../types";
import type { useBookingsList } from "../hooks/useBookingsList";
import SearchInput from "./SearchInput";
import SelectBox from "./SelectBox";
import SelectGroup from "./SelectGroup";
import SelectOption from "./SelectOption";
import type { useDropdown } from "./useDropdown";
import { useTranslation } from "react-i18next";

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

// export default function FiltersBar(props: Props) {
//   return (
//     <div className="news-admin__filters">
//       <SearchFilter
//         value={props.q}
//         style={props.searchItemStyle}
//         onChange={props.onSearchChange}
//         onKeyDown={props.onSearchKeyDown}
//       />
//       <ProgramFilterBox {...props} />
//       <StatusFilterBox {...props} />
//       <SortFilterBox {...props} />
//     </div>
//   );
// }

export default function FiltersBar(props: Props) {
  const { t } = useTranslation();

  return (
    <div className="news-admin__filters">
      <SearchFilter
        value={props.q}
        style={props.searchItemStyle}
        onChange={props.onSearchChange}
        onKeyDown={props.onSearchKeyDown}
      />
      <ProgramFilterBox {...props} t={t} />
      <StatusFilterBox {...props} t={t} />
      <SortFilterBox {...props} t={t} />
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
      <SearchInput
        value={props.value}
        onChange={props.onChange}
        onKeyDown={props.onKeyDown}
      />
    </div>
  );
}

// function ProgramFilterBox(props: Props) {
//   return (
//     <div className="news-admin__filter" style={props.ddItemStyle}>
//       <SelectBox
//         dd={props.programDd}
//         label={props.programLabel}
//         disabled={false}
//         ariaLabel="Course"
//       >
//         <ProgramOptions {...props} />
//       </SelectBox>
//     </div>
//   );
// }

function ProgramFilterBox(props: Props & { t: (key: string) => string }) {
  return (
    <div className="news-admin__filter" style={props.ddItemStyle}>
      <SelectBox
        dd={props.programDd}
        label={props.programLabel}
        disabled={false}
        ariaLabel={props.t("common.admin.bookings.filters.programAria")}
      >
        <ProgramOptions {...props} />
      </SelectBox>
    </div>
  );
}

function ProgramOptions(props: Props & { t: (key: string) => string }) {
  return (
    <>
      <SelectOption
        active={props.program === "all"}
        onClick={() => props.onProgram("all")}
        text={props.t("common.admin.bookings.filters.program.all")}
      />
      <SelectGroup
        label={props.t("common.admin.bookings.filters.program.weeklyGroup")}
      >
        <SelectOption
          active={props.program === "weekly_foerdertraining"}
          onClick={() => props.onProgram("weekly_foerdertraining")}
          text={props.t(
            "common.admin.bookings.filters.program.weeklyFoerdertraining",
          )}
        />
        <SelectOption
          active={props.program === "weekly_kindergarten"}
          onClick={() => props.onProgram("weekly_kindergarten")}
          text={props.t(
            "common.admin.bookings.filters.program.weeklyKindergarten",
          )}
        />
        <SelectOption
          active={props.program === "weekly_goalkeeper"}
          onClick={() => props.onProgram("weekly_goalkeeper")}
          text={props.t(
            "common.admin.bookings.filters.program.weeklyGoalkeeper",
          )}
        />
        <SelectOption
          active={props.program === "weekly_development_athletik"}
          onClick={() => props.onProgram("weekly_development_athletik")}
          text={props.t(
            "common.admin.bookings.filters.program.weeklyDevelopmentAthletik",
          )}
        />
      </SelectGroup>
      <SelectGroup
        label={props.t("common.admin.bookings.filters.program.individualGroup")}
      >
        <SelectOption
          active={props.program === "ind_1to1"}
          onClick={() => props.onProgram("ind_1to1")}
          text={props.t("common.admin.bookings.filters.program.individual1to1")}
        />
        <SelectOption
          active={props.program === "ind_1to1_athletik"}
          onClick={() => props.onProgram("ind_1to1_athletik")}
          text={props.t(
            "common.admin.bookings.filters.program.individual1to1Athletik",
          )}
        />
        <SelectOption
          active={props.program === "ind_1to1_goalkeeper"}
          onClick={() => props.onProgram("ind_1to1_goalkeeper")}
          text={props.t(
            "common.admin.bookings.filters.program.individual1to1Goalkeeper",
          )}
        />
      </SelectGroup>
      <SelectGroup
        label={props.t("common.admin.bookings.filters.program.clubGroup")}
      >
        <SelectOption
          active={props.program === "club_rentacoach"}
          onClick={() => props.onProgram("club_rentacoach")}
          text={props.t("common.admin.bookings.filters.program.clubRentACoach")}
        />
        <SelectOption
          active={props.program === "club_trainingcamps"}
          onClick={() => props.onProgram("club_trainingcamps")}
          text={props.t(
            "common.admin.bookings.filters.program.clubTrainingCamps",
          )}
        />
        <SelectOption
          active={props.program === "club_coacheducation"}
          onClick={() => props.onProgram("club_coacheducation")}
          text={props.t(
            "common.admin.bookings.filters.program.clubCoachEducation",
          )}
        />
      </SelectGroup>
    </>
  );
}

// function ProgramOptions(props: Props) {
//   return (
//     <>
//       <SelectOption
//         active={props.program === "all"}
//         onClick={() => props.onProgram("all")}
//         text="All courses"
//       />
//       <SelectGroup label="Weekly courses">
//         <SelectOption
//           active={props.program === "weekly_foerdertraining"}
//           onClick={() => props.onProgram("weekly_foerdertraining")}
//           text="Foerdertraining"
//         />
//         <SelectOption
//           active={props.program === "weekly_kindergarten"}
//           onClick={() => props.onProgram("weekly_kindergarten")}
//           text="Soccer Kindergarten"
//         />
//         <SelectOption
//           active={props.program === "weekly_goalkeeper"}
//           onClick={() => props.onProgram("weekly_goalkeeper")}
//           text="Goalkeeper Training"
//         />
//         <SelectOption
//           active={props.program === "weekly_development_athletik"}
//           onClick={() => props.onProgram("weekly_development_athletik")}
//           text="Development Training • Athletik"
//         />
//       </SelectGroup>
//       <SelectGroup label="Individual courses">
//         <SelectOption
//           active={props.program === "ind_1to1"}
//           onClick={() => props.onProgram("ind_1to1")}
//           text="1:1 Training"
//         />
//         <SelectOption
//           active={props.program === "ind_1to1_athletik"}
//           onClick={() => props.onProgram("ind_1to1_athletik")}
//           text="1:1 Training Athletik"
//         />
//         <SelectOption
//           active={props.program === "ind_1to1_goalkeeper"}
//           onClick={() => props.onProgram("ind_1to1_goalkeeper")}
//           text="1:1 Training Torwart"
//         />
//       </SelectGroup>
//       <SelectGroup label="Club programs">
//         <SelectOption
//           active={props.program === "club_rentacoach"}
//           onClick={() => props.onProgram("club_rentacoach")}
//           text="Rent-a-Coach"
//         />
//         <SelectOption
//           active={props.program === "club_trainingcamps"}
//           onClick={() => props.onProgram("club_trainingcamps")}
//           text="Training Camps"
//         />
//         <SelectOption
//           active={props.program === "club_coacheducation"}
//           onClick={() => props.onProgram("club_coacheducation")}
//           text="Coach Education"
//         />
//       </SelectGroup>
//     </>
//   );
// }

// function StatusFilterBox(props: Props) {
//   return (
//     <div className="news-admin__filter" style={props.ddItemStyle}>
//       <SelectBox
//         dd={props.statusDd}
//         label={props.statusLabel}
//         disabled={false}
//         ariaLabel="Status"
//       >
//         <StatusOptions {...props} />
//       </SelectBox>
//     </div>
//   );
// }

function StatusFilterBox(props: Props & { t: (key: string) => string }) {
  return (
    <div className="news-admin__filter" style={props.ddItemStyle}>
      <SelectBox
        dd={props.statusDd}
        label={props.statusLabel}
        disabled={false}
        ariaLabel={props.t("common.admin.bookings.filters.statusAria")}
      >
        <StatusOptions {...props} />
      </SelectBox>
    </div>
  );
}

function StatusOptions(props: Props & { t: (key: string) => string }) {
  const totalAll = props.list.totalAll ?? props.list.total;

  return (
    <>
      <SelectOption
        active={props.status === "all"}
        onClick={() => props.onStatus("all")}
        text={`${props.t("common.admin.bookings.filters.status.all")} (${totalAll})`}
      />
      <SelectOption
        active={props.status === "pending"}
        onClick={() => props.onStatus("pending")}
        text={`${props.t("common.admin.bookings.filters.status.pending")} (${props.list.counts.pending ?? 0})`}
      />
      <SelectOption
        active={props.status === "processing"}
        onClick={() => props.onStatus("processing")}
        text={`${props.t("common.admin.bookings.filters.status.processing")} (${props.list.counts.processing ?? 0})`}
      />
      <SelectOption
        active={props.status === "confirmed"}
        onClick={() => props.onStatus("confirmed")}
        text={`${props.t("common.admin.bookings.filters.status.confirmed")} (${props.list.counts.confirmed ?? 0})`}
      />
      <SelectOption
        active={props.status === "cancelled"}
        onClick={() => props.onStatus("cancelled")}
        text={`${props.t("common.admin.bookings.filters.status.cancelled")} (${props.list.counts.cancelled ?? 0})`}
      />
      <SelectOption
        active={props.status === "deleted"}
        onClick={() => props.onStatus("deleted")}
        text={`${props.t("common.admin.bookings.filters.status.deleted")} (${props.list.counts.deleted ?? 0})`}
      />
    </>
  );
}

// function StatusOptions(props: Props) {
//   const totalAll = props.list.totalAll ?? props.list.total;

//   return (
//     <>
//       <SelectOption
//         active={props.status === "all"}
//         onClick={() => props.onStatus("all")}
//         text={`All (${totalAll})`}
//       />
//       <SelectOption
//         active={props.status === "pending"}
//         onClick={() => props.onStatus("pending")}
//         text={`Pending (${props.list.counts.pending ?? 0})`}
//       />
//       <SelectOption
//         active={props.status === "processing"}
//         onClick={() => props.onStatus("processing")}
//         text={`Processing (${props.list.counts.processing ?? 0})`}
//       />
//       <SelectOption
//         active={props.status === "confirmed"}
//         onClick={() => props.onStatus("confirmed")}
//         text={`Confirmed (${props.list.counts.confirmed ?? 0})`}
//       />
//       <SelectOption
//         active={props.status === "cancelled"}
//         onClick={() => props.onStatus("cancelled")}
//         text={`Cancelled (${props.list.counts.cancelled ?? 0})`}
//       />
//       <SelectOption
//         active={props.status === "deleted"}
//         onClick={() => props.onStatus("deleted")}
//         text={`Deleted (${props.list.counts.deleted ?? 0})`}
//       />
//     </>
//   );
// }

function SortFilterBox(props: Props & { t: (key: string) => string }) {
  return (
    <div className="news-admin__filter" style={props.sortItemStyle}>
      <SelectBox
        dd={props.sortDd}
        label={props.sortLabel}
        disabled={false}
        ariaLabel={props.t("common.admin.bookings.filters.sortAria")}
      >
        <SortOptions {...props} />
      </SelectBox>
    </div>
  );
}

// function SortFilterBox(props: Props) {
//   return (
//     <div className="news-admin__filter" style={props.sortItemStyle}>
//       <SelectBox
//         dd={props.sortDd}
//         label={props.sortLabel}
//         disabled={false}
//         ariaLabel="Sort"
//       >
//         <SortOptions {...props} />
//       </SelectBox>
//     </div>
//   );
// }

function SortOptions(props: Props & { t: (key: string) => string }) {
  return (
    <>
      <SelectOption
        active={props.sort === "newest"}
        onClick={() => props.onSort("newest")}
        text={props.t("common.admin.bookings.sort.newest")}
      />
      <SelectOption
        active={props.sort === "oldest"}
        onClick={() => props.onSort("oldest")}
        text={props.t("common.admin.bookings.sort.oldest")}
      />
      <SelectOption
        active={props.sort === "nameAsc"}
        onClick={() => props.onSort("nameAsc")}
        text={props.t("common.admin.bookings.sort.nameAsc")}
      />
      <SelectOption
        active={props.sort === "nameDesc"}
        onClick={() => props.onSort("nameDesc")}
        text={props.t("common.admin.bookings.sort.nameDesc")}
      />
    </>
  );
}

// function SortOptions(props: Props) {
//   return (
//     <>
//       <SelectOption
//         active={props.sort === "newest"}
//         onClick={() => props.onSort("newest")}
//         text="Newest first"
//       />
//       <SelectOption
//         active={props.sort === "oldest"}
//         onClick={() => props.onSort("oldest")}
//         text="Oldest first"
//       />
//       <SelectOption
//         active={props.sort === "nameAsc"}
//         onClick={() => props.onSort("nameAsc")}
//         text="Name A–Z"
//       />
//       <SelectOption
//         active={props.sort === "nameDesc"}
//         onClick={() => props.onSort("nameDesc")}
//         text="Name Z–A"
//       />
//     </>
//   );
// }
