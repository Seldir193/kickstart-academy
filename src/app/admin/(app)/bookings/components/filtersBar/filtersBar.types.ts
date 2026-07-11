import type { useBookingsList } from "../../hooks/useBookingsList";
import type { ProgramFilter, StatusOrAll } from "../../types";
import type { useDropdown } from "../useDropdown";

export type SortKey = "newest" | "oldest" | "nameAsc" | "nameDesc";
export type Translate = (key: string) => string;
export type FilterKind = "booking-search" | "booking-select" | "booking-sort";
export type ProgramOption = [ProgramFilter, string];

export type FiltersBarProps = {
  q: string;
  onSearchChange: (value: string) => void;
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
  onProgram: (value: ProgramFilter) => void;
  onStatus: (value: StatusOrAll) => void;
  onSort: (value: SortKey) => void;
};

export type FilterOptionsProps = FiltersBarProps & { t: Translate };
