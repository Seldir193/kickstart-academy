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

  // async function onConfirm(id: string, resend: boolean) {
  //   return run({ kind: "row", id }, () =>
  //     reloadAfter(() => confirmBooking(id, resend)),
  //   );
  // }

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
          // onConfirm={() => onConfirm(sel._id, false)}
          // onResend={() => onConfirm(sel._id, true)}
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

// //src\app\admin\(app)\bookings\page.tsx
// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import BookingDialog from "@/app/admin/(app)/bookings/BookingDialog";
// import BookingsTableList from "./components/BookingsTableList";
// import FiltersBar from "./components/FiltersBar";
// import Pager from "./components/Pager";
// import NoticeToast from "./components/NoticeToast";
// import { useDebouncedValue } from "./hooks/useDebouncedValue";
// import { useNotice } from "./hooks/useNotice";
// import { useBookingsList } from "./hooks/useBookingsList";
// import {
//   cancelConfirmedBooking,
//   confirmBooking,
//   deleteBulk,
//   deleteBooking,
//   restoreBulk,
//   setBookingStatus,
//   fetchBookingDetails,
// } from "./api";
// import type { Booking, ProgramFilter, Status, StatusOrAll } from "./types";
// import { programLabel, statusLabel } from "./utils";
// import { sortBookings } from "./page.helpers";
// import { useDropdown } from "./components/useDropdown";
// import { fetchBookingDetails } from "./api";

// type SortKey = "newest" | "oldest" | "nameAsc" | "nameDesc";

// type Busy =
//   | { kind: "row"; id: string }
//   | { kind: "bulk_delete" }
//   | { kind: "bulk_restore" }
//   | null;

// function sortLabel(sort: SortKey) {
//   const map: Record<SortKey, string> = {
//     newest: "Newest first",
//     oldest: "Oldest first",
//     nameAsc: "Name A–Z",
//     nameDesc: "Name Z–A",
//   };
//   return map[sort] || "Newest first";
// }

// export default function AdminBookingsPage(

// ) {
//   const [status, setStatus] = useState<StatusOrAll>("all");
//   const [program, setProgram] = useState<ProgramFilter>("all");
//   const [sort, setSort] = useState<SortKey>("newest");
//   const [q, setQ] = useState("");
//   const qDebounced = useDebouncedValue(q, 300);

//   const [page, setPage] = useState(1);
//   const [selectMode, setSelectMode] = useState(false);
//   const toggleBtnRef = useRef<HTMLButtonElement | null>(null);

//   const [sel, setSel] = useState<Booking | null>(null);
//   const { notice, showOk, showError } = useNotice(5000);

//   const list = useBookingsList({ status, program, q: qDebounced, page });
//   const [busy, setBusy] = useState<Busy>(null);

//   const programDd = useDropdown();
//   const statusDd = useDropdown();
//   const sortDd = useDropdown();

//   const computedStatusLabel = useMemo(
//     () =>
//       statusLabel({
//         status,
//         total: list.total,
//         totalAll: list.totalAll,
//         counts: list.counts,
//       }),
//     [status, list.total, list.totalAll, list.counts],
//   );

//   const itemsSorted = useMemo(
//     () => sortBookings(list.items, sort),
//     [list.items, sort],
//   );

//   useEffect(
//     () => setSelectMode(false),
//     [page, qDebounced, status, program, sort],
//   );

//   useEffect(() => {
//     if (!list.error) return;
//     showError(list.error);
//   }, [list.error, showError]);

//   async function run<T>(nextBusy: Busy, fn: () => Promise<T>) {
//     setBusy(nextBusy);
//     try {
//       return await fn();
//     } finally {
//       setBusy(null);
//     }
//   }

//   async function reloadAfter<T>(fn: () => Promise<T>) {
//     const res = await fn();
//     await list.reload();
//     return res;
//   }

//   async function onConfirm(id: string, resend: boolean) {
//     return run({ kind: "row", id }, () =>
//       reloadAfter(() => confirmBooking(id, resend)),
//     );
//   }

