//src\app\admin\(app)\online-bookings\page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import OnlineBookingDialog from "./OnlineBookingDialog";
import BookingsTableList from "./components/BookingsTableList";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { useNotice } from "./hooks/useNotice";
import { useOnlineBookingsList } from "./hooks/useOnlineBookingsList";
import {
  approvePayment,
  cancelConfirmedBooking,
  confirmBooking,
  deleteBookingsBulk,
  deleteBooking,
  restoreBookingsBulk,
  setBookingStatus,
  PAGE_SIZE,
} from "./api";
import type { Booking, ProgramFilter, Status, StatusOrAll } from "./types";
import { useTranslation } from "react-i18next";

function courseLabel(t: (key: string) => string, program: ProgramFilter) {
  if (program === "camp") return t("common.admin.onlineBookings.course.camp");
  if (program === "power") return t("common.admin.onlineBookings.course.power");
  return t("common.admin.onlineBookings.course.all");
}

function statusLabel(
  t: (key: string) => string,
  params: {
    status: StatusOrAll;
    total: number;
    totalAll: number | null;
    counts: Partial<Record<Status, number>>;
  },
) {
  if (params.status === "all") {
    return `${t("common.admin.onlineBookings.status.all")} (${params.totalAll ?? params.total})`;
  }
  if (params.status === "confirmed") {
    return `${t("common.admin.onlineBookings.status.confirmed")} (${params.counts.confirmed ?? 0})`;
  }
  if (params.status === "cancelled") {
    return `${t("common.admin.onlineBookings.status.cancelled")} (${params.counts.cancelled ?? 0})`;
  }
  return `${t("common.admin.onlineBookings.status.deleted")} (${params.counts.deleted ?? 0})`;
}

function sortLabel(t: (key: string) => string, sort: SortKey) {
  if (sort === "newest") return t("common.admin.onlineBookings.sort.newest");
  if (sort === "oldest") return t("common.admin.onlineBookings.sort.oldest");
  if (sort === "name_asc") return t("common.admin.onlineBookings.sort.nameAsc");
  return t("common.admin.onlineBookings.sort.nameDesc");
}

type SortKey = "newest" | "oldest" | "name_asc" | "name_desc";

function tsOf(v: unknown) {
  const t = new Date(String(v ?? "")).getTime();
  return Number.isFinite(t) ? t : 0;
}

function nameKey(b: Booking) {
  const first = String((b as any)?.firstName ?? "").trim();
  const last = String((b as any)?.lastName ?? "").trim();
  return `${first} ${last}`.trim().toLowerCase();
}

function sortBookings(items: Booking[], sort: SortKey) {
  const arr = [...items];
  if (sort === "newest") {
    return arr.sort(
      (a, b) => tsOf((b as any)?.createdAt) - tsOf((a as any)?.createdAt),
    );
  }
  if (sort === "oldest") {
    return arr.sort(
      (a, b) => tsOf((a as any)?.createdAt) - tsOf((b as any)?.createdAt),
    );
  }
  if (sort === "name_asc") {
    return arr.sort((a, b) =>
      nameKey(a).localeCompare(nameKey(b), "de", { sensitivity: "base" }),
    );
  }
  return arr.sort((a, b) =>
    nameKey(b).localeCompare(nameKey(a), "de", { sensitivity: "base" }),
  );
}

