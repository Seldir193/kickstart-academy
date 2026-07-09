import type { RefObject } from "react";
import type { useSelection } from "@/app/admin/(app)/news/hooks/useSelection";
import type { Booking } from "../../types";

export type BookingsTableProps = {
  items: Booking[];
  selectMode: boolean;
  onToggleSelectMode: () => void;
  onOpen: (b: Booking) => void;
  onDeleteMany: (ids: string[]) => Promise<void>;
  onRestoreMany: (ids: string[]) => Promise<void>;
  toggleBtnRef?: RefObject<HTMLButtonElement | null>;
  busyRowId?: string | null;
  busyBulkDelete?: boolean;
  busyBulkRestore?: boolean;
};

export type SelectionState = ReturnType<typeof useSelection>;

export type TFn = (key: string) => string;

export type BookingRowContext = {
  selectMode: boolean;
  selected: Set<string>;
  onRowClick: (b: Booking) => void;
  onOpen: (b: Booking) => void;
  busyRowId: string | null;
  t: TFn;
  lang?: string;
};
