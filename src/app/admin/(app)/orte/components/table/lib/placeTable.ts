import type { TFunction } from "i18next";
import { safeText } from "@/app/admin/(app)/orte/utils";
import type { PlacesTableItem } from "../types";

export function idOf(place: unknown) {
  if (!isRecord(place)) return "";
  return String(place._id || "").trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function rowClassName(checked: boolean, selectMode: boolean) {
  const selected = checked ? " is-selected" : "";
  const mode = selectMode ? " is-selectmode" : "";
  return `list__item chip news-list__row is-fullhover is-interactive${selected}${mode}`;
}

export function rowAriaLabel(
  place: PlacesTableItem,
  selectMode: boolean,
  t: TFunction,
) {
  const key = selectMode ? "selectAria" : "openAria";
  const defaultValue = selectMode ? "Select: {{name}}" : "Open: {{name}}";
  return t(`common.admin.places.row.${key}`, {
    defaultValue,
    name: safeText(place.name),
  });
}

export function toggleOrOpen(
  place: PlacesTableItem,
  selectMode: boolean,
  toggleOne: (id: string) => void,
  onOpen: (place: PlacesTableItem) => void,
) {
  const id = idOf(place);
  if (!id) return;
  if (selectMode) toggleOne(id);
  else onOpen(place);
}
