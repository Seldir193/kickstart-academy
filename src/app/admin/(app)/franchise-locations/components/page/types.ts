import type { RefObject } from "react";
import type { FranchiseLocation } from "../../types";
import type { LocationsTableListProps } from "../table/types";
import type { useFranchiseLocationsPage } from "../../hooks/useFranchiseLocationsPage";

export type PageState = ReturnType<typeof useFranchiseLocationsPage>;
export type TFn = (key: string) => string;
export type DeleteMode = "mine" | "admin";

export type DeleteHandlers = {
  openDeleteMine: (item: FranchiseLocation) => void;
  openDeleteAdmin: (item: FranchiseLocation) => void;
};

export type PaginationState = {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
};

export type TableSectionProps = LocationsTableListProps & {
  title: string;
  meta: string;
  pagination: PaginationState;
  p: PageState;
};

export type PageTextProps = {
  p: PageState;
  t: TFn;
};

export type PageHandlersProps = PageTextProps & {
  handlers: DeleteHandlers;
};

export type DialogsProps = PageTextProps & {
  deleteState: {
    open: boolean;
    target: FranchiseLocation | null;
    close: () => void;
    confirm: () => Promise<void>;
    openDelete: (item: FranchiseLocation, mode: DeleteMode) => void;
  };
};

export type PendingSectionProps = {
  title: string;
  meta: string;
  p: PageState;
  pagination: PaginationState;
};

export type ShellProps = {
  title: string;
  meta: string;
  pending?: boolean;
  pagination: PaginationState;
  children: import("react").ReactNode;
};
