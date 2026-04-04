//src\app\admin\(app)\news\components\NewsTableList.tsx
"use client";

import type { RefObject } from "react";
import React, { useEffect, useMemo, useRef } from "react";
import type { News } from "../types";
import { useSelection } from "../hooks/useSelection";
import BulkActions from "./BulkActions";
import NewsSwitch from "./NewsSwitch";
import {
  actionsFor,
  blurTarget,
  clean,
  fmtDateDe,
  getDraftDelta,
  getNeedsCorrection,
  idOf,
  isSubmitted,
  onActionKey,
  providerLabel,
  statusClass,
  statusParts,
  stop,
  type NewsWithProvider,
  type RowMode,
} from "./NewsTableList.helpers";

type Props = {
  items: NewsWithProvider[];
  rowMode: RowMode;

  selectMode: boolean;
  onToggleSelectMode: () => void;

  busy: boolean;

  onOpen: (n: News) => void;
  onInfo: (n: News) => void;

  onResubmit?: (n: News) => void;
  onSubmitForReview?: (n: News) => void;

  onAskReject?: (n: News) => void;

  onDeleteOne?: (n: News) => void;
  onDeleteMany?: (ids: string[]) => Promise<void>;

  publishedBusyId?: string | null;
  onTogglePublished?: (n: News, next: boolean) => void | Promise<void>;
  toggleBtnRef?: RefObject<HTMLButtonElement | null>;
};

function draftLine(label: string, value: string) {
  const v = clean(value);
  if (!v) return null;
  return (
    <div className="news-list__draft">
      <span className="news-list__draft-label">{label}:</span> {v}
    </div>
  );
}

function canShowSwitch(rowMode: RowMode) {
  return rowMode === "mine_approved" || rowMode === "provider_approved";
}

function filterItemsForView(items: NewsWithProvider[], rowMode: RowMode) {
  if (rowMode !== "mine_approved" && rowMode !== "provider_approved")
    return items;
  return items.filter((n) => !isSubmitted(n));
}

