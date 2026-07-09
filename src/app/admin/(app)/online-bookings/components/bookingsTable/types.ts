import type { RefObject } from "react";
import type { Booking } from "../../types";

export type BookingsTableListProps = {
  items: Booking[];
  selectMode: boolean;
  busy: boolean;
  onToggleSelectMode: () => void;
  onOpen: (b: Booking) => void;
  onDeleteMany: (ids: string[]) => Promise<void>;
  onRestoreMany: (ids: string[]) => Promise<void>;
  toggleBtnRef?: RefObject<HTMLButtonElement | null>;
};

export type TableRefs = {
  cancelBtnRef: RefObject<HTMLButtonElement | null>;
  clearBtnRef: RefObject<HTMLButtonElement | null>;
};

export type Translator = (key: string) => string;
