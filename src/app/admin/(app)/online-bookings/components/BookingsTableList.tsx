// src\app\admin\(app)\online-bookings\components\BookingsTableList.tsx
"use client";

import type { RefObject } from "react";
import { useEffect, useMemo, useRef } from "react";
import BulkActions from "@/app/admin/(app)/news/components/BulkActions";
import { useSelection } from "@/app/admin/(app)/news/hooks/useSelection";
import type { Booking } from "../types";
import {
  asStatus,
  // formatDateDE,
  programAbbr,
  safeText,
  formatDateOnlyDE,
} from "../utils";

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

function id_of(b: Booking) {
  return String(b?._id || "").trim();
}

function get_restore_ids(items: Booking[], ids: Set<string>) {
  return items
    .filter((b) => ids.has(b._id) && b.status === "deleted")
    .map((b) => b._id);
}

function render_payment(b: Booking) {
  const payment = String(b?.paymentStatus || "")
    .trim()
    .toLowerCase();
  if (!payment) return "—";

  const class_name =
    payment === "paid"
      ? "badge badge-success"
      : payment === "returned"
        ? "badge badge-danger"
        : "badge";

  return <span className={class_name}>{payment}</span>;
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
  const ids_on_page = useMemo(() => items.map(id_of).filter(Boolean), [items]);
  const sel = useSelection(ids_on_page);

  const cancel_btn_ref = useRef<HTMLButtonElement | null>(null);
  const clear_btn_ref = useRef<HTMLButtonElement | null>(null);
  const prev_count_ref = useRef(0);

  const count = sel.selected.size;
  const show_clear = selectMode && count >= 2;

  useEffect(() => {
    if (!selectMode) {
      prev_count_ref.current = 0;
      return;
    }

    const prev = prev_count_ref.current;
    prev_count_ref.current = count;

    if (count >= 2) {
      requestAnimationFrame(() => clear_btn_ref.current?.focus());
      return;
    }

    if (prev >= 2 && count < 2) {
      requestAnimationFrame(() => cancel_btn_ref.current?.focus());
    }
  }, [selectMode, count]);

  async function delete_selected() {
    const ids = Array.from(sel.selected);
    if (!ids.length) return;
    await onDeleteMany(ids);
    sel.clear();
    onToggleSelectMode();
  }

  async function restore_selected() {
    const ids = get_restore_ids(items, sel.selected);
    if (!ids.length) return;
    await onRestoreMany(ids);
    sel.clear();
    onToggleSelectMode();
  }

  function toggle_all() {
    sel.isAllSelected ? sel.removeAll() : sel.selectAll();
  }

  function clear_selection() {
    sel.clear();
    requestAnimationFrame(() => cancel_btn_ref.current?.focus());
  }

  function on_row_click(b: Booking) {
    const id = id_of(b);
    if (!id) return;
    if (selectMode) sel.toggleOne(id);
    else onOpen(b);
  }

  if (!items.length) {
    return (
      <section className="card">
        <div className="card__empty">
          {busy ? "Loading…" : "Keine Einträge."}
        </div>
      </section>
    );
  }

  const restore_count = get_restore_ids(items, sel.selected).length;

  return (
    <div className="news-table">
      <div className="news-admin__top-actions">
        <BulkActions
          toggleRef={toggleBtnRef as RefObject<HTMLButtonElement | null>}
          cancelRef={cancel_btn_ref}
          clearRef={clear_btn_ref}
          selectMode={selectMode}
          onToggleSelectMode={() => {
            sel.clear();
            onToggleSelectMode();
          }}
          count={count}
          isAllSelected={sel.isAllSelected}
          busy={busy}
          isEmpty={items.length === 0}
          //disabled={busy || items.length === 0}
          onToggleAll={toggle_all}
          onClear={clear_selection}
          showClear={show_clear}
          onDelete={delete_selected}
        />

        {selectMode && restore_count ? (
          <button
            type="button"
            className="btn"
            disabled={busy}
            onClick={restore_selected}
          >
            Wiederherstellen ({restore_count})
          </button>
        ) : null}
      </div>

      <div className="news-table__scroll">
        <section className="card news-list">
          <div className="news-list__table">
            {/* <div className="news-list__head" aria-hidden="true">
              <div className="news-list__h">Name</div>
              <div className="news-list__h">Email</div>
              <div className="news-list__h">Age</div>
              <div className="news-list__h">Programm</div>
              <div className="news-list__h">Status</div>
              <div className="news-list__h">Created</div>
              <div className="news-list__h news-list__h--right">Aktion</div>
            </div> */}

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
                const id = id_of(b);
                const checked = sel.selected.has(id);
                const hide_edit = selectMode || checked;

                return (
                  <li
                    key={id}
                    className={`list__item chip news-list__row is-fullhover is-interactive ${
                      checked ? "is-selected" : ""
                    } ${selectMode ? "is-selectmode" : ""}`}
                    onClick={() => on_row_click(b)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        on_row_click(b);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-pressed={selectMode ? checked : undefined}
                    aria-label={
                      selectMode
                        ? `Select: ${safeText(b.firstName)} ${safeText(b.lastName)}`
                        : `Open: ${safeText(b.firstName)} ${safeText(b.lastName)}`
                    }
                  >
                    <div className="news-list__cell">
                      <div className="news-list__title">
                        {safeText(b.firstName)} {safeText(b.lastName)}
                      </div>
                      <div className="news-list__excerpt is-empty">—</div>
                    </div>

                    <div className="news-list__cell news-list__cell--email">
                      {safeText(b.email) || "—"}
                    </div>

                    {/* <div className="news-list__cell bookings-mono">
                      {Number.isFinite(Number(b.age)) ? String(b.age) : "—"}
                    </div>

                    <div className="news-list__cell bookings-mono">
                      {programAbbr(b)}
                    </div>

                    <div className="news-list__cell">{asStatus(b.status)}</div>

                    <div className="news-list__cell">
                      {formatDateDE(b.createdAt)}
                    </div> */}

                    <div className="news-list__cell bookings-mono">
                      {Number.isFinite(Number(b.age)) ? String(b.age) : "—"}
                    </div>

                    <div className="news-list__cell bookings-mono">
                      {formatDateOnlyDE(b.date)}
                    </div>

                    <div className="news-list__cell bookings-mono">
                      {programAbbr(b)}
                    </div>

                    <div className="news-list__cell">{asStatus(b.status)}</div>

                    <div className="news-list__cell">{render_payment(b)}</div>

                    <div className="news-list__cell">
                      {formatDateOnlyDE(b.createdAt)}
                    </div>

                    {!hide_edit ? (
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
                    ) : (
                      <div
                        className="news-list__cell news-list__cell--action news-list__actions--hidden"
                        aria-hidden="true"
                      />
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
