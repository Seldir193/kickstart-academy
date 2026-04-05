"use client";

import type { Booking } from "../types";
import { asStatus, formatDateDe, programAbbr, safeText } from "../utils";

export function idOf(b: Booking) {
  return String(b?._id || "").trim();
}

export function restoreIds(items: Booking[], ids: Set<string>) {
  return items
    .filter((b) => ids.has(b._id) && b.status === "deleted")
    .map((b) => b._id);
}

export function renderRow(
  b: Booking,
  selectMode: boolean,
  selected: Set<string>,
  onRowClick: (b: Booking) => void,
  onOpen: (b: Booking) => void,
  busyRowId: string | null,
  t: (key: string) => string,
) {
  const id = String(b?._id || "").trim();
  const checked = selected.has(id);
  const hideEdit = selectMode || checked;
  const rowBusy = Boolean(busyRowId && busyRowId === id);

  return (
    <li
      key={id}
      className={`list__item chip news-list__row is-fullhover is-interactive ${checked ? "is-selected" : ""} ${
        selectMode ? "is-selectmode" : ""
      }`}
      onClick={() => onRowClick(b)}
      onKeyDown={(e) => onKeyActivate(e, () => onRowClick(b))}
      tabIndex={0}
      role="button"
      aria-pressed={selectMode ? checked : undefined}
      aria-label={selectMode ? labelSelect(b, t) : labelOpen(b, t)}
    >
      <div className="news-list__cell news-list__cell--name">
        <div className="news-list__title">
          {safeText(b.firstName)} {safeText(b.lastName)}
        </div>
      </div>

      <div className="news-list__cell news-list__cell--email">
        {/* {safeText(b.email) || "—"} */}
        {safeText(b.email) || t("common.admin.bookings.row.empty")}
      </div>

      <div className="news-list__cell news-list__cell--date bookings-mono">
        {formatDateDe(b.date)}
      </div>

      <div className="news-list__cell news-list__cell--program bookings-mono">
        {programAbbr(b)}
      </div>

      <div className="news-list__cell news-list__cell--status">
        {asStatus(b.status)}
      </div>

      <div className="news-list__cell news-list__cell--payment">
        {renderPayment(b, t)}
      </div>

      <div className="news-list__cell news-list__cell--created">
        {formatDateDe(b.createdAt)}
      </div>

      {hideEdit ? (
        <div
          className="news-list__cell news-list__cell--action news-list__actions--hidden"
          aria-hidden="true"
        />
      ) : (
        <div
          className="news-list__cell news-list__cell--action"
          onClick={(e) => stopAndRun(e, () => onOpen(b))}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <span
            className="edit-trigger"
            role="button"
            tabIndex={0}
            // aria-label="Open"
            aria-label={t("common.admin.bookings.row.openAction")}
            aria-disabled={rowBusy ? true : undefined}
          >
            <img
              src="/icons/edit.svg"
              alt=""
              aria-hidden="true"
              className="icon-img"
            />
          </span>
        </div>
      )}
    </li>
  );
}

function renderPayment(b: Booking, t: (key: string) => string) {
  const p = String(b?.paymentStatus || "")
    .trim()
    .toLowerCase();

  // if (!p) return "—";
  if (!p) return t("common.admin.bookings.row.empty");

  const cls =
    p === "paid"
      ? "badge badge-success"
      : p === "returned"
        ? "badge badge-danger"
        : "badge";

  return <span className={cls}>{p}</span>;
}

export function focusClearOrCancel(
  selectMode: boolean,
  count: number,
  prevCountRef: React.MutableRefObject<number>,
  clearBtnRef: React.RefObject<HTMLButtonElement | null>,
  cancelBtnRef: React.RefObject<HTMLButtonElement | null>,
) {
  if (!selectMode) {
    prevCountRef.current = 0;
    return;
  }

  const prev = prevCountRef.current;
  prevCountRef.current = count;

  if (count >= 2) {
    requestAnimationFrame(() => clearBtnRef.current?.focus());
  }

  if (prev >= 2 && count < 2) {
    requestAnimationFrame(() => cancelBtnRef.current?.focus());
  }
}

function labelSelect(b: Booking, t: (key: string) => string) {
  return `${t("common.admin.bookings.row.select")}: ${safeText(b.firstName)} ${safeText(b.lastName)}`;
}

function labelOpen(b: Booking, t: (key: string) => string) {
  return `${t("common.admin.bookings.row.open")}: ${safeText(b.firstName)} ${safeText(b.lastName)}`;
}

// function labelSelect(b: Booking) {
//   return `Select: ${safeText(b.firstName)} ${safeText(b.lastName)}`;
// }

// function labelOpen(b: Booking) {
//   return `Open: ${safeText(b.firstName)} ${safeText(b.lastName)}`;
// }

function onKeyActivate(e: React.KeyboardEvent, run: () => void) {
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  run();
}

function stopAndRun(e: React.SyntheticEvent, run: () => void) {
  e.stopPropagation();
  run();
}