//   async function onSetStatus(id: string, next: Status) {
//     return run({ kind: "row", id }, () =>
//       reloadAfter(() => setBookingStatus(id, next)),
//     );
//   }

//   async function onDeleteOne(id: string) {
//     return run({ kind: "row", id }, () => reloadAfter(() => deleteBooking(id)));
//   }

//   async function onCancelConfirmed(id: string) {
//     return run({ kind: "row", id }, () =>
//       reloadAfter(() => cancelConfirmedBooking(id)),
//     );
//   }

//   async function onDeleteMany(ids: string[]) {
//     if (!ids.length) return;
//     await run({ kind: "bulk_delete" }, async () => {
//       await deleteBulk(ids);
//       await list.reload();
//       setSelectMode(false);
//     });
//     showOk(`Deleted (${ids.length}).`);
//   }

//   async function onRestoreMany(ids: string[]) {
//     if (!ids.length) return;
//     await run({ kind: "bulk_restore" }, async () => {
//       await restoreBulk(ids);
//       await list.reload();
//       setSelectMode(false);
//     });
//     showOk(`Restored (${ids.length}).`);
//   }

//   function onSearchChange(v: string) {
//     setQ(v);
//     setPage(1);
//   }

//   function onSearchKeyDown(key: string) {
//     if (key === "Escape") onSearchChange("");
//     if (key === "Enter") setPage(1);
//   }

//   function applyProgram(next: ProgramFilter) {
//     setProgram(next);
//     setStatus("all");
//     setPage(1);
//     programDd.close();
//   }

//   function applyStatus(next: StatusOrAll) {
//     setStatus(next);
//     setPage(1);
//     statusDd.close();
//   }

//   function applySort(next: SortKey) {
//     setSort(next);
//     setPage(1);
//     sortDd.close();
//   }

//   function goPrev() {
//     setPage((p) => Math.max(1, p - 1));
//   }

//   function goNext() {
//     setPage((p) => Math.min(list.pages, p + 1));
//   }

//   const searchItemStyle = { flex: "1 1 640px", minWidth: 520 } as const;
//   const ddItemStyle = { flex: "0 0 220px", minWidth: 200 } as const;
//   const sortItemStyle = { flex: "0 0 200px", minWidth: 180 } as const;

//   const busyRowId = busy?.kind === "row" ? busy.id : null;
//   const busyBulkDelete = busy?.kind === "bulk_delete";
//   const busyBulkRestore = busy?.kind === "bulk_restore";

//   return (
//     <div className="news-admin ks bookings-admin">
//       {notice ? <NoticeToast notice={notice} /> : null}

//       <main className="container">
//         <div className="dialog-subhead news-admin__subhead">
//           <h1 className="text-2xl font-bold m-0 news-admin__title">Bookings</h1>
//         </div>

//         <FiltersBar
//           q={q}
//           onSearchChange={onSearchChange}
//           onSearchKeyDown={onSearchKeyDown}
//           searchItemStyle={searchItemStyle}
//           ddItemStyle={ddItemStyle}
//           sortItemStyle={sortItemStyle}
//           programDd={programDd}
//           statusDd={statusDd}
//           sortDd={sortDd}
//           programLabel={programLabel(program)}
//           statusLabel={computedStatusLabel}
//           sortLabel={sortLabel(sort)}
//           program={program}
//           status={status}
//           sort={sort}
//           list={list}
//           onProgram={applyProgram}
//           onStatus={applyStatus}
//           onSort={applySort}
//         />

//         {list.error ? (
//           <div className="card" role="alert">
//             <div className="text-red-600">{list.error}</div>
//           </div>
//         ) : null}

//         <section className="news-admin__section">
//           <div className="news-admin__section-head-number">
//             <span className="news-admin__section-meta">
//               {list.total ? `(${list.total})` : ""}
//             </span>
//           </div>

//           <div
//             className={
//               "news-admin__box news-admin__box--scroll3" +
//               (!itemsSorted.length ? " is-empty" : "")
//             }
//           >
//             <BookingsTableList
//               items={itemsSorted}
//               selectMode={selectMode}
//               onToggleSelectMode={() => setSelectMode((p) => !p)}
//              // onOpen={(b) => setSel(b)}
//               onOpen={(b) => openBooking(b)}
//               onDeleteMany={onDeleteMany}
//               onRestoreMany={onRestoreMany}
//               toggleBtnRef={toggleBtnRef}
//               busyRowId={busyRowId}
//               busyBulkDelete={busyBulkDelete}
//               busyBulkRestore={busyBulkRestore}
//             />
//           </div>

//           <Pager
//             page={page}
//             pages={list.pages}
//             onPrev={goPrev}
//             onNext={goNext}
//           />
//         </section>
//       </main>

//       {sel ? (
//         <BookingDialog
//           booking={sel}
//           onClose={() => setSel(null)}
//           onConfirm={() => onConfirm(sel._id, false)}
//           onResend={() => onConfirm(sel._id, true)}
//           onSetStatus={(s) => onSetStatus(sel._id, s as Status)}
//           onDelete={() => onDeleteOne(sel._id)}
//           onCancelConfirmed={() => onCancelConfirmed(sel._id)}
//           notify={showOk}
//           onUpdateBooking={(patch) => {
//             setSel((prev) => (prev ? { ...prev, ...patch } : prev));
//             list.reload();
//           }}
//         />
//       ) : null}
//     </div>
//   );
// }

// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import BookingDialog from "@/app/admin/(app)/bookings/BookingDialog";
// import BookingsTableList from "./components/BookingsTableList";
// import { useDebouncedValue } from "./hooks/useDebouncedValue";
// import { useNotice } from "./hooks/useNotice";
// import { useBookingsList } from "./hooks/useBookingsList";

// import {
//   cancelConfirmedBooking,
//   confirmBooking,
//   deleteBulk,
//   deleteBooking,
//   restoreBulk,
//   setBookingStatus,
// } from "./api";
// import type { Booking, ProgramFilter, Status, StatusOrAll } from "./types";
// import { programLabel, statusLabel } from "./utils";

// type SortKey = "newest" | "oldest" | "nameAsc" | "nameDesc";

// type Busy =
//   | { kind: "row"; id: string }
//   | { kind: "bulk_delete" }
//   | { kind: "bulk_restore" }
//   | null;

// function sortLabel(sort: SortKey) {
//   const map: Record<SortKey, string> = {
//     newest: "Newest first",
//     oldest: "Oldest first",
//     nameAsc: "Name A–Z",
//     nameDesc: "Name Z–A",
//   };
//   return map[sort] || "Newest first";
// }

// export default function AdminBookingsPage() {
//   const [status, setStatus] = useState<StatusOrAll>("all");
//   const [program, setProgram] = useState<ProgramFilter>("all");
//   const [sort, setSort] = useState<SortKey>("newest");
//   const [q, setQ] = useState("");
//   const qDebounced = useDebouncedValue(q, 300);

//   const [page, setPage] = useState(1);
//   const [selectMode, setSelectMode] = useState(false);
//   const toggleBtnRef = useRef<HTMLButtonElement | null>(null);

//   const [sel, setSel] = useState<Booking | null>(null);
//   const { notice, showOk, showError } = useNotice(5000);

//   const list = useBookingsList({ status, program, q: qDebounced, page });

//   const [busy, setBusy] = useState<Busy>(null);

//   const programDd = useDropdown();
//   const statusDd = useDropdown();
//   const sortDd = useDropdown();

//   const computedStatusLabel = useMemo(
//     () =>
//       statusLabel({
//         status,
//         total: list.total,
//         totalAll: list.totalAll,
//         counts: list.counts,
//       }),
//     [status, list.total, list.totalAll, list.counts],
//   );

//   const itemsSorted = useMemo(
//     () => sortBookings(list.items, sort),
//     [list.items, sort],
//   );

//   useEffect(
//     () => setSelectMode(false),
//     [page, qDebounced, status, program, sort],
//   );

//   useEffect(() => {
//     if (!list.error) return;
//     showError(list.error);
//   }, [list.error, showError]);

