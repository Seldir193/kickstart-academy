import type { Dispatch, RefObject, SetStateAction } from "react";
import type { TFunction } from "i18next";
import type { Place } from "@/types/place";

export type PlacesSortKey = "newest" | "oldest" | "city_asc" | "city_desc";

export type PlacesItem = Place & { publicId?: number };

export type PlacesListState = {
  items: PlacesItem[];
  total: number;
  loading: boolean;
  error: string | null;
  pageCount: number;
  reload: () => Promise<void>;
};

export type PlacesSortOption = {
  value: PlacesSortKey;
  labelKey: string;
  defaultValue: string;
};

export type PlacesSortSelectProps = {
  sort: PlacesSortKey;
  open: boolean;
  busy: boolean;
  t: TFunction;
  triggerRef: RefObject<HTMLButtonElement | null>;
  menuRef: RefObject<HTMLUListElement | null>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onSortChange: (sort: PlacesSortKey) => void;
};
