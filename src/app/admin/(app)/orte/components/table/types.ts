import type { RefObject } from "react";
import type { Place } from "@/types/place";

export type PlacesTableItem = Place & { publicId?: number };

export type PlacesTableProps = {
  items: PlacesTableItem[];
  selectMode: boolean;
  onToggleSelectMode: () => void;
  busy: boolean;
  onOpen: (place: Place) => void;
  onDeleteMany: (ids: string[]) => Promise<void>;
  toggleBtnRef?: RefObject<HTMLButtonElement | null>;
};

export type PlacesSelection = {
  selected: Set<string>;
  isAllSelected: boolean;
  toggleOne: (id: string) => void;
  selectAll: () => void;
  removeAll: () => void;
  clear: () => void;
};