//   async function run<T>(nextBusy: Busy, fn: () => Promise<T>) {
//     setBusy(nextBusy);
//     try {
//       return await fn();
//     } finally {
//       setBusy(null);
//     }
//   }

//   async function reloadAfter<T>(fn: () => Promise<T>) {
//     const res = await fn();
//     await list.reload();
//     return res;
//   }

//   async function onConfirm(id: string, resend: boolean) {
//     return run({ kind: "row", id }, () =>
//       reloadAfter(() => confirmBooking(id, resend)),
//     );
//   }

//   async function onSetStatus(id: string, next: Status) {
//     return run({ kind: "row", id }, () =>
//       reloadAfter(() => setBookingStatus(id, next)),
//     );
//   }

//   async function onDeleteOne(id: string) {
//     return run({ kind: "row", id }, () => reloadAfter(() => deleteBooking(id)));
//   }

//   async function onCancelConfirmed(id: string) {
//     return run({ kind: "row", id }, () =>
//       reloadAfter(() => cancelConfirmedBooking(id)),
//     );
//   }

//   async function onDeleteMany(ids: string[]) {
//     if (!ids.length) return;
//     await run({ kind: "bulk_delete" }, async () => {
//       await deleteBulk(ids);
//       await list.reload();
//       setSelectMode(false);
//     });
//     showOk(`Deleted (${ids.length}).`);
//   }

//   async function onRestoreMany(ids: string[]) {
//     if (!ids.length) return;
//     await run({ kind: "bulk_restore" }, async () => {
//       await restoreBulk(ids);
//       await list.reload();
//       setSelectMode(false);
//     });
//     showOk(`Restored (${ids.length}).`);
//   }

//   function onSearchChange(v: string) {
//     setQ(v);
//     setPage(1);
//   }

//   function onSearchKeyDown(key: string) {
//     if (key === "Escape") onSearchChange("");
//     if (key === "Enter") setPage(1);
//   }

//   function applyProgram(next: ProgramFilter) {
//     setProgram(next);
//     setStatus("all");
//     setPage(1);
//     programDd.close();
//   }

//   function applyStatus(next: StatusOrAll) {
//     setStatus(next);
//     setPage(1);
//     statusDd.close();
//   }

//   function applySort(next: SortKey) {
//     setSort(next);
//     setPage(1);
//     sortDd.close();
//   }

//   function goPrev() {
//     setPage((p) => Math.max(1, p - 1));
//   }

//   function goNext() {
//     setPage((p) => Math.min(list.pages, p + 1));
//   }

//   const searchItemStyle = { flex: "1 1 640px", minWidth: 520 } as const;
//   const ddItemStyle = { flex: "0 0 220px", minWidth: 200 } as const;
//   const sortItemStyle = { flex: "0 0 200px", minWidth: 180 } as const;

//   const busyRowId = busy?.kind === "row" ? busy.id : null;
//   const busyBulkDelete = busy?.kind === "bulk_delete";
//   const busyBulkRestore = busy?.kind === "bulk_restore";

//   return (
//     <div className="news-admin ks bookings-admin">
//       {notice ? <NoticeToast notice={notice} /> : null}

//       <main className="container">
//         <div className="dialog-subhead news-admin__subhead">
//           <h1 className="text-2xl font-bold m-0 news-admin__title">Bookings</h1>
//         </div>

//         <div className="news-admin__filters">
//           <div className="news-admin__filter" style={searchItemStyle}>
//             <label className="lbl news-admin__filter-label">Search</label>
//             <SearchInput
//               value={q}
//               onChange={onSearchChange}
//               onKeyDown={onSearchKeyDown}
//             />
//           </div>

