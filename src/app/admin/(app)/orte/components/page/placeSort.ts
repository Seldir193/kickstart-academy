import type { TFunction } from "i18next";
import type { PlacesSortKey, PlacesSortOption } from "./types";

export const PLACE_SORT_OPTIONS: PlacesSortOption[] = [
  {
    value: "newest",
    labelKey: "common.admin.places.sort.newest",
    defaultValue: "Newest first",
  },
  {
    value: "oldest",
    labelKey: "common.admin.places.sort.oldest",
    defaultValue: "Oldest first",
  },
  {
    value: "city_asc",
    labelKey: "common.admin.places.sort.cityAsc",
    defaultValue: "City A–Z",
  },
  {
    value: "city_desc",
    labelKey: "common.admin.places.sort.cityDesc",
    defaultValue: "City Z–A",
  },
];

export function getPlaceSortLabel(sort: PlacesSortKey, t: TFunction) {
  const option = PLACE_SORT_OPTIONS.find((item) => item.value === sort);
  if (!option) return "";
  return t(option.labelKey, { defaultValue: option.defaultValue });
}
