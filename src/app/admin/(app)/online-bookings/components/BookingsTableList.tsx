//src\app\admin\(app)\online-bookings\components\BookingsTableList.tsx
"use client";

import type { RefObject } from "react";
import { useEffect, useMemo, useRef } from "react";
import BulkActions from "@/app/admin/(app)/news/components/BulkActions";
import { useSelection } from "@/app/admin/(app)/news/hooks/useSelection";
import type { Booking } from "../types";
import { asStatus, formatDateOnlyDE, programAbbr, safeText } from "../utils";

import { useTranslation } from "react-i18next";

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

function renderPayment(t: (key: string) => string, b: Booking) {
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

  const label =
    payment === "paid"
      ? t("common.admin.onlineBookings.payment.paid")
      : payment === "returned"
        ? t("common.admin.onlineBookings.payment.returned")
        : payment;

  return <span className={className}>{label}</span>;
}

function rowLabel(t: (key: string) => string, b: Booking, selectMode: boolean) {
  const fullName = `${safeText(b.firstName)} ${safeText(b.lastName)}`.trim();

  return `${selectMode ? t("common.admin.onlineBookings.table.row.select") : t("common.admin.onlineBookings.table.row.open")}: ${fullName}`;
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
  const { t } = useTranslation();

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
        <div className="card__empty">
          {busy
            ? t("common.admin.onlineBookings.table.loading")
            : t("common.admin.onlineBookings.table.empty")}
        </div>
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
          toggleLabel={t("common.admin.onlineBookings.bulk.toggleLabel")}
          selectedLabel={t("common.admin.onlineBookings.bulk.selectedLabel")}
          selectAllLabel={t("common.admin.onlineBookings.bulk.selectAllLabel")}
          clearAllLabel={t("common.admin.onlineBookings.bulk.clearAllLabel")}
          deleteLabel={t("common.admin.onlineBookings.bulk.deleteLabel")}
          cancelLabel={t("common.admin.onlineBookings.bulk.cancelLabel")}
        />

        {selectMode && restoreCount ? (
          <button
            type="button"
            className="btn"
            disabled={busy}
            onClick={restoreSelected}
          >
            {t("common.admin.onlineBookings.bulk.restoreLabel")} ({restoreCount}
            )
          </button>
        ) : null}
      </div>

      <div className="news-table__scroll">
        <section className="card news-list">
          <div className="news-list__table">
            <div className="news-list__head" aria-hidden="true">
              <div className="news-list__h">
                {t("common.admin.onlineBookings.table.head.name")}
              </div>
              <div className="news-list__h">
                {t("common.admin.onlineBookings.table.head.email")}
              </div>
              <div className="news-list__h">
                {t("common.admin.onlineBookings.table.head.age")}
              </div>
              <div className="news-list__h">
                {t("common.admin.onlineBookings.table.head.date")}
              </div>
              <div className="news-list__h">
                {t("common.admin.onlineBookings.table.head.program")}
              </div>
              <div className="news-list__h">
                {t("common.admin.onlineBookings.table.head.status")}
              </div>
              <div className="news-list__h">
                {t("common.admin.onlineBookings.table.head.payment")}
              </div>
              <div className="news-list__h">
                {t("common.admin.onlineBookings.table.head.created")}
              </div>
              <div className="news-list__h news-list__h--right">
                {t("common.admin.onlineBookings.table.head.action")}
              </div>
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
                    aria-label={rowLabel(t, b, selectMode)}
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
                      {b.age == null
                        ? "—"
                        : Number.isFinite(Number(b.age))
                          ? String(b.age)
                          : "—"}
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
                      {renderPayment(t, b)}
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
                          aria-label={t(
                            "common.admin.onlineBookings.table.edit",
                          )}
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