//           <div className="news-admin__filter" style={ddItemStyle}>
//             <label className="lbl news-admin__filter-label">Course</label>
//             <SelectBox
//               dd={programDd}
//               label={programLabel(program)}
//               disabled={false}
//               ariaLabel="Course"
//             >
//               <SelectOption
//                 active={program === "all"}
//                 onClick={() => applyProgram("all")}
//                 text="All courses"
//               />
//               <SelectGroup label="Weekly Courses">
//                 <SelectOption
//                   active={program === "weekly_foerdertraining"}
//                   onClick={() => applyProgram("weekly_foerdertraining")}
//                   text="Foerdertraining"
//                 />
//                 <SelectOption
//                   active={program === "weekly_kindergarten"}
//                   onClick={() => applyProgram("weekly_kindergarten")}
//                   text="Soccer Kindergarten"
//                 />
//                 <SelectOption
//                   active={program === "weekly_goalkeeper"}
//                   onClick={() => applyProgram("weekly_goalkeeper")}
//                   text="Goalkeeper Training"
//                 />
//                 <SelectOption
//                   active={program === "weekly_development_athletik"}
//                   onClick={() => applyProgram("weekly_development_athletik")}
//                   text="Development Training • Athletik"
//                 />
//               </SelectGroup>
//               <SelectGroup label="Individual Courses">
//                 <SelectOption
//                   active={program === "ind_1to1"}
//                   onClick={() => applyProgram("ind_1to1")}
//                   text="1:1 Training"
//                 />
//                 <SelectOption
//                   active={program === "ind_1to1_athletik"}
//                   onClick={() => applyProgram("ind_1to1_athletik")}
//                   text="1:1 Training Athletik"
//                 />
//                 <SelectOption
//                   active={program === "ind_1to1_goalkeeper"}
//                   onClick={() => applyProgram("ind_1to1_goalkeeper")}
//                   text="1:1 Training Torwart"
//                 />
//               </SelectGroup>
//               <SelectGroup label="Club Programs">
//                 <SelectOption
//                   active={program === "club_rentacoach"}
//                   onClick={() => applyProgram("club_rentacoach")}
//                   text="Rent-a-Coach"
//                 />
//                 <SelectOption
//                   active={program === "club_trainingcamps"}
//                   onClick={() => applyProgram("club_trainingcamps")}
//                   text="Training Camps"
//                 />
//                 <SelectOption
//                   active={program === "club_coacheducation"}
//                   onClick={() => applyProgram("club_coacheducation")}
//                   text="Coach Education"
//                 />
//               </SelectGroup>
//             </SelectBox>
//           </div>

//           <div className="news-admin__filter" style={ddItemStyle}>
//             <label className="lbl news-admin__filter-label">Status</label>
//             <SelectBox
//               dd={statusDd}
//               label={computedStatusLabel}
//               disabled={false}
//               ariaLabel="Status"
//             >
//               <SelectOption
//                 active={status === "all"}
//                 onClick={() => applyStatus("all")}
//                 text={`All (${list.totalAll ?? list.total})`}
//               />
//               <SelectOption
//                 active={status === "pending"}
//                 onClick={() => applyStatus("pending")}
//                 text={`Pending (${list.counts.pending ?? 0})`}
//               />
//               <SelectOption
//                 active={status === "processing"}
//                 onClick={() => applyStatus("processing")}
//                 text={`Processing (${list.counts.processing ?? 0})`}
//               />
//               <SelectOption
//                 active={status === "confirmed"}
//                 onClick={() => applyStatus("confirmed")}
//                 text={`Confirmed (${list.counts.confirmed ?? 0})`}
//               />
//               <SelectOption
//                 active={status === "cancelled"}
//                 onClick={() => applyStatus("cancelled")}
//                 text={`Cancelled (${list.counts.cancelled ?? 0})`}
//               />
//               <SelectOption
//                 active={status === "deleted"}
//                 onClick={() => applyStatus("deleted")}
//                 text={`Deleted (${list.counts.deleted ?? 0})`}
//               />
//             </SelectBox>
//           </div>

//           <div className="news-admin__filter" style={sortItemStyle}>
//             <label className="lbl news-admin__filter-label">Sort</label>
//             <SelectBox
//               dd={sortDd}
//               label={sortLabel(sort)}
//               disabled={false}
//               ariaLabel="Sort"
//             >
//               <SelectOption
//                 active={sort === "newest"}
//                 onClick={() => applySort("newest")}
//                 text="Neueste zuerst"
//               />
//               <SelectOption
//                 active={sort === "oldest"}
//                 onClick={() => applySort("oldest")}
//                 text="Älteste zuerst"
//               />
//               <SelectOption
//                 active={sort === "nameAsc"}
//                 onClick={() => applySort("nameAsc")}
//                 text="Name A–Z"
//               />
//               <SelectOption
//                 active={sort === "nameDesc"}
//                 onClick={() => applySort("nameDesc")}
//                 text="Name Z–A"
//               />
//             </SelectBox>
//           </div>
//         </div>

//         {list.error ? (
//           <div className="card" role="alert">
//             <div className="text-red-600">{list.error}</div>
//           </div>
//         ) : null}

//         <section className="news-admin__section">
//           <div className="news-admin__section-head-number">
//             <span className="news-admin__section-meta">
//               {list.total ? `(${list.total})` : ""}
//             </span>
//           </div>

//           <div
//             className={
//               "news-admin__box news-admin__box--scroll3" +
//               (!itemsSorted.length ? " is-empty" : "")
//             }
//           >
//             <BookingsTableList
//               items={itemsSorted}
//               selectMode={selectMode}
//               onToggleSelectMode={() => setSelectMode((p) => !p)}
//               onOpen={(b) => setSel(b)}
//               onDeleteMany={onDeleteMany}
//               onRestoreMany={onRestoreMany}
//               toggleBtnRef={toggleBtnRef}
//               busyRowId={busyRowId}
//               busyBulkDelete={busyBulkDelete}
//               busyBulkRestore={busyBulkRestore}
//             />
//           </div>

//           <div className="pager pager--arrows mt-3">
//             <button
//               type="button"
//               className="btn"
//               aria-label="Previous page"
//               disabled={page <= 1}
//               onClick={goPrev}
//             >
//               <img
//                 src="/icons/arrow_right_alt.svg"
//                 alt=""
//                 aria-hidden="true"
//                 className="icon-img icon-img--left"
//               />
//             </button>

//             <div className="pager__count" aria-live="polite" aria-atomic="true">
//               {page} / {list.pages}
//             </div>

//             <button
//               type="button"
//               className="btn"
//               aria-label="Next page"
//               disabled={page >= list.pages}
//               onClick={goNext}
//             >
//               <img
//                 src="/icons/arrow_right_alt.svg"
//                 alt=""
//                 aria-hidden="true"
//                 className="icon-img"
//               />
//             </button>
//           </div>
//         </section>
//       </main>

//       {sel ? (
//         <BookingDialog
//           booking={sel}
//           onClose={() => setSel(null)}
//           onConfirm={() => onConfirm(sel._id, false)}
//           onResend={() => onConfirm(sel._id, true)}
//           onSetStatus={(s) => onSetStatus(sel._id, s as Status)}
//           onDelete={() => onDeleteOne(sel._id)}
//           onCancelConfirmed={() => onCancelConfirmed(sel._id)}
//           notify={showOk}
//         />
//       ) : null}
//     </div>
//   );
// }

// function sortBookings(items: Booking[], sort: SortKey) {
//   const arr = [...items];
//   const by = getComparator(sort);
//   return arr.sort(by);
// }

// function getComparator(sort: SortKey) {
//   if (sort === "oldest")
//     return (a: Booking, b: Booking) => ts(a.createdAt) - ts(b.createdAt);
//   if (sort === "nameAsc")
//     return (a: Booking, b: Booking) =>
//       nameKey(a).localeCompare(nameKey(b), "de", { sensitivity: "base" });
//   if (sort === "nameDesc")
//     return (a: Booking, b: Booking) =>
//       nameKey(b).localeCompare(nameKey(a), "de", { sensitivity: "base" });
//   return (a: Booking, b: Booking) => ts(b.createdAt) - ts(a.createdAt);
// }

// function nameKey(b: Booking) {
//   const first = String((b as any)?.firstName ?? "").trim();
//   const last = String((b as any)?.lastName ?? "").trim();
//   return `${first} ${last}`.trim().toLowerCase();
// }

// function ts(v: unknown) {
//   const t = new Date(String(v ?? "")).getTime();
//   return Number.isFinite(t) ? t : 0;
// }

// function useDropdown() {
//   const [open, setOpen] = useState(false);
//   const triggerRef = useRef<HTMLButtonElement | null>(null);
//   const menuRef = useRef<HTMLUListElement | null>(null);

//   useEffect(() => {
//     if (!open) return;
//     function onPointerDown(ev: PointerEvent) {
//       const t = ev.target as Node;
//       if (triggerRef.current?.contains(t)) return;
//       if (menuRef.current?.contains(t)) return;
//       setOpen(false);
//     }
//     document.addEventListener("pointerdown", onPointerDown);
//     return () => document.removeEventListener("pointerdown", onPointerDown);
//   }, [open]);

//   function toggle() {
//     setOpen((o) => !o);
//   }

//   function close() {
//     setOpen(false);
//   }

//   return { open, toggle, close, triggerRef, menuRef };
// }

// function NoticeToast({
//   notice,
// }: {
//   notice: { type: "ok" | "error"; text: string };
// }) {
//   return (
//     <div
//       className={notice.type === "ok" ? "ok" : "error"}
//       style={{
//         position: "fixed",
//         right: 12,
//         bottom: 12,
//         zIndex: 6000,
//         background: "#fff",
//         border: "1px solid #e5e7eb",
//         borderRadius: 8,
//         padding: "10px 12px",
//         boxShadow: "0 10px 25px rgba(17,24,39,.08)",
//       }}
//     >
//       {notice.text}
//     </div>
//   );
// }

// function SearchInput(props: {
//   value: string;
//   onChange: (v: string) => void;
//   onKeyDown: (key: string) => void;
// }) {
//   return (
//     <div className="input-with-icon">
//       <img
//         src="/icons/search.svg"
//         alt=""
//         aria-hidden="true"
//         className="input-with-icon__icon"
//       />
//       <input
//         className="input input-with-icon__input"
//         placeholder="Name, email, level, code, message…"
//         value={props.value}
//         onChange={(e) => props.onChange(e.target.value)}
//         onKeyDown={(e) => props.onKeyDown(e.key)}
//       />
//     </div>
//   );
// }

// function SelectBox(props: {
//   dd: ReturnType<typeof useDropdown>;
//   label: string;
//   disabled: boolean;
//   ariaLabel: string;
//   children: React.ReactNode;
// }) {
//   const cls =
//     "ks-training-select" + (props.dd.open ? " ks-training-select--open" : "");
//   return (
//     <div className={cls}>
//       <button
//         type="button"
//         ref={props.dd.triggerRef}
//         className="ks-training-select__trigger"
//         onClick={props.dd.toggle}
//         disabled={props.disabled}
//         aria-haspopup="listbox"
//         aria-expanded={props.dd.open}
//       >
//         <span className="ks-training-select__label">{props.label}</span>
//         <span className="ks-training-select__chevron" aria-hidden="true" />
//       </button>

//       {props.dd.open ? (
//         <ul
//           ref={props.dd.menuRef}
//           className="ks-training-select__menu"
//           role="listbox"
//           aria-label={props.ariaLabel}
//         >
//           {props.children}
//         </ul>
//       ) : null}
//     </div>
//   );
// }

// function SelectOption(props: {
//   active: boolean;
//   onClick: () => void;
//   text: string;
// }) {
//   const cls =
//     "ks-training-select__option" + (props.active ? " is-selected" : "");
//   return (
//     <li>
//       <button type="button" className={cls} onClick={props.onClick}>
//         {props.text}
//       </button>
//     </li>
//   );
// }

// function SelectGroup(props: { label: string; children: React.ReactNode }) {
//   return (
//     <li className="ks-training-select__group">
//       <div className="ks-training-select__group-label">{props.label}</div>
//       {props.children}
//     </li>
//   );
// }