export default function AdminOnlineBookingsPage() {
  const [status, setStatus] = useState<StatusOrAll>("all");
  const [program, setProgram] = useState<ProgramFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [q, setQ] = useState("");
  const qDebounced = useDebouncedValue(q, 300);
  const [page, setPage] = useState(1);
  const limit = PAGE_SIZE;
  const [selectMode, setSelectMode] = useState(false);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const [sel, setSel] = useState<Booking | null>(null);
  const { notice, showOk, showError } = useNotice(5000);
  const { t } = useTranslation();

  const list = useOnlineBookingsList({
    status,
    program,
    q: qDebounced,
    page,
  });

  const [mutating, setMutating] = useState(false);
  const [courseOpen, setCourseOpen] = useState(false);
  const courseTriggerRef = useRef<HTMLButtonElement | null>(null);
  const courseMenuRef = useRef<HTMLUListElement | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const statusTriggerRef = useRef<HTMLButtonElement | null>(null);
  const statusMenuRef = useRef<HTMLUListElement | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const sortTriggerRef = useRef<HTMLButtonElement | null>(null);
  const sortMenuRef = useRef<HTMLUListElement | null>(null);

  const computedStatusLabel = useMemo(
    () =>
      statusLabel(t, {
        status,
        total: list.total,
        totalAll: list.totalAll,
        counts: list.counts,
      }),
    [t, status, list.total, list.totalAll, list.counts],
  );

  const itemsSorted = useMemo(
    () => sortBookings(list.items, sort),
    [list.items, sort],
  );

  useEffect(
    () => setSelectMode(false),
    [page, qDebounced, status, program, sort],
  );

  useEffect(() => {
    if (!courseOpen) return;

    function onPointerDown(ev: PointerEvent) {
      const t = ev.target as Node;
      if (courseTriggerRef.current?.contains(t)) return;
      if (courseMenuRef.current?.contains(t)) return;
      setCourseOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [courseOpen]);

  useEffect(() => {
    if (!statusOpen) return;

    function onPointerDown(ev: PointerEvent) {
      const t = ev.target as Node;
      if (statusTriggerRef.current?.contains(t)) return;
      if (statusMenuRef.current?.contains(t)) return;
      setStatusOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [statusOpen]);

  useEffect(() => {
    if (!sortOpen) return;

    function onPointerDown(ev: PointerEvent) {
      const t = ev.target as Node;
      if (sortTriggerRef.current?.contains(t)) return;
      if (sortMenuRef.current?.contains(t)) return;
      setSortOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [sortOpen]);

  function goPrev() {
    setPage((p) => Math.max(1, p - 1));
  }

  function goNext() {
    setPage((p) => Math.min(list.pages, p + 1));
  }

  function resetToFirstPage() {
    setPage(1);
  }

  function onSearchChange(v: string) {
    setQ(v);
    resetToFirstPage();
  }

  function onSearchKeyDown(key: string) {
    if (key === "Escape") onSearchChange("");
    if (key === "Enter") resetToFirstPage();
  }

  function applyProgram(next: ProgramFilter) {
    setProgram(next);
    setStatus("all");
    resetToFirstPage();
    setCourseOpen(false);
  }

  function applyStatus(next: StatusOrAll) {
    setStatus(next);
    resetToFirstPage();
    setStatusOpen(false);
  }

  function applySort(next: SortKey) {
    setSort(next);
    resetToFirstPage();
    setSortOpen(false);
  }

  async function withMutate<T>(fn: () => Promise<T>) {
    setMutating(true);
    try {
      return await fn();
    } finally {
      setMutating(false);
    }
  }

  async function reloadAfter<T>(fn: () => Promise<T>) {
    const res = await fn();
    await list.reload();
    return res;
  }

  async function onConfirm(id: string, resend: boolean) {
    return withMutate(async () =>
      reloadAfter(() => confirmBooking(id, resend)),
    );
  }

  async function onSetStatus(id: string, next: Status) {
    return withMutate(async () =>
      reloadAfter(() => setBookingStatus(id, next)),
    );
  }

  async function onDeleteOne(id: string) {
    return withMutate(async () => reloadAfter(() => deleteBooking(id)));
  }

  async function onCancelConfirmed(id: string) {
    return withMutate(async () =>
      reloadAfter(() => cancelConfirmedBooking(id)),
    );
  }

  async function onApprovePayment(id: string) {
    return withMutate(async () => reloadAfter(() => approvePayment(id)));
  }

  async function onDeleteMany(ids: string[]) {
    if (!ids.length) return;
    await withMutate(async () => {
      await deleteBookingsBulk(ids);
      await list.reload();
      setSelectMode(false);
    });

    showOk(`(${ids.length}) ${t("common.admin.onlineBookings.bulk.deleted")}.`);
  }

  async function onRestoreMany(ids: string[]) {
    if (!ids.length) return;
    await withMutate(async () => {
      await restoreBookingsBulk(ids);
      await list.reload();
      setSelectMode(false);
    });

    showOk(
      `(${ids.length}) ${t("common.admin.onlineBookings.bulk.restored")}.`,
    );
  }

  useEffect(() => {
    if (!list.error) return;
    showError(list.error);
  }, [list.error, showError]);

  const searchItemStyle = { flex: "1 1 640px", minWidth: 520 } as const;
  const ddItemStyle = { flex: "0 0 220px", minWidth: 200 } as const;
  const sortItemStyle = { flex: "0 0 200px", minWidth: 180 } as const;

  return (
    <div className="news-admin ks online-bookings-admin">
      {notice ? (
        <div
          className={notice.type === "ok" ? "ok" : "error"}
          style={{
            position: "fixed",
            right: 12,
            bottom: 12,
            zIndex: 6000,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "10px 12px",
            boxShadow: "0 10px 25px rgba(17,24,39,.08)",
          }}
        >
          {notice.text}
        </div>
      ) : null}

      <main className="container">
        <div className="ks-online-bookings-toolbar">
          <div className="news-admin__filter" style={searchItemStyle}>
            <div className="input-with-icon">
              <img
                src="/icons/search.svg"
                alt=""
                aria-hidden="true"
                className="input-with-icon__icon"
              />
              <input
                className="input input-with-icon__input"
                placeholder={t(
                  "common.admin.onlineBookings.search.placeholder",
                )}
                value={q}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => onSearchKeyDown(e.key)}
              />
            </div>
          </div>

          <div className="news-admin__filter" style={ddItemStyle}>
            <div
              className={
                "ks-training-select" +
                (courseOpen ? " ks-training-select--open" : "")
              }
            >
              <button
                type="button"
                ref={courseTriggerRef}
                className="ks-training-select__trigger"
                onClick={() => setCourseOpen((o) => !o)}
                disabled={mutating}
                aria-label={t("common.admin.onlineBookings.course.ariaLabel")}
              >
                <span className="ks-training-select__label">
                  {courseLabel(t, program)}
                </span>
                <span
                  className="ks-training-select__chevron"
                  aria-hidden="true"
                />
              </button>

              {courseOpen ? (
                <ul
                  ref={courseMenuRef}
                  className="ks-training-select__menu ks-training-select__menu--grouped"
                  role="listbox"
                  aria-label={t("common.admin.onlineBookings.course.ariaLabel")}
                >
                  <li>
                    <button
                      type="button"
                      className={
                        "ks-training-select__option ks-training-select__option--top" +
                        (program === "all" ? " is-selected" : "")
                      }
                      onClick={() => applyProgram("all")}
                    >
                      {t("common.admin.onlineBookings.course.all")}
                    </button>
                  </li>

                  <li className="ks-training-select__group">
                    <div className="ks-training-select__group-label">
                      {t(
                        "common.admin.onlineBookings.course.group.holidayPrograms",
                      )}
                    </div>

                    <button
                      type="button"
                      className={
                        "ks-training-select__option" +
                        (program === "camp" ? " is-selected" : "")
                      }
                      onClick={() => applyProgram("camp")}
                    >
                      {t("common.admin.onlineBookings.course.camp")}
                    </button>

                    <button
                      type="button"
                      className={
                        "ks-training-select__option" +
                        (program === "power" ? " is-selected" : "")
                      }
                      onClick={() => applyProgram("power")}
                    >
                      {t("common.admin.onlineBookings.course.power")}
                    </button>
                  </li>
                </ul>
              ) : null}
            </div>
          </div>

          <div className="news-admin__filter" style={ddItemStyle}>
            <div
              className={
                "ks-training-select" +
                (statusOpen ? " ks-training-select--open" : "")
              }
            >
              <button
                type="button"
                ref={statusTriggerRef}
                className="ks-training-select__trigger"
                onClick={() => setStatusOpen((o) => !o)}
                disabled={mutating}
                aria-label={t("common.admin.onlineBookings.status.ariaLabel")}
              >
                <span className="ks-training-select__label">
                  {computedStatusLabel}
                </span>
                <span
                  className="ks-training-select__chevron"
                  aria-hidden="true"
                />
              </button>

              {statusOpen ? (
                <ul
                  ref={statusMenuRef}
                  className="ks-training-select__menu"
                  role="listbox"
                  aria-label={t("common.admin.onlineBookings.status.ariaLabel")}
                >
                  <li>
                    <button
                      type="button"
                      className={
                        "ks-training-select__option" +
                        (status === "all" ? " is-selected" : "")
                      }
                      onClick={() => applyStatus("all")}
                    >
                      {t("common.admin.onlineBookings.status.all")} (
                      {list.totalAll ?? list.total})
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className={
                        "ks-training-select__option" +
                        (status === "confirmed" ? " is-selected" : "")
                      }
                      onClick={() => applyStatus("confirmed")}
                    >
                      {t("common.admin.onlineBookings.status.confirmed")} (
                      {list.counts.confirmed ?? 0})
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className={
                        "ks-training-select__option" +
                        (status === "cancelled" ? " is-selected" : "")
                      }
                      onClick={() => applyStatus("cancelled")}
                    >
                      {t("common.admin.onlineBookings.status.cancelled")} (
                      {list.counts.cancelled ?? 0})
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className={
                        "ks-training-select__option" +
                        (status === "deleted" ? " is-selected" : "")
                      }
                      onClick={() => applyStatus("deleted")}
                    >
                      {t("common.admin.onlineBookings.status.deleted")} (
                      {list.counts.deleted ?? 0})
                    </button>
                  </li>
                </ul>
              ) : null}
            </div>
          </div>

          <div className="news-admin__filter" style={sortItemStyle}>
            <div
              className={
                "ks-training-select" +
                (sortOpen ? " ks-training-select--open" : "")
              }
            >
              <button
                type="button"
                ref={sortTriggerRef}
                className="ks-training-select__trigger"
                onClick={() => setSortOpen((o) => !o)}
                disabled={mutating}
                aria-label={t("common.admin.onlineBookings.sort.ariaLabel")}
              >
                <span className="ks-training-select__label">
                  {sortLabel(t, sort)}
                </span>
                <span
                  className="ks-training-select__chevron"
                  aria-hidden="true"
                />
              </button>

              {sortOpen ? (
                <ul
                  ref={sortMenuRef}
                  className="ks-training-select__menu"
                  role="listbox"
                  aria-label={t("common.admin.onlineBookings.sort.ariaLabel")}
                >
                  <li>
                    <button
                      type="button"
                      className={
                        "ks-training-select__option" +
                        (sort === "newest" ? " is-selected" : "")
                      }
                      onClick={() => applySort("newest")}
                    >
                      {t("common.admin.onlineBookings.sort.newest")}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className={
                        "ks-training-select__option" +
                        (sort === "oldest" ? " is-selected" : "")
                      }
                      onClick={() => applySort("oldest")}
                    >
                      {t("common.admin.onlineBookings.sort.oldest")}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className={
                        "ks-training-select__option" +
                        (sort === "name_asc" ? " is-selected" : "")
                      }
                      onClick={() => applySort("name_asc")}
                    >
                      {t("common.admin.onlineBookings.sort.nameAsc")}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className={
                        "ks-training-select__option" +
                        (sort === "name_desc" ? " is-selected" : "")
                      }
                      onClick={() => applySort("name_desc")}
                    >
                      {t("common.admin.onlineBookings.sort.nameDesc")}
                    </button>
                  </li>
                </ul>
              ) : null}
            </div>
          </div>
        </div>

        {list.error ? (
          <div className="card" role="alert">
            <div className="text-red-600">{list.error}</div>
          </div>
        ) : null}

        <section className="news-admin__section">
          <div className="news-admin__section-head-number">
            <span className="news-admin__section-meta">
              {list.total ? `(${list.total})` : ""}
            </span>
          </div>

          <div
            className={
              "news-admin__box news-admin__box--scroll3" +
              (!mutating && !itemsSorted.length ? " is-empty" : "")
            }
          >
            <BookingsTableList
              items={itemsSorted}
              selectMode={selectMode}
              busy={mutating}
              onToggleSelectMode={() => setSelectMode((p) => !p)}
              onOpen={(b) => setSel(b)}
              onDeleteMany={onDeleteMany}
              onRestoreMany={onRestoreMany}
              toggleBtnRef={toggleBtnRef}
            />
          </div>

          <div className="pager pager--arrows mt-3">
            <button
              type="button"
              className="btn"
              aria-label={t(
                "common.admin.onlineBookings.pagination.previousPage",
              )}
              disabled={mutating || page <= 1}
              onClick={goPrev}
            >
              <img
                src="/icons/arrow_right_alt.svg"
                alt=""
                aria-hidden="true"
                className="icon-img icon-img--left"
              />
            </button>

            <div className="pager__count" aria-live="polite" aria-atomic="true">
              {page} / {list.pages}
            </div>

            <button
              type="button"
              className="btn"
              aria-label={t("common.admin.onlineBookings.pagination.nextPage")}
              disabled={mutating || page >= list.pages}
              onClick={goNext}
            >
              <img
                src="/icons/arrow_right_alt.svg"
                alt=""
                aria-hidden="true"
                className="icon-img"
              />
            </button>
          </div>
        </section>
      </main>

      {sel ? (
        <OnlineBookingDialog
          booking={sel}
          onClose={() => setSel(null)}
          onConfirm={() => onConfirm(sel._id, false)}
          onResend={() => onConfirm(sel._id, true)}
          onSetStatus={(s) => onSetStatus(sel._id, s as Status)}
          onDelete={() => onDeleteOne(sel._id)}
          onCancelConfirmed={() => onCancelConfirmed(sel._id)}
          onApprovePayment={() => onApprovePayment(sel._id)}
          notify={showOk}
          onUpdateBooking={(patch) => {
            setSel((prev) => (prev ? { ...prev, ...patch } : prev));
            list.reload();
          }}
        />
      ) : null}
    </div>
  );
}
