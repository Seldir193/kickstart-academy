import type { KeyboardEvent, MutableRefObject, RefObject, SyntheticEvent } from "react";
import type { Booking } from "../../types";
import { asStatus, formatDateOnly, programAbbr, safeText } from "../../utils";
import type { TFn } from "./types";

export function idOf(b: Booking) {
  return String(b?._id || "").trim();
}

export function restoreIds(items: Booking[], ids: Set<string>) {
  return items.filter((b) => canRestore(b, ids)).map((b) => b._id);
}

function canRestore(b: Booking, ids: Set<string>) {
  return ids.has(b._id) && b.status === "deleted";
}

export function labelSelect(b: Booking, t: TFn) {
  return `${t("common.admin.bookings.row.select")}: ${rowName(b)}`;
}

export function labelOpen(b: Booking, t: TFn) {
  return `${t("common.admin.bookings.row.open")}: ${rowName(b)}`;
}

function rowName(b: Booking) {
  return `${safeText(b.firstName)} ${safeText(b.lastName)}`;
}

export function onKeyActivate(e: KeyboardEvent, run: () => void) {
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  run();
}

export function stopAndRun(e: SyntheticEvent, run: () => void) {
  e.stopPropagation();
  run();
}

export function paymentClass(status: string) {
  if (status === "paid") return "badge badge-success";
  if (status === "returned") return "badge badge-danger";
  return "badge";
}

export function paymentStatus(b: Booking) {
  return String(b?.paymentStatus || "").trim().toLowerCase();
}

export function bookingAge(b: Booking) {
  return safeText((b as any).age) || "—";
}

export { asStatus, formatDateOnly, programAbbr, safeText };

export function focusClearOrCancel(
  selectMode: boolean,
  count: number,
  prevCountRef: MutableRefObject<number>,
  clearBtnRef: RefObject<HTMLButtonElement | null>,
  cancelBtnRef: RefObject<HTMLButtonElement | null>,
) {
  if (!selectMode) return resetPrevious(prevCountRef);
  const prev = syncPrevious(prevCountRef, count);
  if (prev < 2 && count >= 2) return focusClear(clearBtnRef);
  if (prev >= 2 && count < 2) blurBulkRefs(clearBtnRef, cancelBtnRef);
}

function resetPrevious(prevCountRef: MutableRefObject<number>) {
  prevCountRef.current = 0;
}

function syncPrevious(prevCountRef: MutableRefObject<number>, count: number) {
  const prev = prevCountRef.current;
  prevCountRef.current = count;
  return prev;
}

function focusClear(clearBtnRef: RefObject<HTMLButtonElement | null>) {
  requestAnimationFrame(() => clearBtnRef.current?.focus());
}

export function blurBulkRefs(
  clearBtnRef: RefObject<HTMLButtonElement | null>,
  cancelBtnRef: RefObject<HTMLButtonElement | null>,
) {
  requestAnimationFrame(() => blurRefs(clearBtnRef, cancelBtnRef));
}

function blurRefs(
  clearBtnRef: RefObject<HTMLButtonElement | null>,
  cancelBtnRef: RefObject<HTMLButtonElement | null>,
) {
  clearBtnRef.current?.blur();
  cancelBtnRef.current?.blur();
}
