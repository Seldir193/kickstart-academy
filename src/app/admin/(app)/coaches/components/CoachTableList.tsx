// src/app/admin/(app)/coaches/components/CoachTableList.tsx
"use client";

import type { RefObject } from "react";
import React, { useEffect, useMemo, useRef } from "react";
import type { Coach } from "../types";
import {
  canSubmitUpdate,
  fullName,
  getSlug,
  isApproved,
  isRejected,
  pendingReviewLabel,
  providerLabel,
} from "../utils";
import { useSelection } from "../hooks/useSelection";
import BulkActions from "./BulkActions";

type Props = {
  items: Coach[];
  selectMode: boolean;
  onToggleSelectMode: () => void;
  busy: boolean;
  authorDash?: boolean;
  meLabel?: string;

  onOpen: (c: Coach) => void;
  onDeleteMany: (slugs: string[]) => Promise<void>;
  toggleBtnRef?: RefObject<HTMLButtonElement | null>;

  onInfo?: (c: Coach) => void;
  onUnapprove?: (c: Coach) => void;
  onReject?: (c: Coach) => void;

  onResubmit?: (c: Coach) => void;
  canResubmit?: (c: Coach) => boolean;

  onDelete?: (c: Coach) => void;

  onTogglePublished?: (
    c: Coach,
    nextPublished: boolean,
  ) => void | Promise<void>;
  publishedBusyId?: string | null;
};

function cleanStr(v: unknown) {
  return String(v ?? "").trim();
}

function hasDraft(c: Coach) {
  return Boolean((c as any).hasDraft) && !!(c as any).draft;
}

function effectiveCoachForDisplay(c: Coach, authorDash?: boolean) {
  if (!authorDash) return c;
  if (!hasDraft(c)) return c;
  const d = (c as any).draft;
  if (!d || typeof d !== "object") return c;
  return { ...(c as any), ...(d as any) } as Coach;
}

function positionLabel(c: Coach) {
  const s = cleanStr((c as any).position);
  return s || "Coach";
}

function sinceLabel(c: Coach) {
  const raw = cleanStr((c as any).since);
  if (!raw) return "—";
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 4);
  return raw;
}

// function normalizedPendingLabel(c: Coach, authorDash?: boolean) {
//   const raw = pendingReviewLabel(c);
//   if (!authorDash) return raw;
//   return raw === "Bitte prüfen" ? "Under review" : raw;
// }

function normalizedPendingLabel(c: Coach, authorDash?: boolean) {
  const raw = pendingReviewLabel(c);
  if (!authorDash) return raw;
  return raw === "Please review" ? "Under review" : raw;
}

function statusLabel(c: Coach, authorDash?: boolean) {
  if (isApproved(c)) return "Approved";
  if (isRejected(c)) return "Rejected";
  return normalizedPendingLabel(c, authorDash);
}

function isSubmitAllowed(c: Coach, canResubmit?: (c: Coach) => boolean) {
  if (typeof canResubmit === "function") return Boolean(canResubmit(c));
  return canSubmitUpdate(c);
}

function stop(e: React.SyntheticEvent) {
  e.preventDefault();
  e.stopPropagation();
}

function onActionKey(
  e: React.KeyboardEvent,
  cb: () => void,
  disabled: boolean,
) {
  if (disabled) return;
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  e.stopPropagation();
  cb();
}

export default function CoachTableList({
  items,
  selectMode,
  onToggleSelectMode,
  busy,
  authorDash,
  meLabel,
  onOpen,
  onDeleteMany,
  toggleBtnRef,
  onInfo,
  onUnapprove,
  onReject,
  onResubmit,
  canResubmit,
  onDelete,
  onTogglePublished,
  publishedBusyId,
}: Props) {
  const idsOnPage = useMemo(() => items.map(getSlug).filter(Boolean), [items]);
  const sel = useSelection(idsOnPage);

  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
  const clearBtnRef = useRef<HTMLButtonElement | null>(null);
  const prevCountRef = useRef(0);

  const count = sel.selected.size;
  const showClear = selectMode && count >= 2;

  useEffect(() => {
    let rafId: number | null = null;

    if (!selectMode) {
      prevCountRef.current = 0;
      return;
    }

    const prev = prevCountRef.current;
    const next = count;
    prevCountRef.current = next;

    if (next >= 2) {
      rafId = requestAnimationFrame(() => clearBtnRef.current?.focus());
    } else if (next === 0) {
      rafId = requestAnimationFrame(() => cancelBtnRef.current?.focus());
    } else if (prev !== next) {
      rafId = requestAnimationFrame(() => cancelBtnRef.current?.blur());
    }

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [selectMode, count]);

  function authorText(c: Coach) {
    if (authorDash) return cleanStr(meLabel) || "Me";
    return providerLabel(c);
  }

  async function deleteSelected() {
    const slugs = Array.from(sel.selected);
    if (!slugs.length) return;
    await onDeleteMany(slugs);
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

  function rowClick(c: Coach) {
    const slug = cleanStr(getSlug(c));
    if (!slug) return;
    if (selectMode) sel.toggleOne(slug);
    else onOpen(c);
  }

  if (!items.length) {
    return (
      <section className="card">
        <div className="card__empty">No entries.</div>
      </section>
    );
  }

  return (
    <>
      <div className="coach-admin__top-actions">
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
          disabled={items.length === 0}
          onToggleAll={onToggleAll}
          onClear={onClearSelection}
          showClear={showClear}
          onDelete={deleteSelected}
        />
      </div>

      <section className="card coach-list">
        <div className="coach-list__table">
          <div className="coach-list__head" aria-hidden="true">
            <div className="coach-list__h">Name</div>
            <div className="coach-list__h">Position</div>
            <div className="coach-list__h">Since</div>
            <div className="coach-list__h">Status</div>
            <div className="coach-list__h">Author</div>
            <div className="coach-list__h coach-list__h--right">Action</div>
          </div>

          <ul className="list list--bleed">
            {items.map((raw) => {
              const c = effectiveCoachForDisplay(raw, authorDash);
              const slug = cleanStr(getSlug(raw));
              const checked = sel.selected.has(slug);
              const hideActions = selectMode || checked;

              const approved = isApproved(raw);
              const rejected = isRejected(raw);
              const published = Boolean((raw as any).published);
              const isSwitchBusy = Boolean(
                publishedBusyId && publishedBusyId === slug,
              );

              const showSubmit = Boolean(onResubmit) && (rejected || approved);
              const allowed = showSubmit && isSubmitAllowed(raw, canResubmit);
              const submitDisabled = busy || !allowed;

              const editDisabled = busy;
              const unapproveDisabled = busy;
              const rejectDisabled = busy;
              const infoDisabled = busy;
              const deleteDisabled = busy;

              const statusClass = rejected
                ? "is-rejected"
                : approved
                  ? published
                    ? "is-on"
                    : "is-off"
                  : "is-off";

              return (
                <li
                  key={slug}
                  className={`list__item chip coach-list__row is-fullhover is-interactive ${
                    checked ? "is-selected" : ""
                  }`}
                  onClick={() => rowClick(raw)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") rowClick(raw);
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectMode ? checked : undefined}
                >
                  <div className="coach-list__cell coach-list__cell--name">
                    <div className="coach-list__title">{fullName(c)}</div>
                    <div
                      className={`coach-list__excerpt ${
                        cleanStr(getSlug(c)) ? "" : "is-empty"
                      }`}
                    >
                      {cleanStr(getSlug(c)) || "—"}
                    </div>
                  </div>

                  <div className="coach-list__cell coach-list__cell--pos">
                    <span className="coach-list__pill">{positionLabel(c)}</span>
                  </div>

                  <div className="coach-list__cell coach-list__cell--since">
                    {sinceLabel(c)}
                  </div>

                  <div className="coach-list__cell coach-list__cell--status">
                    <div className="coach-statusline">
                      <span className={`coach-list__status ${statusClass}`}>
                        <span className="coach-list__status-main">
                          {statusLabel(raw, authorDash)}
                        </span>
                        {approved ? (
                          <span className="coach-list__status-sub">
                            {published ? "Online" : "Offline"}
                          </span>
                        ) : null}
                      </span>

                      {approved && onTogglePublished ? (
                        <span
                          className={`coach-switch-wrap ${
                            isSwitchBusy ? "is-busy" : ""
                          }`}
                          onClick={stop}
                          onMouseDown={stop}
                          onPointerDown={stop}
                        >
                          <span
                            className={`coach-switch ${published ? "is-on" : ""}`}
                            role="switch"
                            aria-checked={published}
                            aria-disabled={isSwitchBusy ? true : undefined}
                            tabIndex={0}
                            onClick={(e) => {
                              stop(e);
                              if (isSwitchBusy) return;
                              onTogglePublished(raw, !published);
                            }}
                            onKeyDown={(e) =>
                              onActionKey(
                                e,
                                () => onTogglePublished(raw, !published),
                                isSwitchBusy,
                              )
                            }
                            title={published ? "Online" : "Offline"}
                          >
                            <span className="coach-switch__track">
                              <span className="coach-switch__thumb" />
                            </span>
                          </span>
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="coach-list__cell coach-list__cell--author">
                    {authorText(raw)}
                  </div>

                  {!hideActions ? (
                    <div
                      className="coach-list__cell coach-list__cell--action"
                      onClick={stop}
                      onMouseDown={stop}
                    >
                      <span
                        className="edit-trigger"
                        role="button"
                        tabIndex={0}
                        title="Edit"
                        aria-disabled={editDisabled ? true : undefined}
                        onClick={(e) => {
                          stop(e);
                          if (editDisabled) return;
                          onOpen(raw);
                        }}
                        onKeyDown={(e) =>
                          onActionKey(e, () => onOpen(raw), editDisabled)
                        }
                      >
                        <img
                          src="/icons/edit.svg"
                          alt=""
                          aria-hidden="true"
                          className="icon-img"
                        />
                      </span>

                      {onInfo ? (
                        <span
                          className="edit-trigger"
                          role="button"
                          tabIndex={0}
                          title="Info"
                          aria-disabled={infoDisabled ? true : undefined}
                          onClick={(e) => {
                            stop(e);
                            if (infoDisabled) return;
                            onInfo(raw);
                          }}
                          onKeyDown={(e) =>
                            onActionKey(e, () => onInfo(raw), infoDisabled)
                          }
                        >
                          <img
                            src="/icons/info.svg"
                            alt=""
                            aria-hidden="true"
                            className="icon-img"
                          />
                        </span>
                      ) : null}

                      {showSubmit ? (
                        <span
                          className={`edit-trigger${submitDisabled ? " is-disabled" : ""}`}
                          role="button"
                          tabIndex={0}
                          data-ks-tip={
                            submitDisabled ? "Please update first" : undefined
                          }
                          aria-disabled={submitDisabled ? true : undefined}
                          onClick={async (e) => {
                            stop(e);
                            if (submitDisabled) return;
                            await Promise.resolve(onResubmit?.(raw));
                          }}
                          onKeyDown={(e) =>
                            onActionKey(
                              e,
                              () => onResubmit?.(raw),
                              submitDisabled,
                            )
                          }
                          title="Submit for review"
                        >
                          <img
                            src="/icons/arrow_right_alt.svg"
                            alt=""
                            aria-hidden="true"
                            className="icon-img icon-img--left"
                          />
                        </span>
                      ) : onReject ? (
                        <span
                          className="edit-trigger"
                          role="button"
                          tabIndex={0}
                          title="Reject"
                          aria-disabled={rejectDisabled ? true : undefined}
                          onClick={(e) => {
                            stop(e);
                            if (rejectDisabled) return;
                            onReject(raw);
                          }}
                          onKeyDown={(e) =>
                            onActionKey(e, () => onReject(raw), rejectDisabled)
                          }
                        >
                          <img
                            src="/icons/arrow_right_alt.svg"
                            alt=""
                            aria-hidden="true"
                            className="icon-img icon-img--left"
                          />
                        </span>
                      ) : null}

                      {onDelete ? (
                        <span
                          className="edit-trigger"
                          role="button"
                          tabIndex={0}
                          title="Delete"
                          aria-disabled={deleteDisabled ? true : undefined}
                          onClick={(e) => {
                            stop(e);
                            if (deleteDisabled) return;
                            onDelete(raw);
                          }}
                          onKeyDown={(e) =>
                            onActionKey(e, () => onDelete(raw), deleteDisabled)
                          }
                        >
                          <img
                            src="/icons/delete.svg"
                            alt=""
                            aria-hidden="true"
                            className="icon-img"
                          />
                        </span>
                      ) : onUnapprove ? (
                        <span
                          className="edit-trigger"
                          role="button"
                          tabIndex={0}
                          title="Remove"
                          aria-disabled={unapproveDisabled ? true : undefined}
                          onClick={(e) => {
                            stop(e);
                            if (unapproveDisabled) return;
                            onUnapprove(raw);
                          }}
                          onKeyDown={(e) =>
                            onActionKey(
                              e,
                              () => onUnapprove(raw),
                              unapproveDisabled,
                            )
                          }
                        >
                          <img
                            src="/icons/delete.svg"
                            alt=""
                            aria-hidden="true"
                            className="icon-img"
                          />
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div
                      className="coach-list__cell coach-list__cell--action coach-list__actions--hidden"
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

// // src/app/admin/(app)/coaches/components/CoachTableList.tsx
// "use client";

// import type { RefObject } from "react";
// import React, { useEffect, useMemo, useRef } from "react";
// import type { Coach } from "../types";
// import {
//   canSubmitUpdate,
//   fullName,
//   getSlug,
//   isApproved,
//   isRejected,
//   pendingReviewLabel,
//   providerLabel,
// } from "../utils";
// import { useSelection } from "../hooks/useSelection";
// import BulkActions from "./BulkActions";

// type Props = {
//   items: Coach[];
//   selectMode: boolean;
//   onToggleSelectMode: () => void;
//   busy: boolean;
//   authorDash?: boolean;
//   meLabel?: string;

//   onOpen: (c: Coach) => void;
//   onDeleteMany: (slugs: string[]) => Promise<void>;
//   toggleBtnRef?: RefObject<HTMLButtonElement | null>;

//   onInfo?: (c: Coach) => void;
//   onUnapprove?: (c: Coach) => void;
//   onReject?: (c: Coach) => void;

//   onResubmit?: (c: Coach) => void;
//   canResubmit?: (c: Coach) => boolean;

//   onDelete?: (c: Coach) => void;

//   onTogglePublished?: (
//     c: Coach,
//     nextPublished: boolean,
//   ) => void | Promise<void>;
//   publishedBusyId?: string | null;
// };

// function cleanStr(v: unknown) {
//   return String(v ?? "").trim();
// }

// function hasDraft(c: Coach) {
//   return Boolean((c as any).hasDraft) && !!(c as any).draft;
// }

// function effectiveCoachForDisplay(c: Coach, authorDash?: boolean) {
//   if (!authorDash) return c;
//   if (!hasDraft(c)) return c;
//   const d = (c as any).draft;
//   if (!d || typeof d !== "object") return c;
//   return { ...(c as any), ...(d as any) } as Coach;
// }

// function positionLabel(c: Coach) {
//   const s = cleanStr((c as any).position);
//   return s || "Trainer";
// }

// function sinceLabel(c: Coach) {
//   const raw = cleanStr((c as any).since);
//   if (!raw) return "—";
//   if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 4);
//   return raw;
// }

// function normalizedPendingLabel(c: Coach, authorDash?: boolean) {
//   const raw = pendingReviewLabel(c);
//   if (!authorDash) return raw;
//   return raw === "Bitte prüfen" ? "Wird geprüft" : raw;
// }

// function statusLabel(c: Coach, authorDash?: boolean) {
//   if (isApproved(c)) return "Freigegeben";
//   if (isRejected(c)) return "Abgelehnt";
//   return normalizedPendingLabel(c, authorDash);
// }

// function isSubmitAllowed(c: Coach, canResubmit?: (c: Coach) => boolean) {
//   if (typeof canResubmit === "function") return Boolean(canResubmit(c));
//   return canSubmitUpdate(c);
// }

// function stop(e: React.SyntheticEvent) {
//   e.preventDefault();
//   e.stopPropagation();
// }

// function onActionKey(
//   e: React.KeyboardEvent,
//   cb: () => void,
//   disabled: boolean,
// ) {
//   if (disabled) return;
//   if (e.key !== "Enter" && e.key !== " ") return;
//   e.preventDefault();
//   e.stopPropagation();
//   cb();
// }

// export default function CoachTableList({
//   items,
//   selectMode,
//   onToggleSelectMode,
//   busy,
//   authorDash,
//   meLabel,
//   onOpen,
//   onDeleteMany,
//   toggleBtnRef,
//   onInfo,
//   onUnapprove,
//   onReject,
//   onResubmit,
//   canResubmit,
//   onDelete,
//   onTogglePublished,
//   publishedBusyId,
// }: Props) {
//   const idsOnPage = useMemo(() => items.map(getSlug).filter(Boolean), [items]);
//   const sel = useSelection(idsOnPage);

//   const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
//   const clearBtnRef = useRef<HTMLButtonElement | null>(null);
//   const prevCountRef = useRef(0);

//   const count = sel.selected.size;
//   const showClear = selectMode && count >= 2;

//   useEffect(() => {
//     let rafId: number | null = null;

//     if (!selectMode) {
//       prevCountRef.current = 0;
//       return;
//     }

//     const prev = prevCountRef.current;
//     const next = count;
//     prevCountRef.current = next;

//     if (next >= 2) {
//       rafId = requestAnimationFrame(() => clearBtnRef.current?.focus());
//     } else if (next === 0) {
//       rafId = requestAnimationFrame(() => cancelBtnRef.current?.focus());
//     } else if (prev !== next) {
//       rafId = requestAnimationFrame(() => cancelBtnRef.current?.blur());
//     }

//     return () => {
//       if (rafId !== null) cancelAnimationFrame(rafId);
//     };
//   }, [selectMode, count]);

//   function authorText(c: Coach) {
//     if (authorDash) return cleanStr(meLabel) || "Ich";
//     return providerLabel(c);
//   }

//   async function deleteSelected() {
//     const slugs = Array.from(sel.selected);
//     if (!slugs.length) return;
//     await onDeleteMany(slugs);
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

//   function rowClick(c: Coach) {
//     const slug = cleanStr(getSlug(c));
//     if (!slug) return;
//     if (selectMode) sel.toggleOne(slug);
//     else onOpen(c);
//   }

//   if (!items.length) {
//     return (
//       <section className="card">
//         <div className="card__empty">No entries.</div>
//       </section>
//     );
//   }

//   return (
//     <>
//       <div className="coach-admin__top-actions">
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
//           disabled={items.length === 0}
//           onToggleAll={onToggleAll}
//           onClear={onClearSelection}
//           showClear={showClear}
//           onDelete={deleteSelected}
//         />
//       </div>

//       <section className="card coach-list">
//         <div className="coach-list__table">
//           <div className="coach-list__head" aria-hidden="true">
//             <div className="coach-list__h">Name</div>
//             <div className="coach-list__h">Position</div>
//             <div className="coach-list__h">Seit</div>
//             <div className="coach-list__h">Status</div>
//             <div className="coach-list__h">Autor</div>
//             <div className="coach-list__h coach-list__h--right">Aktion</div>
//           </div>

//           <ul className="list list--bleed">
//             {items.map((raw) => {
//               const c = effectiveCoachForDisplay(raw, authorDash);
//               const slug = cleanStr(getSlug(raw));
//               const checked = sel.selected.has(slug);
//               const hideActions = selectMode || checked;

//               const approved = isApproved(raw);
//               const rejected = isRejected(raw);
//               const published = Boolean((raw as any).published);
//               const isSwitchBusy = Boolean(
//                 publishedBusyId && publishedBusyId === slug,
//               );

//               const showSubmit = Boolean(onResubmit) && (rejected || approved);
//               const allowed = showSubmit && isSubmitAllowed(raw, canResubmit);
//               const submitDisabled = busy || !allowed;

//               const editDisabled = busy;
//               const unapproveDisabled = busy;
//               const rejectDisabled = busy;
//               const infoDisabled = busy;
//               const deleteDisabled = busy;

//               const statusClass = rejected
//                 ? "is-rejected"
//                 : approved
//                   ? published
//                     ? "is-on"
//                     : "is-off"
//                   : "is-off";

//               return (
//                 <li
//                   key={slug}
//                   className={`list__item chip coach-list__row is-fullhover is-interactive ${
//                     checked ? "is-selected" : ""
//                   }`}
//                   onClick={() => rowClick(raw)}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter" || e.key === " ") rowClick(raw);
//                   }}
//                   tabIndex={0}
//                   role="button"
//                   aria-pressed={selectMode ? checked : undefined}
//                 >
//                   <div className="coach-list__cell coach-list__cell--name">
//                     <div className="coach-list__title">{fullName(c)}</div>
//                     <div
//                       className={`coach-list__excerpt ${
//                         cleanStr(getSlug(c)) ? "" : "is-empty"
//                       }`}
//                     >
//                       {cleanStr(getSlug(c)) || "—"}
//                     </div>
//                   </div>

//                   <div className="coach-list__cell coach-list__cell--pos">
//                     <span className="coach-list__pill">{positionLabel(c)}</span>
//                   </div>

//                   <div className="coach-list__cell coach-list__cell--since">
//                     {sinceLabel(c)}
//                   </div>

//                   <div className="coach-list__cell coach-list__cell--status">
//                     <div className="coach-statusline">
//                       <span className={`coach-list__status ${statusClass}`}>
//                         <span className="coach-list__status-main">
//                           {statusLabel(raw, authorDash)}
//                         </span>
//                         {approved ? (
//                           <span className="coach-list__status-sub">
//                             {published ? "Online" : "Offline"}
//                           </span>
//                         ) : null}
//                       </span>

//                       {approved && onTogglePublished ? (
//                         <span
//                           className={`coach-switch-wrap ${
//                             isSwitchBusy ? "is-busy" : ""
//                           }`}
//                           onClick={stop}
//                           onMouseDown={stop}
//                           onPointerDown={stop}
//                         >
//                           <span
//                             className={`coach-switch ${published ? "is-on" : ""}`}
//                             role="switch"
//                             aria-checked={published}
//                             aria-disabled={isSwitchBusy ? true : undefined}
//                             tabIndex={0}
//                             onClick={(e) => {
//                               stop(e);
//                               if (isSwitchBusy) return;
//                               onTogglePublished(raw, !published);
//                             }}
//                             onKeyDown={(e) =>
//                               onActionKey(
//                                 e,
//                                 () => onTogglePublished(raw, !published),
//                                 isSwitchBusy,
//                               )
//                             }
//                             title={published ? "Online" : "Offline"}
//                           >
//                             <span className="coach-switch__track">
//                               <span className="coach-switch__thumb" />
//                             </span>
//                           </span>
//                         </span>
//                       ) : null}
//                     </div>
//                   </div>

//                   <div className="coach-list__cell coach-list__cell--author">
//                     {authorText(raw)}
//                   </div>

//                   {!hideActions ? (
//                     <div
//                       className="coach-list__cell coach-list__cell--action"
//                       onClick={stop}
//                       onMouseDown={stop}
//                     >
//                       <span
//                         className="edit-trigger"
//                         role="button"
//                         tabIndex={0}
//                         title="Bearbeiten"
//                         aria-disabled={editDisabled ? true : undefined}
//                         onClick={(e) => {
//                           stop(e);
//                           if (editDisabled) return;
//                           onOpen(raw);
//                         }}
//                         onKeyDown={(e) =>
//                           onActionKey(e, () => onOpen(raw), editDisabled)
//                         }
//                       >
//                         <img
//                           src="/icons/edit.svg"
//                           alt=""
//                           aria-hidden="true"
//                           className="icon-img"
//                         />
//                       </span>

//                       {onInfo ? (
//                         <span
//                           className="edit-trigger"
//                           role="button"
//                           tabIndex={0}
//                           title="Info"
//                           aria-disabled={infoDisabled ? true : undefined}
//                           onClick={(e) => {
//                             stop(e);
//                             if (infoDisabled) return;
//                             onInfo(raw);
//                           }}
//                           onKeyDown={(e) =>
//                             onActionKey(e, () => onInfo(raw), infoDisabled)
//                           }
//                         >
//                           <img
//                             src="/icons/info.svg"
//                             alt=""
//                             aria-hidden="true"
//                             className="icon-img"
//                           />
//                         </span>
//                       ) : null}

//                       {showSubmit ? (
//                         <span
//                           className={`edit-trigger${submitDisabled ? " is-disabled" : ""}`}
//                           role="button"
//                           tabIndex={0}
//                           data-ks-tip={
//                             submitDisabled
//                               ? "Bitte zuerst aktualisieren"
//                               : undefined
//                           }
//                           aria-disabled={submitDisabled ? true : undefined}
//                           onClick={async (e) => {
//                             stop(e);
//                             if (submitDisabled) return;
//                             await Promise.resolve(onResubmit?.(raw));
//                           }}
//                           onKeyDown={(e) =>
//                             onActionKey(
//                               e,
//                               () => onResubmit?.(raw),
//                               submitDisabled,
//                             )
//                           }
//                           title="Zur Prüfung einreichen"
//                         >
//                           <img
//                             src="/icons/arrow_right_alt.svg"
//                             alt=""
//                             aria-hidden="true"
//                             className="icon-img icon-img--left"
//                           />
//                         </span>
//                       ) : onReject ? (
//                         <span
//                           className="edit-trigger"
//                           role="button"
//                           tabIndex={0}
//                           title="Ablehnen"
//                           aria-disabled={rejectDisabled ? true : undefined}
//                           onClick={(e) => {
//                             stop(e);
//                             if (rejectDisabled) return;
//                             onReject(raw);
//                           }}
//                           onKeyDown={(e) =>
//                             onActionKey(e, () => onReject(raw), rejectDisabled)
//                           }
//                         >
//                           <img
//                             src="/icons/arrow_right_alt.svg"
//                             alt=""
//                             aria-hidden="true"
//                             className="icon-img icon-img--left"
//                           />
//                         </span>
//                       ) : null}

//                       {onDelete ? (
//                         <span
//                           className="edit-trigger"
//                           role="button"
//                           tabIndex={0}
//                           title="Löschen"
//                           aria-disabled={deleteDisabled ? true : undefined}
//                           onClick={(e) => {
//                             stop(e);
//                             if (deleteDisabled) return;
//                             onDelete(raw);
//                           }}
//                           onKeyDown={(e) =>
//                             onActionKey(e, () => onDelete(raw), deleteDisabled)
//                           }
//                         >
//                           <img
//                             src="/icons/delete.svg"
//                             alt=""
//                             aria-hidden="true"
//                             className="icon-img"
//                           />
//                         </span>
//                       ) : onUnapprove ? (
//                         <span
//                           className="edit-trigger"
//                           role="button"
//                           tabIndex={0}
//                           title="Entfernen"
//                           aria-disabled={unapproveDisabled ? true : undefined}
//                           onClick={(e) => {
//                             stop(e);
//                             if (unapproveDisabled) return;
//                             onUnapprove(raw);
//                           }}
//                           onKeyDown={(e) =>
//                             onActionKey(
//                               e,
//                               () => onUnapprove(raw),
//                               unapproveDisabled,
//                             )
//                           }
//                         >
//                           <img
//                             src="/icons/delete.svg"
//                             alt=""
//                             aria-hidden="true"
//                             className="icon-img"
//                           />
//                         </span>
//                       ) : null}
//                     </div>
//                   ) : (
//                     <div
//                       className="coach-list__cell coach-list__cell--action coach-list__actions--hidden"
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
