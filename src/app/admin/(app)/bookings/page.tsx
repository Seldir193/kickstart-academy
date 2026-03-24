//src\app\admin\(app)\bookings\page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import BookingDialog from "@/app/admin/(app)/bookings/BookingDialog";
import BookingsTableList from "./components/BookingsTableList";
import FiltersBar from "./components/FiltersBar";
import Pager from "./components/Pager";
import NoticeToast from "./components/NoticeToast";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { useNotice } from "./hooks/useNotice";
import { useBookingsList } from "./hooks/useBookingsList";
import {
  cancelConfirmedBooking,
  confirmBooking,
  deleteBulk,
  deleteBooking,
  fetchBookingDetails,
  restoreBulk,
  setBookingStatus,
} from "./api";
import type { Booking, ProgramFilter, Status, StatusOrAll } from "./types";
import { programLabel, statusLabel } from "./utils";
import { sortBookings } from "./page.helpers";
import { useDropdown } from "./components/useDropdown";

type SortKey = "newest" | "oldest" | "nameAsc" | "nameDesc";

type Busy =
  | { kind: "row"; id: string }
  | { kind: "bulk_delete" }
  | { kind: "bulk_restore" }
  | null;

type BookingDialogDetail = {
  child?: {
    firstName?: string;
    lastName?: string;
    gender?: string;
    birthDate?: string | null;
  } | null;
  parent?: {
    salutation?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  } | null;
  contact?: string;
  address?: string;
} | null;

type DialogBooking = Booking & {
  detail?: BookingDialogDetail;
};

function sortLabel(sort: SortKey) {
  const map: Record<SortKey, string> = {
    newest: "Newest first",
    oldest: "Oldest first",
    nameAsc: "Name A–Z",
    nameDesc: "Name Z–A",
  };
  return map[sort] || "Newest first";
}