export default function NewsTableList({
  items,
  rowMode,
  selectMode,
  onToggleSelectMode,
  busy,
  onOpen,
  onInfo,
  onResubmit,
  onSubmitForReview,
  onAskReject,
  onDeleteOne,
  onDeleteMany,
  publishedBusyId,
  onTogglePublished,
  toggleBtnRef,
}: Props) {
  const viewItems = useMemo(
    () => filterItemsForView(items, rowMode),
    [items, rowMode],
  );

  const idsOnPage = useMemo(
    () => viewItems.map((n) => idOf(n)).filter(Boolean),
    [viewItems],
  );
  const sel = useSelection(idsOnPage);

  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
  const clearBtnRef = useRef<HTMLButtonElement | null>(null);

  const count = sel.selected.size;
  const showClear = selectMode && count >= 2;

  useEffect(() => {
    if (!selectMode) return;
    requestAnimationFrame(() => cancelBtnRef.current?.focus());
  }, [selectMode]);

  async function deleteSelected() {
    if (!onDeleteMany) return;
    const ids = Array.from(sel.selected);
    if (!ids.length) return;
    await onDeleteMany(ids);
    sel.clear();
    onToggleSelectMode();
  }

  function onToggleAll() {
    sel.isAllSelected ? sel.removeAll() : sel.selectAll();
  }

  function onClearSelection() {
    sel.clear();
    requestAnimationFrame(() => cancelBtnRef.current?.focus());
  }

  function rowClick(n: NewsWithProvider) {
    const id = idOf(n);
    if (!id) return;
    if (selectMode) return void sel.toggleOne(id);
    onOpen(n);
  }

  function onRowPointerDown(e: React.PointerEvent) {
    if (!selectMode) return;
    e.preventDefault();
  }

  if (!viewItems.length) {
    return (
      <section className="card">
        <div className="card__empty">No entries.</div>
      </section>
    );
  }

  const showSwitch = canShowSwitch(rowMode);

  return (
    <>
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
          isEmpty={viewItems.length === 0}
          onToggleAll={onToggleAll}
          onClear={onClearSelection}
          showClear={showClear}
          onDelete={deleteSelected}
          canDelete={!!onDeleteMany}
          toggleLabel="Select news"
          selectedLabel="selected"
          selectAllLabel="Select all"
          clearAllLabel="Clear all"
          deleteLabel="Delete"
          cancelLabel="Cancel"
        />
      </div>

      <section className={`card news-list ${busy ? "is-busy" : ""}`}>
        <div className="news-list__table">
          <div className="news-list__head" aria-hidden="true">
            <div className="news-list__h">Title</div>
            <div className="news-list__h">Category</div>
            <div className="news-list__h">Date</div>
            <div className="news-list__h">Status</div>
            <div className="news-list__h">Author</div>
            <div className="news-list__h news-list__h--right">Action</div>
          </div>

          <ul className="list list--bleed">
            {viewItems.map((n) => {
              const id = idOf(n);
              const checked = sel.selected.has(id);
              const hideActions = selectMode || checked;

              const isSwitchBusy = Boolean(
                publishedBusyId && publishedBusyId === id,
              );
              const published = Boolean((n as any)?.published);

              const { draftTitle, draftExcerpt, draftCategory } =
                getDraftDelta(n);
              const st = statusParts(n, rowMode);

              const acts = actionsFor({
                n,
                rowMode,
                busy,
                onOpen,
                onInfo,
                onResubmit,
                onSubmitForReview,
                onDeleteOne,
                onAskReject,
              });

              const needsCorrection = getNeedsCorrection(n);

              return (
                <li
                  key={id}
                  className={`list__item chip news-list__row is-fullhover is-interactive ${
                    checked ? "is-selected" : ""
                  }`}
                  onPointerDown={onRowPointerDown}
                  onClick={() => rowClick(n)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") rowClick(n);
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectMode ? checked : undefined}
                >
                  <div className="news-list__cell news-list__cell--title">
                    <div className="news-list__title">
                      {clean(n.title) || "—"}
                    </div>

                    <div
                      className={`news-list__excerpt ${clean(n.excerpt) ? "" : "is-empty"}`}
                    >
                      {clean(n.excerpt) || "—"}
                    </div>

                    {draftTitle && draftTitle !== clean(n.title) ? (
                      <div className="news-list__draft-wrap">
                        {draftLine("Title change", draftTitle)}
                      </div>
                    ) : null}

                    {draftExcerpt && draftExcerpt !== clean(n.excerpt) ? (
                      <div className="news-list__draft-wrap">
                        {draftLine("Lead change", draftExcerpt)}
                      </div>
                    ) : null}
                  </div>

                  <div className="news-list__cell news-list__cell--cat">
                    <span className="news-list__pill">
                      {clean(n.category) || "—"}
                    </span>
                    {draftCategory && draftCategory !== clean(n.category) ? (
                      <span className="news-list__pill news-list__pill--draft">
                        Change: {draftCategory}
                      </span>
                    ) : null}
                  </div>

                  <div className="news-list__cell news-list__cell--date">
                    <div>
                      {fmtDateDe((n as any).date || (n as any).createdAt)}
                    </div>
                    {needsCorrection ? (
                      <div className="news-list__draft-date is-alert">
                        Please correct
                      </div>
                    ) : null}
                  </div>

                  <div className="news-list__cell news-list__cell--status">
                    <div className="coach-statusline">
                      <span className={`news-list__status ${statusClass(n)}`}>
                        <span className="news-list__status-main">
                          {st.main}
                        </span>
                        {st.sub ? (
                          <span className="news-list__status-sub">
                            {st.sub}
                          </span>
                        ) : null}
                      </span>

                      {showSwitch && onTogglePublished ? (
                        <span
                          className={`news-switch-wrap ${isSwitchBusy ? "is-busy" : ""}`}
                          onClick={stop}
                          onMouseDown={stop}
                          onPointerDown={stop}
                        >
                          <NewsSwitch
                            checked={published}
                            busy={isSwitchBusy}
                            onToggle={() => {
                              if (isSwitchBusy) return;
                              onTogglePublished(n, !published);
                            }}
                          />
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="news-list__cell news-list__cell--author">
                    <span className="news-list__author">
                      {providerLabel(n)}
                    </span>
                  </div>

                  {!hideActions ? (
                    <div
                      className="news-list__cell news-list__cell--action"
                      onClick={stop}
                      onMouseDown={stop}
                    >
                      {acts.map((a) => (
                        <span
                          key={a.key}
                          className={`edit-trigger ${a.disabled ? "is-disabled" : ""}`}
                          role="button"
                          tabIndex={a.disabled ? -1 : 0}
                          {...(!a.tip ? { title: a.title } : {})}
                          aria-label={a.title}
                          aria-disabled={a.disabled ? true : undefined}
                          {...(a.tip ? { "data-ks-tip": a.tip } : {})}
                          onClick={(e) => {
                            stop(e);
                            blurTarget(e.currentTarget);
                            if (a.disabled) return;
                            a.run();
                          }}
                          onKeyDown={(e) =>
                            onActionKey(e, () => void a.run(), a.disabled)
                          }
                        >
                          <img
                            src={a.icon}
                            alt=""
                            aria-hidden="true"
                            className={
                              "icon-img" + (a.left ? " icon-img--left" : "")
                            }
                          />
                        </span>
                      ))}
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
    </>
  );
}

// //src\app\admin\(app)\news\components\NewsTableList.tsx
// "use client";

// import type { RefObject } from "react";
// import React, { useEffect, useMemo, useRef } from "react";
// import type { News } from "../types";
// import { useSelection } from "../hooks/useSelection";
// import BulkActions from "./BulkActions";
// import NewsSwitch from "./NewsSwitch";
// import {
//   actionsFor,
//   blurTarget,
//   clean,
//   fmtDateDe,
//   getDraftDelta,
//   getNeedsCorrection,
//   idOf,
//   isSubmitted,
//   onActionKey,
//   providerLabel,
//   statusClass,
//   statusParts,
//   stop,
//   type NewsWithProvider,
//   type RowMode,
// } from "./NewsTableList.helpers";

// type Props = {
//   items: NewsWithProvider[];
//   rowMode: RowMode;

//   selectMode: boolean;
//   onToggleSelectMode: () => void;

//   busy: boolean;

//   onOpen: (n: News) => void;
//   onInfo: (n: News) => void;

//   onResubmit?: (n: News) => void;
//   onSubmitForReview?: (n: News) => void;

//   onAskReject?: (n: News) => void;

//   onDeleteOne?: (n: News) => void;
//   onDeleteMany?: (ids: string[]) => Promise<void>;

//   publishedBusyId?: string | null;
//   onTogglePublished?: (n: News, next: boolean) => void | Promise<void>;
//   toggleBtnRef?: RefObject<HTMLButtonElement | null>;
// };

// function draftLine(label: string, value: string) {
//   const v = clean(value);
//   if (!v) return null;
//   return (
//     <div className="news-list__draft">
//       <span className="news-list__draft-label">{label}:</span> {v}
//     </div>
//   );
// }

// function canShowSwitch(rowMode: RowMode) {
//   return rowMode === "mine_approved" || rowMode === "provider_approved";
// }

// function filterItemsForView(items: NewsWithProvider[], rowMode: RowMode) {
//   if (rowMode !== "mine_approved" && rowMode !== "provider_approved")
//     return items;
//   return items.filter((n) => !isSubmitted(n));
// }

// export default function NewsTableList({
//   items,
//   rowMode,
//   selectMode,
//   onToggleSelectMode,
//   busy,
//   onOpen,
//   onInfo,
//   onResubmit,
//   onSubmitForReview,
//   onAskReject,
//   onDeleteOne,
//   onDeleteMany,
//   publishedBusyId,
//   onTogglePublished,
//   toggleBtnRef,
// }: Props) {
//   const viewItems = useMemo(
//     () => filterItemsForView(items, rowMode),
//     [items, rowMode],
//   );

//   const idsOnPage = useMemo(
//     () => viewItems.map((n) => idOf(n)).filter(Boolean),
//     [viewItems],
//   );
//   const sel = useSelection(idsOnPage);

//   const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
//   const clearBtnRef = useRef<HTMLButtonElement | null>(null);

//   const count = sel.selected.size;
//   const showClear = selectMode && count >= 2;

//   useEffect(() => {
//     if (!selectMode) return;
//     requestAnimationFrame(() => cancelBtnRef.current?.focus());
//   }, [selectMode]);

//   async function deleteSelected() {
//     if (!onDeleteMany) return;
//     const ids = Array.from(sel.selected);
//     if (!ids.length) return;
//     await onDeleteMany(ids);
//     sel.clear();
//     onToggleSelectMode();
//   }

//   function onToggleAll() {
//     sel.isAllSelected ? sel.removeAll() : sel.selectAll();
//   }

//   function onClearSelection() {
//     sel.clear();
//     requestAnimationFrame(() => cancelBtnRef.current?.focus());
//   }

//   function rowClick(n: NewsWithProvider) {
//     const id = idOf(n);
//     if (!id) return;
//     if (selectMode) return void sel.toggleOne(id);
//     onOpen(n);
//   }

//   function onRowPointerDown(e: React.PointerEvent) {
//     if (!selectMode) return;
//     e.preventDefault();
//   }

//   if (!viewItems.length) {
//     return (
//       <section className="card">
//         <div className="card__empty">No entries.</div>
//       </section>
//     );
//   }

//   const showSwitch = canShowSwitch(rowMode);

//   return (
//     <>
//       <div className="news-admin__top-actions">
//         <BulkActions
//           toggleRef={toggleBtnRef as RefObject<HTMLButtonElement | null>}
//           cancelRef={cancelBtnRef}
//           clearRef={clearBtnRef}
//           selectMode={selectMode}
//           onToggleSelectMode={() => {
//             sel.clear();
//             onToggleSelectMode();
//           }}
//           count={count}
//           isAllSelected={sel.isAllSelected}
//           busy={busy}
//           isEmpty={viewItems.length === 0}
//           onToggleAll={onToggleAll}
//           onClear={onClearSelection}
//           showClear={showClear}
//           onDelete={deleteSelected}
//           canDelete={!!onDeleteMany}
//           toggleLabel="Select news"
//           selectedLabel="selected"
//           selectAllLabel="Select all"
//           clearAllLabel="Clear all"
//           deleteLabel="Delete"
//           cancelLabel="Cancel"
//         />
//       </div>

//       <section className={`card news-list ${busy ? "is-busy" : ""}`}>
//         <div className="news-list__table">
//           <div className="news-list__head" aria-hidden="true">
//             <div className="news-list__h">Titel</div>
//             <div className="news-list__h">Kategorie</div>
//             <div className="news-list__h">Datum</div>
//             <div className="news-list__h">Status</div>
//             <div className="news-list__h">Autor</div>
//             <div className="news-list__h news-list__h--right">Aktion</div>
//           </div>

//           <ul className="list list--bleed">
//             {viewItems.map((n) => {
//               const id = idOf(n);
//               const checked = sel.selected.has(id);
//               const hideActions = selectMode || checked;

//               const isSwitchBusy = Boolean(
//                 publishedBusyId && publishedBusyId === id,
//               );
//               const published = Boolean((n as any)?.published);

//               const { draftTitle, draftExcerpt, draftCategory } =
//                 getDraftDelta(n);
//               const st = statusParts(n, rowMode);

//               const acts = actionsFor({
//                 n,
//                 rowMode,
//                 busy,
//                 onOpen,
//                 onInfo,
//                 onResubmit,
//                 onSubmitForReview,
//                 onDeleteOne,
//                 onAskReject,
//               });

//               const needsCorrection = getNeedsCorrection(n);

//               return (
//                 <li
//                   key={id}
//                   className={`list__item chip news-list__row is-fullhover is-interactive ${
//                     checked ? "is-selected" : ""
//                   }`}
//                   onPointerDown={onRowPointerDown}
//                   onClick={() => rowClick(n)}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter" || e.key === " ") rowClick(n);
//                   }}
//                   tabIndex={0}
//                   role="button"
//                   aria-pressed={selectMode ? checked : undefined}
//                 >
//                   <div className="news-list__cell news-list__cell--title">
//                     <div className="news-list__title">
//                       {clean(n.title) || "—"}
//                     </div>

//                     <div
//                       className={`news-list__excerpt ${clean(n.excerpt) ? "" : "is-empty"}`}
//                     >
//                       {clean(n.excerpt) || "—"}
//                     </div>

//                     {draftTitle && draftTitle !== clean(n.title) ? (
//                       <div className="news-list__draft-wrap">
//                         {draftLine("Änderung Titel", draftTitle)}
//                       </div>
//                     ) : null}

//                     {draftExcerpt && draftExcerpt !== clean(n.excerpt) ? (
//                       <div className="news-list__draft-wrap">
//                         {draftLine("Änderung Lead", draftExcerpt)}
//                       </div>
//                     ) : null}
//                   </div>

//                   <div className="news-list__cell news-list__cell--cat">
//                     <span className="news-list__pill">
//                       {clean(n.category) || "—"}
//                     </span>
//                     {draftCategory && draftCategory !== clean(n.category) ? (
//                       <span className="news-list__pill news-list__pill--draft">
//                         Änderung: {draftCategory}
//                       </span>
//                     ) : null}
//                   </div>

//                   <div className="news-list__cell news-list__cell--date">
//                     <div>
//                       {fmtDateDe((n as any).date || (n as any).createdAt)}
//                     </div>
//                     {needsCorrection ? (
//                       <div className="news-list__draft-date is-alert">
//                         Bitte korrigieren
//                       </div>
//                     ) : null}
//                   </div>

//                   <div className="news-list__cell news-list__cell--status">
//                     <div className="coach-statusline">
//                       <span className={`news-list__status ${statusClass(n)}`}>
//                         <span className="news-list__status-main">
//                           {st.main}
//                         </span>
//                         {st.sub ? (
//                           <span className="news-list__status-sub">
//                             {st.sub}
//                           </span>
//                         ) : null}
//                       </span>

//                       {showSwitch && onTogglePublished ? (
//                         <span
//                           className={`news-switch-wrap ${isSwitchBusy ? "is-busy" : ""}`}
//                           onClick={stop}
//                           onMouseDown={stop}
//                           onPointerDown={stop}
//                         >
//                           <NewsSwitch
//                             checked={published}
//                             busy={isSwitchBusy}
//                             onToggle={() => {
//                               if (isSwitchBusy) return;
//                               onTogglePublished(n, !published);
//                             }}
//                           />
//                         </span>
//                       ) : null}
//                     </div>
//                   </div>

//                   <div className="news-list__cell news-list__cell--author">
//                     <span className="news-list__author">
//                       {providerLabel(n)}
//                     </span>
//                   </div>

//                   {!hideActions ? (
//                     <div
//                       className="news-list__cell news-list__cell--action"
//                       onClick={stop}
//                       onMouseDown={stop}
//                     >
//                       {acts.map((a) => (
//                         <span
//                           key={a.key}
//                           className={`edit-trigger ${a.disabled ? "is-disabled" : ""}`}
//                           role="button"
//                           tabIndex={a.disabled ? -1 : 0}
//                           {...(!a.tip ? { title: a.title } : {})}
//                           aria-label={a.title}
//                           aria-disabled={a.disabled ? true : undefined}
//                           {...(a.tip ? { "data-ks-tip": a.tip } : {})}
//                           onClick={(e) => {
//                             stop(e);
//                             blurTarget(e.currentTarget);
//                             if (a.disabled) return;
//                             a.run();
//                           }}
//                           onKeyDown={(e) =>
//                             onActionKey(e, () => void a.run(), a.disabled)
//                           }
//                         >
//                           <img
//                             src={a.icon}
//                             alt=""
//                             aria-hidden="true"
//                             className={
//                               "icon-img" + (a.left ? " icon-img--left" : "")
//                             }
//                           />
//                         </span>
//                       ))}
//                     </div>
//                   ) : (
//                     <div
//                       className="news-list__cell news-list__cell--action news-list__actions--hidden"
//                       aria-hidden="true"
//                     />
//                   )}
//                 </li>
//               );
//             })}
//           </ul>
//         </div>
//       </section>
//     </>
//   );
// }
