// // //src\app\components\training-card\ui\TrainingResults.tsx
"use client";

import type { RefObject } from "react";
import { useEffect, useMemo, useRef } from "react";
//import BulkActions from "@/app/admin/(app)/news/components/BulkActions";
import BulkActionsBar from "./BulkActionsBar";
import { useSelection } from "@/app/admin/(app)/news/hooks/useSelection";
import type { Offer } from "../types";

type Props = {
  loading: boolean;
  items: Offer[];
  selectedIds: string[];
  selectMode: boolean;
  onToggleSelectMode: () => void;
  onDeleteMany: (ids: string[]) => Promise<void>;
  onOpen: (item: Offer) => void;
  onToggleOne: (id: string) => void;
  avatarSrc: (item: Offer) => string;
};

function safeText(value: unknown) {
  return String(value ?? "").trim();
}

function idOf(item: Offer) {
  return safeText(item?._id);
}

function titleParts(raw: string) {
  const parts = safeText(raw).split(" — ");
  return { left: safeText(parts[0]), right: safeText(parts[1]) };
}

function courseTitle(item: Offer) {
  const raw = safeText(item.title);
  if (!raw) return safeText(item.type) || "Training";
  const { left } = titleParts(raw);
  const dot = safeText(left.split(" • ")[0]);
  return dot || safeText(item.type) || "Training";
}

function courseMeta(item: Offer) {
  const titleLower = safeText(item.title).toLowerCase();
  const course = safeText(item.sub_type || item.type);
  if (!course) return "\u00A0";
  if (titleLower.includes(course.toLowerCase())) return "\u00A0";
  return course;
}

function placeLabel(item: Offer) {
  const city = safeText((item as any).city);
  if (city) return city;
  const loc = safeText((item as any).location);
  if (loc) return loc;
  const { right } = titleParts(safeText(item.title));
  return right || "—";
}

function formatPrice(value?: number) {
  if (typeof value !== "number") return "—";
  return `${value} €`;
}

function formatDateDe(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function pickDate(item: Offer) {
  return (
    safeText((item as any).updatedAt) || safeText((item as any).createdAt) || ""
  );
}

export default function TrainingResults(props: Props) {
  const idsOnPage = useMemo(
    () => props.items.map(idOf).filter(Boolean),
    [props.items],
  );
  const sel = useSelection(idsOnPage);

  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
  const clearBtnRef = useRef<HTMLButtonElement | null>(null);
  const prevCountRef = useRef(0);

  const count = sel.selected.size;
  const showClear = props.selectMode && count >= 2;

  useEffect(() => {
    if (!props.selectMode) {
      if (sel.selected.size) sel.clear();
      prevCountRef.current = 0;
      return;
    }

    const targetIds = props.selectedIds.filter((id) => idsOnPage.includes(id));
    const currentIds = Array.from(sel.selected);
    const sameLen = currentIds.length === targetIds.length;
    const same = sameLen && currentIds.every((id) => targetIds.includes(id));

    if (same) return;
    sel.clear();
    targetIds.forEach((id) => sel.toggleOne(id));
  }, [props.selectMode, props.selectedIds, idsOnPage, sel]);

  useEffect(() => {
    if (!props.selectMode) {
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
  }, [props.selectMode, count]);

  function syncExternalSelection(nextIds: string[]) {
    const current = new Set(props.selectedIds);
    const next = new Set(nextIds);
    const merged = Array.from(
      new Set([...props.selectedIds, ...nextIds, ...idsOnPage]),
    );

    for (const id of merged) {
      const a = current.has(id);
      const b = next.has(id);
      if (a === b) continue;
      props.onToggleOne(id);
    }
  }

  async function deleteSelected() {
    const ids = Array.from(sel.selected);
    if (!ids.length) return;
    await props.onDeleteMany(ids);
    sel.clear();
    syncExternalSelection([]);
    props.onToggleSelectMode();
  }

  function toggleAll() {
    if (sel.isAllSelected) {
      sel.removeAll();
      syncExternalSelection([]);
      return;
    }
    sel.selectAll();
    syncExternalSelection(idsOnPage);
  }

  function clearSelection() {
    sel.clear();
    syncExternalSelection([]);
    requestAnimationFrame(() => cancelBtnRef.current?.focus());
  }

  function onToggleSelectMode() {
    if (props.selectMode) syncExternalSelection([]);
    sel.clear();
    props.onToggleSelectMode();
  }

  function handleRowClick(item: Offer) {
    const id = idOf(item);
    if (!id) return;

    if (!props.selectMode) {
      props.onOpen(item);
      return;
    }

    sel.toggleOne(id);
    props.onToggleOne(id);
  }

  function onEditClick(item: Offer) {
    props.onOpen(item);
  }

  if (!props.items.length) {
    return (
      <section className="card">
        <div className="card__empty">
          {props.loading ? "Loading…" : "No entries."}
        </div>
      </section>
    );
  }

  return (
    <div className="news-table">
      <div className="news-admin__top-actions">
        <BulkActionsBar
          toggleRef={toggleBtnRef as RefObject<HTMLButtonElement | null>}
          cancelRef={cancelBtnRef as RefObject<HTMLButtonElement | null>}
          clearRef={clearBtnRef as RefObject<HTMLButtonElement | null>}
          selectMode={props.selectMode}
          onToggleSelectMode={onToggleSelectMode}
          selectedCount={count}
          allSelected={sel.isAllSelected}
          busy={false}
          isEmpty={props.items.length === 0}
          onToggleAll={toggleAll}
          onClear={clearSelection}
          onBulkDelete={deleteSelected}
        />
      </div>

      <div className="news-table__scroll">
        <section className="card news-list">
          <div className="news-list__table">
            <div className="news-list__head" aria-hidden="true">
              <div className="news-list__h">Coach</div>
              <div className="news-list__h">Course</div>
              <div className="news-list__h">Place</div>
              <div className="news-list__h">Price</div>
              <div className="news-list__h">Date</div>
              <div className="news-list__h news-list__h--right">Action</div>
            </div>

            <ul className="list list--bleed">
              {props.items.map((item) => {
                const id = idOf(item);
                const checked = sel.selected.has(id);
                const hideEdit = props.selectMode || checked;

                return (
                  <li
                    key={id}
                    className={`list__item chip news-list__row is-fullhover is-interactive ${
                      checked ? "is-selected" : ""
                    } ${props.selectMode ? "is-selectmode" : ""}`}
                    onClick={() => handleRowClick(item)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") return;
                      event.preventDefault();
                      handleRowClick(item);
                    }}
                    tabIndex={0}
                    role="button"
                    aria-pressed={props.selectMode ? checked : undefined}
                    aria-label={
                      props.selectMode
                        ? `Select: ${courseTitle(item)}`
                        : `Open: ${courseTitle(item)}`
                    }
                  >
                    <div className="news-list__cell">
                      <img
                        src={props.avatarSrc(item) || "/assets/img/avatar.png"}
                        alt={
                          safeText(item.coachName)
                            ? `Coach ${safeText(item.coachName)}`
                            : "Coach"
                        }
                        className="list__avatar"
                        onError={(event) => {
                          event.currentTarget.src = "/assets/img/avatar.png";
                        }}
                      />
                    </div>

                    <div className="news-list__cell">
                      <div className="news-list__title">
                        {courseTitle(item)}
                      </div>
                      <div className="news-list__excerpt">
                        {courseMeta(item)}
                      </div>
                    </div>

                    <div className="news-list__cell">
                      <div className="news-list__title">{placeLabel(item)}</div>
                      <div className="news-list__excerpt is-empty">
                        {"\u00A0"}
                      </div>
                    </div>

                    <div className="news-list__cell">
                      <div className="news-list__title">
                        {formatPrice(item.price)}
                      </div>
                      <div className="news-list__excerpt is-empty">
                        {"\u00A0"}
                      </div>
                    </div>

                    <div className="news-list__cell">
                      <div className="news-list__title">
                        {formatDateDe(pickDate(item))}
                      </div>
                      <div className="news-list__excerpt is-empty">
                        {"\u00A0"}
                      </div>
                    </div>

                    {!hideEdit ? (
                      <div
                        className="news-list__cell news-list__cell--action"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEditClick(item);
                        }}
                        onMouseDown={(event) => event.stopPropagation()}
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

// // // //src\app\components\training-card\ui\TrainingResults.tsx
// "use client";

// import type { RefObject } from "react";
// import { useEffect, useMemo, useRef } from "react";
// import BulkActions from "@/app/admin/(app)/news/components/BulkActions";
// import { useSelection } from "@/app/admin/(app)/news/hooks/useSelection";
// import type { Offer } from "../types";

// type Props = {
//   loading: boolean;
//   items: Offer[];
//   selectedIds: string[];
//   selectMode: boolean;
//   onToggleSelectMode: () => void;
//   onDeleteMany: (ids: string[]) => Promise<void>;
//   onOpen: (item: Offer) => void;
//   onToggleOne: (id: string) => void;
//   avatarSrc: (item: Offer) => string;
// };

// function safeText(value: unknown) {
//   return String(value ?? "").trim();
// }

// function idOf(item: Offer) {
//   return safeText(item?._id);
// }

// function courseTitle(item: Offer) {
//   const raw = safeText(item.title);
//   if (!raw) return safeText(item.type) || "Training";
//   const dash = raw.split(" — ")[0];
//   const dot = dash.split(" • ")[0];
//   return safeText(dot) || safeText(item.type) || "Training";
// }

// function courseMeta(item: Offer) {
//   const titleLower = safeText(item.title).toLowerCase();
//   const course = safeText(item.sub_type || item.type);
//   if (!course) return "\u00A0";
//   if (titleLower.includes(course.toLowerCase())) return "\u00A0";
//   return course;
// }

// function formatPrice(value?: number) {
//   if (typeof value !== "number") return "—";
//   return `${value} €`;
// }

// function formatDateDe(value?: string) {
//   if (!value) return "—";
//   const d = new Date(value);
//   if (Number.isNaN(d.getTime())) return "—";
//   return d.toLocaleDateString("de-DE", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   });
// }

// function pickDate(item: Offer) {
//   return (
//     safeText((item as any).updatedAt) || safeText((item as any).createdAt) || ""
//   );
// }

// export default function TrainingResults(props: Props) {
//   const idsOnPage = useMemo(
//     () => props.items.map(idOf).filter(Boolean),
//     [props.items],
//   );
//   const sel = useSelection(idsOnPage);

//   const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
//   const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
//   const clearBtnRef = useRef<HTMLButtonElement | null>(null);
//   const prevCountRef = useRef(0);

//   const count = sel.selected.size;
//   const showClear = props.selectMode && count >= 2;

//   useEffect(() => {
//     if (!props.selectMode) {
//       if (sel.selected.size) sel.clear();
//       prevCountRef.current = 0;
//       return;
//     }

//     const targetIds = props.selectedIds.filter((id) => idsOnPage.includes(id));
//     const currentIds = Array.from(sel.selected);
//     const sameLen = currentIds.length === targetIds.length;
//     const same = sameLen && currentIds.every((id) => targetIds.includes(id));

//     if (same) return;
//     sel.clear();
//     targetIds.forEach((id) => sel.toggleOne(id));
//   }, [props.selectMode, props.selectedIds, idsOnPage, sel]);

//   useEffect(() => {
//     if (!props.selectMode) {
//       prevCountRef.current = 0;
//       return;
//     }

//     const prev = prevCountRef.current;
//     prevCountRef.current = count;

//     if (count >= 2) {
//       requestAnimationFrame(() => clearBtnRef.current?.focus());
//       return;
//     }

//     if (prev >= 2 && count < 2) {
//       requestAnimationFrame(() => cancelBtnRef.current?.focus());
//     }
//   }, [props.selectMode, count]);

//   function syncExternalSelection(nextIds: string[]) {
//     const current = new Set(props.selectedIds);
//     const next = new Set(nextIds);
//     const merged = Array.from(
//       new Set([...props.selectedIds, ...nextIds, ...idsOnPage]),
//     );

//     for (const id of merged) {
//       const a = current.has(id);
//       const b = next.has(id);
//       if (a === b) continue;
//       props.onToggleOne(id);
//     }
//   }

//   async function deleteSelected() {
//     const ids = Array.from(sel.selected);
//     if (!ids.length) return;
//     await props.onDeleteMany(ids);
//     sel.clear();
//     syncExternalSelection([]);
//     props.onToggleSelectMode();
//   }

//   function toggleAll() {
//     if (sel.isAllSelected) {
//       sel.removeAll();
//       syncExternalSelection([]);
//       return;
//     }
//     sel.selectAll();
//     syncExternalSelection(idsOnPage);
//   }

//   function clearSelection() {
//     sel.clear();
//     syncExternalSelection([]);
//     requestAnimationFrame(() => cancelBtnRef.current?.focus());
//   }

//   function onToggleSelectMode() {
//     if (props.selectMode) syncExternalSelection([]);
//     sel.clear();
//     props.onToggleSelectMode();
//   }

//   function handleRowClick(item: Offer) {
//     const id = idOf(item);
//     if (!id) return;

//     if (!props.selectMode) {
//       props.onOpen(item);
//       return;
//     }

//     sel.toggleOne(id);
//     props.onToggleOne(id);
//   }

//   function onEditClick(item: Offer) {
//     props.onOpen(item);
//   }

//   if (!props.items.length) {
//     return (
//       <section className="card">
//         <div className="card__empty">
//           {props.loading ? "Loading…" : "Keine Einträge."}
//         </div>
//       </section>
//     );
//   }

//   return (
//     <div className="news-table">
//       <div className="news-admin__top-actions">
//         <BulkActions
//           toggleRef={toggleBtnRef as RefObject<HTMLButtonElement | null>}
//           cancelRef={cancelBtnRef as RefObject<HTMLButtonElement | null>}
//           clearRef={clearBtnRef as RefObject<HTMLButtonElement | null>}
//           selectMode={props.selectMode}
//           onToggleSelectMode={onToggleSelectMode}
//           count={count}
//           isAllSelected={sel.isAllSelected}
//           busy={false}
//           isEmpty={props.items.length === 0}
//           onToggleAll={toggleAll}
//           onClear={clearSelection}
//           showClear={showClear}
//           onDelete={deleteSelected}
//         />
//       </div>

//       <div className="news-table__scroll">
//         <section className="card news-list">
//           <div className="news-list__table">
//             <div className="news-list__head" aria-hidden="true">
//               <div className="news-list__h">Coach</div>
//               <div className="news-list__h">Training</div>
//               <div className="news-list__h">Location</div>
//               <div className="news-list__h">Price</div>
//               <div className="news-list__h">Date</div>
//               <div className="news-list__h news-list__h--right">Action</div>
//             </div>

//             <ul className="list list--bleed">
//               {props.items.map((item) => {
//                 const id = idOf(item);
//                 const checked = sel.selected.has(id);
//                 const hideEdit = props.selectMode || checked;

//                 return (
//                   <li
//                     key={id}
//                     className={`list__item chip news-list__row is-fullhover is-interactive ${
//                       checked ? "is-selected" : ""
//                     } ${props.selectMode ? "is-selectmode" : ""}`}
//                     onClick={() => handleRowClick(item)}
//                     onKeyDown={(event) => {
//                       if (event.key !== "Enter" && event.key !== " ") return;
//                       event.preventDefault();
//                       handleRowClick(item);
//                     }}
//                     tabIndex={0}
//                     role="button"
//                     aria-pressed={props.selectMode ? checked : undefined}
//                     aria-label={
//                       props.selectMode
//                         ? `Select: ${courseTitle(item)}`
//                         : `Open: ${courseTitle(item)}`
//                     }
//                   >
//                     <div className="news-list__cell">
//                       <img
//                         src={props.avatarSrc(item) || "/assets/img/avatar.png"}
//                         alt={
//                           safeText(item.coachName)
//                             ? `Coach ${safeText(item.coachName)}`
//                             : "Coach"
//                         }
//                         className="list__avatar"
//                         onError={(event) => {
//                           event.currentTarget.src = "/assets/img/avatar.png";
//                         }}
//                       />
//                     </div>

//                     <div className="news-list__cell">
//                       <div className="news-list__title">
//                         {courseTitle(item)}
//                       </div>
//                       <div className="news-list__excerpt">
//                         {courseMeta(item)}
//                       </div>
//                     </div>

//                     <div className="news-list__cell">
//                       <div className="news-list__title">
//                         {safeText(item.location) || "—"}
//                       </div>
//                       <div className="news-list__excerpt is-empty">
//                         {"\u00A0"}
//                       </div>
//                     </div>

//                     <div className="news-list__cell">
//                       <div className="news-list__title">
//                         {formatPrice(item.price)}
//                       </div>
//                       <div className="news-list__excerpt is-empty">
//                         {"\u00A0"}
//                       </div>
//                     </div>

//                     <div className="news-list__cell">
//                       <div className="news-list__title">
//                         {formatDateDe(pickDate(item))}
//                       </div>
//                       <div className="news-list__excerpt is-empty">
//                         {"\u00A0"}
//                       </div>
//                     </div>

//                     {!hideEdit ? (
//                       <div
//                         className="news-list__cell news-list__cell--action"
//                         onClick={(event) => {
//                           event.stopPropagation();
//                           onEditClick(item);
//                         }}
//                         onMouseDown={(event) => event.stopPropagation()}
//                       >
//                         <span
//                           className="edit-trigger"
//                           role="button"
//                           tabIndex={0}
//                           aria-label="Edit"
//                         >
//                           <img
//                             src="/icons/edit.svg"
//                             alt=""
//                             aria-hidden="true"
//                             className="icon-img"
//                           />
//                         </span>
//                       </div>
//                     ) : (
//                       <div
//                         className="news-list__cell news-list__cell--action news-list__actions--hidden"
//                         aria-hidden="true"
//                       />
//                     )}
//                   </li>
//                 );
//               })}
//             </ul>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }

// "use client";

// import React from "react";
// import type { Offer } from "../types";

// type Props = {
//   loading: boolean;
//   items: Offer[];
//   selectedIds: string[];
//   selectMode: boolean;
//   onToggleOne: (id: string) => void;
//   onStartEdit: (o: Offer) => void;
//   onOpenEdit: (o: Offer) => void;
//   avatarSrc: (o: Offer) => string;
// };

// function safeText(v: unknown) {
//   return String(v ?? "").trim();
// }

// function titleParts(it: Offer) {
//   const rawTitle = safeText(it.title);
//   const hasDash = rawTitle.includes(" — ");
//   const parts = hasDash ? rawTitle.split(" — ") : [rawTitle, ""];
//   const title = safeText(parts[0] || it.type || "Offer");
//   const location = safeText(parts[1] || it.location);
//   return { title, location };
// }

// function detailsText(it: Offer) {
//   const timeRange =
//     safeText(it.timeFrom) && safeText(it.timeTo)
//       ? `${safeText(it.timeFrom)}–${safeText(it.timeTo)}`
//       : "";

//   return [safeText(it.category), safeText(it.sub_type), timeRange]
//     .filter(Boolean)
//     .join(" · ");
// }

// export default function TrainingResults({
//   loading,
//   items,
//   selectedIds,
//   selectMode,
//   onToggleOne,
//   onStartEdit,
//   onOpenEdit,
//   avatarSrc,
// }: Props) {
//   if (!items.length) {
//     return (
//       <section className="card">
//         <div className="card__empty">
//           {loading ? "Loading…" : "Keine Einträge."}
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
//               <div className="news-list__h">Bild</div>
//               <div className="news-list__h">Training</div>
//               <div className="news-list__h">Ort</div>
//               <div className="news-list__h">Details</div>
//               <div className="news-list__h news-list__h--right">Aktion</div>
//             </div>

//             <ul className="list list--bleed">
//               {items.map((it) => {
//                 const selected = selectedIds.includes(it._id);
//                 const hideEdit = selectMode || selected;
//                 const { title, location } = titleParts(it);
//                 const details = detailsText(it);

//                 return (
//                   <li
//                     key={it._id}
//                     className={`list__item chip news-list__row is-fullhover is-interactive ${
//                       selected ? "is-selected" : ""
//                     } ${selectMode ? "is-selectmode" : ""}`}
//                     onClick={() => {
//                       if (selectMode) onToggleOne(it._id);
//                       else onStartEdit(it);
//                     }}
//                     onKeyDown={(e) => {
//                       if (e.key !== "Enter" && e.key !== " ") return;
//                       e.preventDefault();
//                       if (selectMode) onToggleOne(it._id);
//                       else onStartEdit(it);
//                     }}
//                     tabIndex={0}
//                     role="button"
//                     aria-pressed={selectMode ? selected : undefined}
//                     aria-label={
//                       selectMode ? `Select: ${title}` : `Open: ${title}`
//                     }
//                   >
//                     <div className="news-list__cell">
//                       <img
//                         src={avatarSrc(it) || "/assets/img/avatar.png"}
//                         alt={
//                           it.coachName
//                             ? `Coach ${it.coachName}`
//                             : "Coach avatar"
//                         }
//                         className="list__avatar"
//                         onError={(e) => {
//                           e.currentTarget.src = "/assets/img/avatar.png";
//                         }}
//                       />
//                     </div>

//                     <div className="news-list__cell">
//                       <div className="news-list__title">{title || "—"}</div>
//                       <div className="news-list__excerpt">
//                         {safeText(it.coachName)
//                           ? `Coach: ${safeText(it.coachName)}`
//                           : "—"}
//                       </div>
//                     </div>

//                     <div className="news-list__cell">
//                       <div className="news-list__title">{location || "—"}</div>
//                       <div className="news-list__excerpt">
//                         {safeText(it.placeId) || "—"}
//                       </div>
//                     </div>

//                     <div className="news-list__cell">
//                       <div className="news-list__title">
//                         {typeof it.price === "number"
//                           ? `${it.price} €`
//                           : "Preis auf Anfrage"}
//                       </div>
//                       <div className="news-list__excerpt">{details || "—"}</div>
//                     </div>

//                     {!hideEdit ? (
//                       <div
//                         className="news-list__cell news-list__cell--action"
//                         onClick={(e) => e.stopPropagation()}
//                         onMouseDown={(e) => e.stopPropagation()}
//                       >
//                         <span
//                           className="edit-trigger"
//                           role="button"
//                           tabIndex={0}
//                           aria-label="Edit"
//                           onClick={() => onOpenEdit(it)}
//                           onKeyDown={(e) => {
//                             if (e.key !== "Enter" && e.key !== " ") return;
//                             e.preventDefault();
//                             onOpenEdit(it);
//                           }}
//                         >
//                           <img
//                             src="/icons/edit.svg"
//                             alt=""
//                             aria-hidden="true"
//                             className="icon-img"
//                           />
//                         </span>
//                       </div>
//                     ) : (
//                       <div
//                         className="news-list__cell news-list__cell--action news-list__actions--hidden"
//                         aria-hidden="true"
//                       />
//                     )}
//                   </li>
//                 );
//               })}
//             </ul>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }

// ("use client");

// import React from "react";
// import type { Offer } from "../types";

// type Props = {
//   loading: boolean;
//   items: Offer[];
//   selectedIds: string[];
//   selectMode: boolean;
//   onToggleOne: (id: string) => void;
//   onStartEdit: (o: Offer) => void;
//   onOpenEdit: (o: Offer) => void;
//   avatarSrc: (o: Offer) => string;
// };

// function safeText(v: unknown) {
//   return String(v ?? "").trim();
// }

// export default function TrainingResults(props: Props) {
//   const {
//     loading,
//     items,
//     selectedIds,
//     selectMode,
//     onToggleOne,
//     onStartEdit,
//     onOpenEdit,
//     avatarSrc,
//   } = props;

//   if (!items.length) {
//     return (
//       <section className="card">
//         <div className="card__empty">
//           {loading ? "Loading…" : "Keine Einträge."}
//         </div>
//       </section>
//     );
//   }

//   return (
//     <div className="news-table">
//       <div className="news-table__scroll">
//         <section className="card news-list">
//           <div className="news-list__table">
//             <div
//               className="news-list__head"
//               aria-hidden="true"
//               style={{
//                 gridTemplateColumns: "72px 1.7fr 1.1fr 1fr 56px",
//               }}
//             >
//               <div className="news-list__h">Bild</div>
//               <div className="news-list__h">Training</div>
//               <div className="news-list__h">Ort</div>
//               <div className="news-list__h">Details</div>
//               <div className="news-list__h news-list__h--right">Aktion</div>
//             </div>

//             <ul className="list list--bleed">
//               {items.map((it) => {
//                 const isSelected = selectedIds.includes(it._id);
//                 const hideEdit = selectMode || isSelected;

//                 const rawTitle = safeText(it.title);
//                 const hasDash = rawTitle.includes(" — ");
//                 const [left, right] = hasDash
//                   ? rawTitle.split(" — ")
//                   : [rawTitle, ""];
//                 const titleLine = safeText(left || it.type || "Offer");
//                 const metaLocation = safeText(right || it.location);

//                 return (
//                   <li
//                     key={it._id}
//                     className={`list__item chip news-list__row is-fullhover is-interactive ${
//                       isSelected ? "is-selected" : ""
//                     } ${selectMode ? "is-selectmode" : ""}`}
//                     onClick={() => {
//                       if (selectMode) onToggleOne(it._id);
//                       else onStartEdit(it);
//                     }}
//                     onKeyDown={(e) => {
//                       if (e.key !== "Enter" && e.key !== " ") return;
//                       e.preventDefault();
//                       if (selectMode) onToggleOne(it._id);
//                       else onStartEdit(it);
//                     }}
//                     tabIndex={0}
//                     role="button"
//                     aria-pressed={selectMode ? isSelected : undefined}
//                     aria-label={
//                       selectMode ? `Select: ${titleLine}` : `Open: ${titleLine}`
//                     }
//                     style={{
//                       gridTemplateColumns: "72px 1.7fr 1.1fr 1fr 56px",
//                     }}
//                   >
//                     <div className="news-list__cell">
//                       <img
//                         src={avatarSrc(it) || "/assets/img/avatar.png"}
//                         alt={
//                           it.coachName
//                             ? `Coach ${it.coachName}`
//                             : "Coach avatar"
//                         }
//                         className="list__avatar"
//                         onError={(e) => {
//                           e.currentTarget.src = "/assets/img/avatar.png";
//                         }}
//                       />
//                     </div>

//                     <div className="news-list__cell">
//                       <div className="news-list__title">{titleLine || "—"}</div>
//                       <div className="news-list__excerpt">
//                         {safeText(it.coachName)
//                           ? `Coach: ${safeText(it.coachName)}`
//                           : "—"}
//                       </div>
//                     </div>

//                     <div className="news-list__cell">
//                       <div className="news-list__title">
//                         {metaLocation || "—"}
//                       </div>
//                       <div className="news-list__excerpt">
//                         {safeText(it.placeId) || "—"}
//                       </div>
//                     </div>

//                     <div className="news-list__cell">
//                       <div className="news-list__title">
//                         {typeof it.price === "number"
//                           ? `${it.price} €`
//                           : "Preis auf Anfrage"}
//                       </div>
//                       <div className="news-list__excerpt">
//                         {[
//                           safeText(it.category),
//                           safeText(it.sub_type),
//                           safeText(it.timeFrom) && safeText(it.timeTo)
//                             ? `${safeText(it.timeFrom)}–${safeText(it.timeTo)}`
//                             : "",
//                         ]
//                           .filter(Boolean)
//                           .join(" · ") || "—"}
//                       </div>
//                     </div>

//                     {!hideEdit ? (
//                       <div
//                         className="news-list__cell news-list__cell--action"
//                         onClick={(e) => e.stopPropagation()}
//                         onMouseDown={(e) => e.stopPropagation()}
//                       >
//                         <span
//                           className="edit-trigger"
//                           role="button"
//                           tabIndex={0}
//                           aria-label="Edit"
//                           onClick={() => onOpenEdit(it)}
//                           onKeyDown={(e) => {
//                             if (e.key !== "Enter" && e.key !== " ") return;
//                             e.preventDefault();
//                             onOpenEdit(it);
//                           }}
//                         >
//                           <img
//                             src="/icons/edit.svg"
//                             alt=""
//                             aria-hidden="true"
//                             className="icon-img"
//                           />
//                         </span>
//                       </div>
//                     ) : (
//                       <div
//                         className="news-list__cell news-list__cell--action news-list__actions--hidden"
//                         aria-hidden="true"
//                       />
//                     )}
//                   </li>
//                 );
//               })}
//             </ul>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }
