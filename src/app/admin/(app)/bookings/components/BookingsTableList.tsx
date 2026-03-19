"use client";

import type { RefObject } from "react";
import { useEffect, useMemo, useRef } from "react";
import BulkActions from "@/app/admin/(app)/news/components/BulkActions";
import { useSelection } from "@/app/admin/(app)/news/hooks/useSelection";
import type { Booking } from "../types";
import {
  focusClearOrCancel,
  idOf,
  renderRow,
  restoreIds,
} from "./BookingsTableList.helpers";

type Props = {
  items: Booking[];
  selectMode: boolean;
  onToggleSelectMode: () => void;
  onOpen: (b: Booking) => void;
  onDeleteMany: (ids: string[]) => Promise<void>;
  onRestoreMany: (ids: string[]) => Promise<void>;
  toggleBtnRef?: RefObject<HTMLButtonElement | null>;
  busyRowId?: string | null;
  busyBulkDelete?: boolean;
  busyBulkRestore?: boolean;
};

export default function BookingsTableList(props: Props) {
  const idsOnPage = useMemo(
    () => props.items.map(idOf).filter(Boolean),
    [props.items],
  );
  const sel = useSelection(idsOnPage);

  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
  const clearBtnRef = useRef<HTMLButtonElement | null>(null);
  const prevCountRef = useRef(0);

  const count = sel.selected.size;
  const showClear = props.selectMode && count >= 2;
  const restoreCount = restoreIds(props.items, sel.selected).length;

  const busyDelete = props.busyBulkDelete === true;
  const busyRestore = props.busyBulkRestore === true;
  const busyAny = busyDelete || busyRestore;

  useEffect(
    () =>
      focusClearOrCancel(
        props.selectMode,
        count,
        prevCountRef,
        clearBtnRef,
        cancelBtnRef,
      ),
    [props.selectMode, count],
  );

  async function deleteSelected() {
    if (busyAny) return;
    const ids = Array.from(sel.selected);
    if (!ids.length) return;
    await props.onDeleteMany(ids);
    sel.clear();
    props.onToggleSelectMode();
  }

  async function restoreSelected() {
    if (busyAny) return;
    const ids = restoreIds(props.items, sel.selected);
    if (!ids.length) return;
    await props.onRestoreMany(ids);
    sel.clear();
    props.onToggleSelectMode();
  }

  function toggleAll() {
    if (busyAny) return;
    sel.isAllSelected ? sel.removeAll() : sel.selectAll();
  }

  function clearSelection() {
    if (busyAny) return;
    sel.clear();
    requestAnimationFrame(() => cancelBtnRef.current?.focus());
  }

  function onRowClick(b: Booking) {
    if (props.selectMode && busyAny) return;
    const id = idOf(b);
    if (!id) return;
    props.selectMode ? sel.toggleOne(id) : props.onOpen(b);
  }

  if (!props.items.length) {
    return (
      <section className="card">
        <div className="card__empty">No items.</div>
      </section>
    );
  }

  return (
    <div className="news-table">
      <div className="news-admin__top-actions">
        <BulkActions
          toggleRef={
            props.toggleBtnRef as unknown as RefObject<HTMLButtonElement>
          }
          cancelRef={cancelBtnRef as unknown as RefObject<HTMLButtonElement>}
          clearRef={clearBtnRef as unknown as RefObject<HTMLButtonElement>}
          selectMode={props.selectMode}
          onToggleSelectMode={() => {
            if (busyAny) return;
            sel.clear();
            props.onToggleSelectMode();
          }}
          count={count}
          isAllSelected={sel.isAllSelected}
          busy={false}
          isEmpty={props.items.length === 0}
          onToggleAll={toggleAll}
          onClear={clearSelection}
          showClear={showClear}
          onDelete={deleteSelected}
        />

        {props.selectMode ? (
          <div className="bookings-bulk-actions">
            <button
              type="button"
              className="btn"
              disabled={busyRestore || restoreCount === 0}
              onClick={restoreSelected}
            >
              Wiederherstellen ({restoreCount})
            </button>

            <button
              type="button"
              className="btn btn--danger"
              disabled={busyDelete || count === 0}
              onClick={deleteSelected}
            >
              Löschen ({count})
            </button>
          </div>
        ) : null}
      </div>

      <div className="news-table__scroll">
        <section className="card news-list">
          <div className="news-list__table">
            <div className="news-list__head" aria-hidden="true">
              <div className="news-list__h">Name</div>
              <div className="news-list__h">Email</div>
              <div className="news-list__h">Date</div>
              <div className="news-list__h">Program</div>
              <div className="news-list__h">Status</div>
              <div className="news-list__h">Payment</div>
              <div className="news-list__h">Created</div>
              <div className="news-list__h news-list__h--right">Action</div>
            </div>

            <ul className="list list--bleed">
              {props.items.map((b) =>
                renderRow(
                  b,
                  props.selectMode,
                  sel.selected,
                  onRowClick,
                  props.onOpen,
                  props.busyRowId ?? null,
                ),
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

// //src\app\admin\(app)\bookings\components\BookingsTableList.tsx
// "use client";

// import type { RefObject } from "react";
// import { useEffect, useMemo, useRef } from "react";
// import BulkActions from "@/app/admin/(app)/news/components/BulkActions";
// import { useSelection } from "@/app/admin/(app)/news/hooks/useSelection";
// import type { Booking } from "../types";
// import {
//   focusClearOrCancel,
//   idOf,
//   renderRow,
//   restoreIds,
// } from "./BookingsTableList.helpers";

// type Props = {
//   items: Booking[];
//   selectMode: boolean;
//   onToggleSelectMode: () => void;
//   onOpen: (b: Booking) => void;
//   onDeleteMany: (ids: string[]) => Promise<void>;
//   onRestoreMany: (ids: string[]) => Promise<void>;
//   toggleBtnRef?: RefObject<HTMLButtonElement | null>;
//   busyRowId?: string | null;
//   busyBulkDelete?: boolean;
//   busyBulkRestore?: boolean;
// };

// export default function BookingsTableList(props: Props) {
//   const idsOnPage = useMemo(
//     () => props.items.map(idOf).filter(Boolean),
//     [props.items],
//   );
//   const sel = useSelection(idsOnPage);

//   const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
//   const clearBtnRef = useRef<HTMLButtonElement | null>(null);
//   const prevCountRef = useRef(0);

//   const count = sel.selected.size;
//   const showClear = props.selectMode && count >= 2;
//   const restoreCount = restoreIds(props.items, sel.selected).length;

//   const busyDelete = props.busyBulkDelete === true;
//   const busyRestore = props.busyBulkRestore === true;
//   const busyAny = busyDelete || busyRestore;

//   useEffect(
//     () =>
//       focusClearOrCancel(
//         props.selectMode,
//         count,
//         prevCountRef,
//         clearBtnRef,
//         cancelBtnRef,
//       ),
//     [props.selectMode, count],
//   );

//   async function deleteSelected() {
//     if (busyAny) return;
//     const ids = Array.from(sel.selected);
//     if (!ids.length) return;
//     await props.onDeleteMany(ids);
//     sel.clear();
//     props.onToggleSelectMode();
//   }

//   async function restoreSelected() {
//     if (busyAny) return;
//     const ids = restoreIds(props.items, sel.selected);
//     if (!ids.length) return;
//     await props.onRestoreMany(ids);
//     sel.clear();
//     props.onToggleSelectMode();
//   }

//   function toggleAll() {
//     if (busyAny) return;
//     sel.isAllSelected ? sel.removeAll() : sel.selectAll();
//   }

//   function clearSelection() {
//     if (busyAny) return;
//     sel.clear();
//     requestAnimationFrame(() => cancelBtnRef.current?.focus());
//   }

//   function onRowClick(b: Booking) {
//     if (props.selectMode && busyAny) return;
//     const id = idOf(b);
//     if (!id) return;
//     props.selectMode ? sel.toggleOne(id) : props.onOpen(b);
//   }

//   if (!props.items.length) {
//     return (
//       <section className="card">
//         <div className="card__empty">No items.</div>
//       </section>
//     );
//   }

//   return (
//     <div className="news-table">
//       <div className="news-admin__top-actions">
//         <BulkActions
//           toggleRef={
//             props.toggleBtnRef as unknown as RefObject<HTMLButtonElement>
//           }
//           cancelRef={cancelBtnRef as unknown as RefObject<HTMLButtonElement>}
//           clearRef={clearBtnRef as unknown as RefObject<HTMLButtonElement>}
//           selectMode={props.selectMode}
//           onToggleSelectMode={() => {
//             if (busyAny) return;
//             sel.clear();
//             props.onToggleSelectMode();
//           }}
//           count={count}
//           isAllSelected={sel.isAllSelected}
//           busy={false}
//           isEmpty={props.items.length === 0}
//           onToggleAll={toggleAll}
//           onClear={clearSelection}
//           showClear={showClear}
//           onDelete={deleteSelected}
//         />

//         {props.selectMode ? (
//           <div className="bookings-bulk-actions">
//             <button
//               type="button"
//               className="btn"
//               disabled={busyRestore || restoreCount === 0}
//               onClick={restoreSelected}
//             >
//               Wiederherstellen ({restoreCount})
//             </button>

//             <button
//               type="button"
//               className="btn btn--danger"
//               disabled={busyDelete || count === 0}
//               onClick={deleteSelected}
//             >
//               Löschen ({count})
//             </button>
//           </div>
//         ) : null}
//       </div>

//       <div className="news-table__scroll">
//         <section className="card news-list">
//           <div className="news-list__table">
//             <div className="news-list__head" aria-hidden="true">
//               <div className="news-list__h">Name</div>
//               <div className="news-list__h">Email</div>
//               <div className="news-list__h">Date</div>
//               <div className="news-list__h">Program</div>
//               <div className="news-list__h">Status</div>
//               <div className="news-list__h">Payment</div>
//               <div className="news-list__h">Created</div>
//               <div className="news-list__h news-list__h--right">Action</div>
//             </div>

//             <ul className="list list--bleed">
//               {props.items.map((b) =>
//                 renderRow(
//                   b,
//                   props.selectMode,
//                   sel.selected,
//                   onRowClick,
//                   props.onOpen,
//                   props.busyRowId ?? null,
//                 ),
//               )}
//             </ul>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }
