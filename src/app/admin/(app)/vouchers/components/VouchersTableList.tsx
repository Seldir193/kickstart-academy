"use client";

import type { RefObject } from "react";
import { useEffect, useMemo, useRef } from "react";
import BulkActions from "@/app/admin/(app)/news/components/BulkActions";
import { useSelection } from "@/app/admin/(app)/news/hooks/useSelection";
import type { Voucher } from "../types";

type Props = {
  items: Voucher[];
  selectMode: boolean;
  busy: boolean;
  onToggleSelectMode: () => void;
  onOpen: (item: Voucher) => void;
  onDeleteMany: (ids: string[]) => Promise<void>;
  onActivateMany: (ids: string[]) => Promise<void>;
  onDeactivateMany: (ids: string[]) => Promise<void>;
  toggleBtnRef?: RefObject<HTMLButtonElement | null>;
};

function idOf(item: Voucher) {
  return String(item?._id || "").trim();
}

function formatDateDe(value: string) {
  const d = new Date(String(value || ""));
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("de-DE").format(d);
}

function amountText(value: number) {
  const n = Number(value || 0);
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

function statusText(active: boolean) {
  return active ? "Active" : "Inactive";
}

function getInactiveIds(items: Voucher[], ids: Set<string>) {
  return items.filter((x) => ids.has(x._id) && !x.active).map((x) => x._id);
}

function getActiveIds(items: Voucher[], ids: Set<string>) {
  return items.filter((x) => ids.has(x._id) && x.active).map((x) => x._id);
}

export default function VouchersTableList({
  items,
  selectMode,
  busy,
  onToggleSelectMode,
  onOpen,
  onDeleteMany,
  onActivateMany,
  onDeactivateMany,
  toggleBtnRef,
}: Props) {
  const idsOnPage = useMemo(() => items.map(idOf).filter(Boolean), [items]);
  const sel = useSelection(idsOnPage);

  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
  const clearBtnRef = useRef<HTMLButtonElement | null>(null);
  const prevCountRef = useRef(0);

  const count = sel.selected.size;
  const showClear = selectMode && count >= 2;

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

  async function activateSelected() {
    const ids = getInactiveIds(items, sel.selected);
    if (!ids.length) return;
    await onActivateMany(ids);
    sel.clear();
    onToggleSelectMode();
  }

  async function deactivateSelected() {
    const ids = getActiveIds(items, sel.selected);
    if (!ids.length) return;
    await onDeactivateMany(ids);
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

  function onRowClick(item: Voucher) {
    const id = idOf(item);
    if (!id) return;
    if (selectMode) sel.toggleOne(id);
    else onOpen(item);
  }

  if (!items.length) {
    return (
      <section className="card">
        <div className="card__empty">
          {busy ? "Loading…" : "No vouchers found."}
        </div>
      </section>
    );
  }

  const activateCount = getInactiveIds(items, sel.selected).length;
  const deactivateCount = getActiveIds(items, sel.selected).length;

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
        />

        {selectMode && activateCount ? (
          <button
            type="button"
            className="btn"
            disabled={busy}
            onClick={activateSelected}
          >
            Aktivieren ({activateCount})
          </button>
        ) : null}

        {selectMode && deactivateCount ? (
          <button
            type="button"
            className="btn"
            disabled={busy}
            onClick={deactivateSelected}
          >
            Deaktivieren ({deactivateCount})
          </button>
        ) : null}
      </div>

      <div className="news-table__scroll">
        <section className="card news-list">
          <div className="news-list__table">
            <div className="news-list__head" aria-hidden="true">
              <div className="news-list__h">Code</div>
              <div className="news-list__h">Amount</div>
              <div className="news-list__h">Status</div>
              <div className="news-list__h">Created</div>
              <div className="news-list__h news-list__h--right">Action</div>
            </div>

            <ul className="list list--bleed">
              {items.map((item) => {
                const id = idOf(item);
                const checked = sel.selected.has(id);
                const hideEdit = selectMode || checked;

                return (
                  <li
                    key={id}
                    className={`list__item chip news-list__row is-fullhover is-interactive ${
                      checked ? "is-selected" : ""
                    } ${selectMode ? "is-selectmode" : ""}`}
                    onClick={() => onRowClick(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowClick(item);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-pressed={selectMode ? checked : undefined}
                    aria-label={
                      selectMode ? `Select: ${item.code}` : `Open: ${item.code}`
                    }
                  >
                    <div className="news-list__cell">
                      <div className="news-list__title">{item.code}</div>
                      <div className="news-list__excerpt is-empty">—</div>
                    </div>

                    <div className="news-list__cell bookings-mono">
                      {amountText(item.amount)}
                    </div>

                    <div className="news-list__cell">
                      {statusText(item.active)}
                    </div>

                    <div className="news-list__cell">
                      {formatDateDe(item.createdAt)}
                    </div>

                    {!hideEdit ? (
                      <div
                        className="news-list__cell news-list__cell--action"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpen(item);
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

// "use client";

// import type { Voucher } from "../types";

// type Props = {
//   items: Voucher[];
//   busy: boolean;
//   onOpen: (item: Voucher) => void;
// };

// function formatDateDE(value: string) {
//   const d = new Date(String(value || ""));
//   if (Number.isNaN(d.getTime())) return "—";
//   return new Intl.DateTimeFormat("de-DE").format(d);
// }

// function amountText(value: number) {
//   const n = Number(value || 0);
//   return new Intl.NumberFormat("de-DE", {
//     style: "currency",
//     currency: "EUR",
//   }).format(n);
// }

// function statusText(active: boolean) {
//   return active ? "Active" : "Inactive";
// }

// export default function VouchersTableList({ items, busy, onOpen }: Props) {
//   if (!items.length) {
//     return (
//       <section className="card">
//         <div className="card__empty">
//           {busy ? "Loading…" : "No vouchers found."}
//         </div>
//       </section>
//     );
//   }

//   return (
//     <div className="news-table">
//       <div className="news-table__scroll">
//         <section className="card news-list">
//           <div className="news-list__table">
//             <div className="news-list__head" aria-hidden="true">
//               <div className="news-list__h">Code</div>
//               <div className="news-list__h">Amount</div>
//               <div className="news-list__h">Status</div>
//               <div className="news-list__h">Created</div>
//               <div className="news-list__h news-list__h--right">Action</div>
//             </div>

//             <ul className="list list--bleed">
//               {items.map((item) => (
//                 <li
//                   key={item._id}
//                   className="list__item chip news-list__row is-fullhover is-interactive"
//                   onClick={() => onOpen(item)}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter" || e.key === " ") {
//                       e.preventDefault();
//                       onOpen(item);
//                     }
//                   }}
//                   tabIndex={0}
//                   role="button"
//                   aria-label={`Open voucher ${item.code}`}
//                 >
//                   <div className="news-list__cell">
//                     <div className="news-list__title">{item.code}</div>
//                     <div className="news-list__excerpt is-empty">—</div>
//                   </div>

//                   <div className="news-list__cell bookings-mono">
//                     {amountText(item.amount)}
//                   </div>

//                   <div className="news-list__cell">
//                     {statusText(item.active)}
//                   </div>

//                   <div className="news-list__cell">
//                     {formatDateDE(item.createdAt)}
//                   </div>

//                   <div
//                     className="news-list__cell news-list__cell--action"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onOpen(item);
//                     }}
//                     onMouseDown={(e) => e.stopPropagation()}
//                   >
//                     <span
//                       className="edit-trigger"
//                       role="button"
//                       tabIndex={0}
//                       aria-label="Edit"
//                     >
//                       <img
//                         src="/icons/edit.svg"
//                         alt=""
//                         aria-hidden="true"
//                         className="icon-img"
//                       />
//                     </span>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }
