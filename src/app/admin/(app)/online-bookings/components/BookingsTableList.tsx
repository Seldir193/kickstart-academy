"use client";

import type { RefObject } from "react";
import { useEffect, useMemo, useRef } from "react";
import BulkActions from "@/app/admin/(app)/news/components/BulkActions";
import { useSelection } from "@/app/admin/(app)/news/hooks/useSelection";
import type { Booking } from "../types";
import { asStatus, formatDateOnlyDE, programAbbr, safeText } from "../utils";

type Props = {
  items: Booking[];
  selectMode: boolean;
  busy: boolean;
  onToggleSelectMode: () => void;
  onOpen: (b: Booking) => void;
  onDeleteMany: (ids: string[]) => Promise<void>;
  onRestoreMany: (ids: string[]) => Promise<void>;
  toggleBtnRef?: RefObject<HTMLButtonElement | null>;
};

function idOf(b: Booking) {
  return String(b?._id || "").trim();
}

function getRestoreIds(items: Booking[], ids: Set<string>) {
  return items
    .filter((b) => ids.has(b._id) && b.status === "deleted")
    .map((b) => b._id);
}

function renderPayment(b: Booking) {
  const payment = String(b?.paymentStatus || "")
    .trim()
    .toLowerCase();

  if (!payment) return "—";

  const className =
    payment === "paid"
      ? "badge badge-success"
      : payment === "returned"
        ? "badge badge-danger"
        : "badge";

  return <span className={className}>{payment}</span>;
}

function rowLabel(b: Booking, selectMode: boolean) {
  const fullName = `${safeText(b.firstName)} ${safeText(b.lastName)}`.trim();
  return `${selectMode ? "Select" : "Open"}: ${fullName}`;
}

function onKeyActivate(e: React.KeyboardEvent<HTMLLIElement>, run: () => void) {
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  run();
}

export default function BookingsTableList({
  items,
  selectMode,
  busy,
  onToggleSelectMode,
  onOpen,
  onDeleteMany,
  onRestoreMany,
  toggleBtnRef,
}: Props) {
  const idsOnPage = useMemo(() => items.map(idOf).filter(Boolean), [items]);
  const sel = useSelection(idsOnPage);
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
  const clearBtnRef = useRef<HTMLButtonElement | null>(null);
  const prevCountRef = useRef(0);

  const count = sel.selected.size;
  const showClear = selectMode && count >= 2;
  const restoreCount = getRestoreIds(items, sel.selected).length;

  useEffect(() => {
    if (!selectMode) {
      prevCountRef.current = 0;
      return;
    }

    const prev = prevCountRef.current;
    prevCountRef.current = count;

    if (count >= 2) {
      requestAnimationFrame(() => clearBtnRef.current?.focus());
      return;
    }

    if (prev >= 2 && count < 2) {
      requestAnimationFrame(() => cancelBtnRef.current?.focus());
    }
  }, [selectMode, count]);

  async function deleteSelected() {
    const ids = Array.from(sel.selected);
    if (!ids.length) return;
    await onDeleteMany(ids);
    sel.clear();
    onToggleSelectMode();
  }

  async function restoreSelected() {
    const ids = getRestoreIds(items, sel.selected);
    if (!ids.length) return;
    await onRestoreMany(ids);
    sel.clear();
    onToggleSelectMode();
  }

  function toggleAll() {
    sel.isAllSelected ? sel.removeAll() : sel.selectAll();
  }

  function clearSelection() {
    sel.clear();
    requestAnimationFrame(() => cancelBtnRef.current?.focus());
  }

  function onRowClick(b: Booking) {
    const id = idOf(b);
    if (!id) return;
    if (selectMode) sel.toggleOne(id);
    else onOpen(b);
  }

  if (!items.length) {
    return (
      <section className="card">
        <div className="card__empty">{busy ? "Loading..." : "No entries."}</div>
      </section>
    );
  }

  return (
    <div className="news-table">
      <div className="news-admin__top-actions">
        <BulkActions
          toggleRef={toggleBtnRef as RefObject<HTMLButtonElement | null>}
          cancelRef={cancelBtnRef}
          clearRef={clearBtnRef}
          selectMode={selectMode}
          onToggleSelectMode={() => {
            sel.clear();
            onToggleSelectMode();
          }}
          count={count}
          isAllSelected={sel.isAllSelected}
          busy={busy}
          isEmpty={items.length === 0}
          onToggleAll={toggleAll}
          onClear={clearSelection}
          showClear={showClear}
          onDelete={deleteSelected}
          toggleLabel="Select holiday bookings"
          selectedLabel="selected"
          selectAllLabel="Select all"
          clearAllLabel="Clear all"
          deleteLabel="Delete"
          cancelLabel="Cancel"
        />

        {selectMode && restoreCount ? (
          <button
            type="button"
            className="btn"
            disabled={busy}
            onClick={restoreSelected}
          >
            Restore ({restoreCount})
          </button>
        ) : null}
      </div>

      <div className="news-table__scroll">
        <section className="card news-list">
          <div className="news-list__table">
            <div className="news-list__head" aria-hidden="true">
              <div className="news-list__h">Name</div>
              <div className="news-list__h">Email</div>
              <div className="news-list__h">Age</div>
              <div className="news-list__h">Date</div>
              <div className="news-list__h">Program</div>
              <div className="news-list__h">Status</div>
              <div className="news-list__h">Payment</div>
              <div className="news-list__h">Created</div>
              <div className="news-list__h news-list__h--right">Action</div>
            </div>

            <ul className="list list--bleed">
              {items.map((b) => {
                const id = idOf(b);
                const checked = sel.selected.has(id);
                const hideEdit = selectMode || checked;

                return (
                  <li
                    key={id}
                    className={`list__item chip news-list__row is-fullhover is-interactive ${
                      checked ? "is-selected" : ""
                    } ${selectMode ? "is-selectmode" : ""}`}
                    onClick={() => onRowClick(b)}
                    onKeyDown={(e) => onKeyActivate(e, () => onRowClick(b))}
                    tabIndex={0}
                    role="button"
                    aria-pressed={selectMode ? checked : undefined}
                    aria-label={rowLabel(b, selectMode)}
                  >
                    <div className="news-list__cell news-list__cell--name">
                      <div className="news-list__title">
                        {safeText(b.firstName)} {safeText(b.lastName)}
                      </div>
                    </div>

                    <div className="news-list__cell news-list__cell--email">
                      {safeText(b.email) || "—"}
                    </div>

                    <div className="news-list__cell news-list__cell--age bookings-mono">
                      {Number.isFinite(Number(b.age)) ? String(b.age) : "—"}
                    </div>

                    <div className="news-list__cell news-list__cell--date bookings-mono">
                      {formatDateOnlyDE(b.date)}
                    </div>

                    <div className="news-list__cell news-list__cell--program bookings-mono">
                      {programAbbr(b)}
                    </div>

                    <div className="news-list__cell news-list__cell--status">
                      {asStatus(b.status)}
                    </div>

                    <div className="news-list__cell news-list__cell--payment">
                      {renderPayment(b)}
                    </div>

                    <div className="news-list__cell news-list__cell--created">
                      {formatDateOnlyDE(b.createdAt)}
                    </div>

                    {hideEdit ? (
                      <div
                        className="news-list__cell news-list__cell--action news-list__actions--hidden"
                        aria-hidden="true"
                      />
                    ) : (
                      <div
                        className="news-list__cell news-list__cell--action"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpen(b);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <span
                          className="edit-trigger"
                          role="button"
                          tabIndex={0}
                          aria-label="Edit"
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
              })}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
