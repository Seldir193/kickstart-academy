import type { KeyboardEvent } from "react";
import type { Booking } from "../../../types";
import { safeText } from "../../../utils";
import type { Translator } from "../types";

export function idOf(b: Booking) {
  return String(b?._id || "").trim();
}

export function getRestoreIds(items: Booking[], ids: Set<string>) {
  return items.filter((b) => isRestoreTarget(b, ids)).map((b) => b._id);
}

function isRestoreTarget(b: Booking, ids: Set<string>) {
  return ids.has(b._id) && b.status === "deleted";
}

export function rowLabel(t: Translator, b: Booking, selectMode: boolean) {
  const fullName = `${safeText(b.firstName)} ${safeText(b.lastName)}`.trim();
  const key = selectMode ? "select" : "open";

  return `${t(`common.admin.onlineBookings.table.row.${key}`)}: ${fullName}`;
}

export function onKeyActivate(
  e: KeyboardEvent<HTMLLIElement>,
  run: () => void,
) {
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  run();
}

export function getRowClassName(checked: boolean, selectMode: boolean) {
  return [
    "list__item chip news-list__row is-fullhover is-interactive",
    checked ? "is-selected" : "",
    selectMode ? "is-selectmode" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function getAgeText(age: Booking["age"]) {
  if (age == null) return "—";
  return Number.isFinite(Number(age)) ? String(age) : "—";
}