export default function AdminBookingsPage() {
  const [status, setStatus] = useState<StatusOrAll>("all");
  const [program, setProgram] = useState<ProgramFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [q, setQ] = useState("");
  const qDebounced = useDebouncedValue(q, 300);

  const [page, setPage] = useState(1);
  const [selectMode, setSelectMode] = useState(false);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);

  const [sel, setSel] = useState<DialogBooking | null>(null);
  const { notice, showOk, showError } = useNotice(5000);

  const list = useBookingsList({ status, program, q: qDebounced, page });
  const [busy, setBusy] = useState<Busy>(null);

  const programDd = useDropdown();
  const statusDd = useDropdown();
  const sortDd = useDropdown();

  const computedStatusLabel = useMemo(
    () =>
      statusLabel({
        status,
        total: list.total,
        totalAll: list.totalAll,
        counts: list.counts,
      }),
    [status, list.total, list.totalAll, list.counts],
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
    if (!list.error) return;
    showError(list.error);
  }, [list.error, showError]);

  async function run<T>(nextBusy: Busy, fn: () => Promise<T>) {
    setBusy(nextBusy);
    try {
      return await fn();
    } finally {
      setBusy(null);
    }
  }

  async function reloadAfter<T>(fn: () => Promise<T>) {
    const res = await fn();
    await list.reload();
    return res;
  }

  async function onConfirm(id: string, resend: boolean, manual = false) {
    return run({ kind: "row", id }, () =>
      reloadAfter(() => confirmBooking(id, resend, manual)),
    );
  }

  async function onSetStatus(id: string, next: Status) {
    return run({ kind: "row", id }, () =>
      reloadAfter(() => setBookingStatus(id, next)),
    );
  }

  async function onDeleteOne(id: string) {
    return run({ kind: "row", id }, () => reloadAfter(() => deleteBooking(id)));
  }

  async function onCancelConfirmed(id: string) {
    return run({ kind: "row", id }, () =>
      reloadAfter(() => cancelConfirmedBooking(id)),
    );
  }

  async function onDeleteMany(ids: string[]) {
    if (!ids.length) return;
    await run({ kind: "bulk_delete" }, async () => {
      await deleteBulk(ids);
      await list.reload();
      setSelectMode(false);
    });
    showOk(`Deleted (${ids.length}).`);
  }

  async function onRestoreMany(ids: string[]) {
    if (!ids.length) return;
    await run({ kind: "bulk_restore" }, async () => {
      await restoreBulk(ids);
      await list.reload();
      setSelectMode(false);
    });
    showOk(`Restored (${ids.length}).`);
  }

  async function openBooking(b: Booking) {
    if (b.source !== "admin_booking") {
      setSel(b);
      return;
    }

    try {
      const data = await fetchBookingDetails(b._id);
      setSel({
        ...b,
        detail: data?.detail || null,
      });
    } catch (e: any) {
      showError(e?.message || "Details konnten nicht geladen werden");
      setSel(b);
    }
  }

  function onSearchChange(v: string) {
    setQ(v);
    setPage(1);
  }

  function onSearchKeyDown(key: string) {
    if (key === "Escape") onSearchChange("");
    if (key === "Enter") setPage(1);
  }

  function applyProgram(next: ProgramFilter) {
    setProgram(next);
    setStatus("all");
    setPage(1);
    programDd.close();
  }

  function applyStatus(next: StatusOrAll) {
    setStatus(next);
    setPage(1);
    statusDd.close();
  }

  function applySort(next: SortKey) {
    setSort(next);
    setPage(1);
    sortDd.close();
  }

  function goPrev() {
    setPage((p) => Math.max(1, p - 1));
  }

  function goNext() {
    setPage((p) => Math.min(list.pages, p + 1));
  }

  const searchItemStyle = { flex: "1 1 640px", minWidth: 520 } as const;
  const ddItemStyle = { flex: "0 0 220px", minWidth: 200 } as const;
  const sortItemStyle = { flex: "0 0 200px", minWidth: 180 } as const;

  const busyRowId = busy?.kind === "row" ? busy.id : null;
  const busyBulkDelete = busy?.kind === "bulk_delete";
  const busyBulkRestore = busy?.kind === "bulk_restore";

  return (
    <div className="news-admin ks bookings-admin">
      {notice ? <NoticeToast notice={notice} /> : null}

      <main className="container">
        <div className="dialog-subhead news-admin__subhead">
          <h1 className="text-2xl font-bold m-0 news-admin__title">Bookings</h1>
        </div>

        <FiltersBar
          q={q}
          onSearchChange={onSearchChange}
          onSearchKeyDown={onSearchKeyDown}
          searchItemStyle={searchItemStyle}
          ddItemStyle={ddItemStyle}
          sortItemStyle={sortItemStyle}
          programDd={programDd}
          statusDd={statusDd}
          sortDd={sortDd}
          programLabel={programLabel(program)}
          statusLabel={computedStatusLabel}
          sortLabel={sortLabel(sort)}
          program={program}
          status={status}
          sort={sort}
          list={list}
          onProgram={applyProgram}
          onStatus={applyStatus}
          onSort={applySort}
        />

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
              (!itemsSorted.length ? " is-empty" : "")
            }
          >
            <BookingsTableList
              items={itemsSorted}
              selectMode={selectMode}
              onToggleSelectMode={() => setSelectMode((p) => !p)}
              onOpen={openBooking}
              onDeleteMany={onDeleteMany}
              onRestoreMany={onRestoreMany}
              toggleBtnRef={toggleBtnRef}
              busyRowId={busyRowId}
              busyBulkDelete={busyBulkDelete}
              busyBulkRestore={busyBulkRestore}
            />
          </div>

          <Pager
            page={page}
            pages={list.pages}
            onPrev={goPrev}
            onNext={goNext}
          />
        </section>
      </main>

      {sel ? (
        <BookingDialog
          booking={sel}
          onClose={() => setSel(null)}
          onConfirm={() => onConfirm(sel._id, false, true)}
          onResend={() => onConfirm(sel._id, true, true)}
          onSetStatus={(s) => onSetStatus(sel._id, s as Status)}
          onDelete={() => onDeleteOne(sel._id)}
          onCancelConfirmed={() => onCancelConfirmed(sel._id)}
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
