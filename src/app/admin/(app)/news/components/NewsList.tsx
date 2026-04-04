"use client";

import type { News } from "../types";
import { toDisplayDate } from "../news";

type ProviderInfo = { id: string; fullName: string; email: string } | null;

type NewsWithProvider = News & {
  provider?: ProviderInfo;
  providerId?: string;
};

type Props = {
  items: NewsWithProvider[];
  selected: Set<string>;
  isSelectMode: boolean;
  onOpen: (n: News) => void;
  onToggle: (id: string) => void;
};

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function getId(n: NewsWithProvider) {
  return clean(n._id);
}

function isRejected(n: NewsWithProvider) {
  return n.status === "rejected" || clean(n.rejectionReason).length > 0;
}

function isApproved(n: NewsWithProvider) {
  return n.status === "approved" || n.published === true;
}

function statusLabel(n: NewsWithProvider) {
  if (isApproved(n)) return "Approved";
  if (isRejected(n)) return "Rejected";
  return "To review";
}

function statusClass(n: NewsWithProvider) {
  if (isApproved(n)) return "is-on";
  if (isRejected(n)) return "is-rejected";
  return "is-off";
}

function providerLabel(n: NewsWithProvider) {
  const p = n.provider;
  const name = clean(p?.fullName);
  if (name) return name;
  const mail = clean(p?.email);
  if (mail) return mail;
  const pid = clean(n.providerId);
  return pid || "";
}

export default function NewsList({
  items,
  selected,
  isSelectMode,
  onOpen,
  onToggle,
}: Props) {
  if (!items.length) {
    return (
      <section className="card">
        <div className="card__empty">No entries.</div>
      </section>
    );
  }

  return (
    <section className="card news-list">
      <div className="news-list__table">
        <div className="news-list__head" aria-hidden="true">
          <div className="news-list__h news-list__h--title">Title</div>
          <div className="news-list__h news-list__h--cat">Category</div>
          <div className="news-list__h news-list__h--date">Date</div>
          <div className="news-list__h news-list__h--status">Status</div>
          <div className="news-list__h news-list__h--author">Author</div>
          <div className="news-list__h news-list__h--action">Action</div>
        </div>

        <ul className="list list--bleed">
          {items.map((n) => {
            const id = getId(n);
            const checked = selected.has(id);
            const author = providerLabel(n);
            const rejected = isRejected(n);
            const hideAction = isSelectMode || checked;

            function handleRowClick() {
              if (!id) return;
              if (isSelectMode) onToggle(id);
              else onOpen(n);
            }

            function openFromAction(e: React.MouseEvent) {
              e.stopPropagation();
              onOpen(n);
            }

            function openFromActionKey(e: React.KeyboardEvent) {
              if (e.key !== "Enter" && e.key !== " ") return;
              e.preventDefault();
              e.stopPropagation();
              onOpen(n);
            }

            return (
              <li
                key={id}
                className={`list__item chip is-fullhover is-interactive news-list__row ${
                  checked ? "is-selected" : ""
                } ${isSelectMode ? "is-selectmode" : ""}`}
                onClick={handleRowClick}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleRowClick();
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isSelectMode ? checked : undefined}
                aria-label={
                  isSelectMode ? `Select: ${n.title}` : `Open: ${n.title}`
                }
              >
                <div className="news-list__cell news-list__cell--title">
                  <div className="news-list__title">
                    {clean(n.title) || "—"}
                  </div>
                  <div
                    className={`news-list__excerpt ${
                      clean(n.excerpt) ? "" : "is-empty"
                    }`}
                  >
                    {clean(n.excerpt) || "—"}
                  </div>
                </div>

                <div className="news-list__cell news-list__cell--cat">
                  <span className="news-list__pill">
                    {clean(n.category) || "News"}
                  </span>
                </div>

                <div className="news-list__cell news-list__cell--date">
                  {toDisplayDate(n.date)}
                </div>

                <div className="news-list__cell news-list__cell--status">
                  <span className={`news-list__status ${statusClass(n)}`}>
                    {statusLabel(n)}
                  </span>
                </div>

                <div className="news-list__cell news-list__cell--author">
                  {author || <span className="news-list__muted">–</span>}
                </div>

                {!hideAction ? (
                  <div
                    className="list__actions news-list__cell news-list__cell--action"
                    onClick={openFromAction}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <span
                      className="edit-trigger"
                      role="button"
                      tabIndex={0}
                      aria-label={
                        rejected
                          ? `Info: ${clean(n.title) || "News"}`
                          : `Edit: ${clean(n.title) || "News"}`
                      }
                      onClick={openFromAction}
                      onKeyDown={openFromActionKey}
                    >
                      <img
                        src={rejected ? "/icons/info.svg" : "/icons/edit.svg"}
                        alt=""
                        aria-hidden="true"
                        className="icon-img"
                      />
                    </span>
                  </div>
                ) : (
                  <div
                    className="list__actions news-list__cell news-list__cell--action news-list__actions--hidden"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

// "use client";

// import type { News } from "../types";
// import { toDisplayDate } from "../news";

// type ProviderInfo = { id: string; fullName: string; email: string } | null;

// type NewsWithProvider = News & {
//   provider?: ProviderInfo;
//   providerId?: string;
// };

// type Props = {
//   items: NewsWithProvider[];
//   selected: Set<string>;
//   isSelectMode: boolean;
//   onOpen: (n: News) => void;
//   onToggle: (id: string) => void;
// };

// function clean(v: unknown) {
//   return String(v ?? "").trim();
// }

// function getId(n: NewsWithProvider) {
//   return clean(n._id);
// }

// function isRejected(n: NewsWithProvider) {
//   return n.status === "rejected" || clean(n.rejectionReason).length > 0;
// }

// function isApproved(n: NewsWithProvider) {
//   return n.status === "approved" || n.published === true;
// }

// function statusLabel(n: NewsWithProvider) {
//   if (isApproved(n)) return "Freigegeben";
//   if (isRejected(n)) return "Abgelehnt";
//   return "Zu prüfen";
// }

// function statusClass(n: NewsWithProvider) {
//   if (isApproved(n)) return "is-on";
//   if (isRejected(n)) return "is-rejected";
//   return "is-off";
// }

// function providerLabel(n: NewsWithProvider) {
//   const p = n.provider;
//   const name = clean(p?.fullName);
//   if (name) return name;
//   const mail = clean(p?.email);
//   if (mail) return mail;
//   const pid = clean(n.providerId);
//   return pid || "";
// }

// export default function NewsList({
//   items,
//   selected,
//   isSelectMode,
//   onOpen,
//   onToggle,
// }: Props) {
//   if (!items.length) {
//     return (
//       <section className="card">
//         <div className="card__empty">Keine Einträge.</div>
//       </section>
//     );
//   }

//   return (
//     <section className="card news-list">
//       <div className="news-list__table">
//         <div className="news-list__head" aria-hidden="true">
//           <div className="news-list__h news-list__h--title">Titel</div>
//           <div className="news-list__h news-list__h--cat">Kategorie</div>
//           <div className="news-list__h news-list__h--date">Datum</div>
//           <div className="news-list__h news-list__h--status">Status</div>
//           <div className="news-list__h news-list__h--author">Autor</div>
//           <div className="news-list__h news-list__h--action">Aktion</div>
//         </div>

//         <ul className="list list--bleed">
//           {items.map((n) => {
//             const id = getId(n);
//             const checked = selected.has(id);
//             const author = providerLabel(n);
//             const rejected = isRejected(n);
//             const hideAction = isSelectMode || checked;

//             function handleRowClick() {
//               if (!id) return;
//               if (isSelectMode) onToggle(id);
//               else onOpen(n);
//             }

//             function openFromAction(e: React.MouseEvent) {
//               e.stopPropagation();
//               onOpen(n);
//             }

//             function openFromActionKey(e: React.KeyboardEvent) {
//               if (e.key !== "Enter" && e.key !== " ") return;
//               e.preventDefault();
//               e.stopPropagation();
//               onOpen(n);
//             }

//             return (
//               <li
//                 key={id}
//                 className={`list__item chip is-fullhover is-interactive news-list__row ${
//                   checked ? "is-selected" : ""
//                 } ${isSelectMode ? "is-selectmode" : ""}`}
//                 onClick={handleRowClick}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" || e.key === " ") {
//                     e.preventDefault();
//                     handleRowClick();
//                   }
//                 }}
//                 tabIndex={0}
//                 role="button"
//                 aria-pressed={isSelectMode ? checked : undefined}
//                 aria-label={
//                   isSelectMode ? `Auswählen: ${n.title}` : `Öffnen: ${n.title}`
//                 }
//               >
//                 <div className="news-list__cell news-list__cell--title">
//                   <div className="news-list__title">
//                     {clean(n.title) || "—"}
//                   </div>
//                   <div
//                     className={`news-list__excerpt ${
//                       clean(n.excerpt) ? "" : "is-empty"
//                     }`}
//                   >
//                     {clean(n.excerpt) || "—"}
//                   </div>
//                 </div>

//                 <div className="news-list__cell news-list__cell--cat">
//                   <span className="news-list__pill">
//                     {clean(n.category) || "News"}
//                   </span>
//                 </div>

//                 <div className="news-list__cell news-list__cell--date">
//                   {toDisplayDate(n.date)}
//                 </div>

//                 <div className="news-list__cell news-list__cell--status">
//                   <span className={`news-list__status ${statusClass(n)}`}>
//                     {statusLabel(n)}
//                   </span>
//                 </div>

//                 <div className="news-list__cell news-list__cell--author">
//                   {author || <span className="news-list__muted">–</span>}
//                 </div>

//                 {!hideAction ? (
//                   <div
//                     className="list__actions news-list__cell news-list__cell--action"
//                     onClick={openFromAction}
//                     onMouseDown={(e) => e.stopPropagation()}
//                   >
//                     <span
//                       className="edit-trigger"
//                       role="button"
//                       tabIndex={0}
//                       aria-label={
//                         rejected
//                           ? `Info: ${clean(n.title) || "News"}`
//                           : `Edit: ${clean(n.title) || "News"}`
//                       }
//                       onClick={openFromAction}
//                       onKeyDown={openFromActionKey}
//                     >
//                       <img
//                         src={rejected ? "/icons/info.svg" : "/icons/edit.svg"}
//                         alt=""
//                         aria-hidden="true"
//                         className="icon-img"
//                       />
//                     </span>
//                   </div>
//                 ) : (
//                   <div
//                     className="list__actions news-list__cell news-list__cell--action news-list__actions--hidden"
//                     aria-hidden="true"
//                   />
//                 )}
//               </li>
//             );
//           })}
//         </ul>
//       </div>
//     </section>
//   );
// }

// //src\app\admin\(app)\news\components\NewsList.tsx
// "use client";

// import type { News } from "../types";
// import { toDisplayDate } from "../news";

// type ProviderInfo = { id?: string; fullName?: string; email?: string } | null;

// type NewsWithProvider = News & {
//   provider?: ProviderInfo;
//   providerId?: any;
// };

// type Props = {
//   items: NewsWithProvider[];
//   selected: Set<string>;
//   isSelectMode: boolean;
//   onOpen: (n: News) => void;
//   onToggle: (id: string) => void;
// };

// function clean(v: unknown) {
//   return String(v ?? "").trim();
// }

// function getId(n: News) {
//   return clean(n._id);
// }

// function isRejected(n: any) {
//   return !n?.published && clean(n?.rejectionReason).length > 0;
// }

// function statusLabel(n: any) {
//   if (n?.published) return "Freigegeben";
//   if (isRejected(n)) return "Abgelehnt";
//   return "Wartet";
// }

// function statusClass(n: any) {
//   if (n?.published) return "is-on";
//   if (isRejected(n)) return "is-rejected";
//   return "is-off";
// }

// function providerLabel(n: NewsWithProvider) {
//   const p = n?.provider;
//   const name = clean(p?.fullName);
//   if (name) return name;
//   const mail = clean(p?.email);
//   if (mail) return mail;
//   const pid = clean((n as any)?.providerId);
//   return pid || "";
// }

// export default function NewsList({
//   items,
//   selected,
//   isSelectMode,
//   onOpen,
//   onToggle,
// }: Props) {
//   if (!items.length) {
//     return (
//       <section className="card">
//         <div className="card__empty">Keine Einträge.</div>
//       </section>
//     );
//   }

//   return (
//     <section className="card news-list">
//       <div className="news-list__table">
//         <div className="news-list__head" aria-hidden="true">
//           <div className="news-list__h news-list__h--title">Titel</div>
//           <div className="news-list__h news-list__h--cat">Kategorie</div>
//           <div className="news-list__h news-list__h--date">Datum</div>
//           <div className="news-list__h news-list__h--status">Status</div>
//           <div className="news-list__h news-list__h--author">Autor</div>
//           <div className="news-list__h news-list__h--action">Aktion</div>
//         </div>

//         <ul className="list list--bleed">
//           {items.map((n) => {
//             const id = getId(n);
//             const checked = selected.has(id);
//             const author = providerLabel(n);
//             const rejected = isRejected(n);
//             const hideAction = isSelectMode || checked;

//             function handleRowClick() {
//               if (!id) return;
//               if (isSelectMode) onToggle(id);
//               else onOpen(n);
//             }

//             function openFromAction(e: React.MouseEvent) {
//               e.stopPropagation();
//               onOpen(n);
//             }

//             function openFromActionKey(e: React.KeyboardEvent) {
//               if (e.key !== "Enter" && e.key !== " ") return;
//               e.preventDefault();
//               e.stopPropagation();
//               onOpen(n);
//             }

//             return (
//               <li
//                 key={id}
//                 className={`list__item chip is-fullhover is-interactive news-list__row ${
//                   checked ? "is-selected" : ""
//                 } ${isSelectMode ? "is-selectmode" : ""}`}
//                 onClick={handleRowClick}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" || e.key === " ") {
//                     e.preventDefault();
//                     handleRowClick();
//                   }
//                 }}
//                 tabIndex={0}
//                 role="button"
//                 aria-pressed={isSelectMode ? checked : undefined}
//                 aria-label={
//                   isSelectMode ? `Auswählen: ${n.title}` : `Öffnen: ${n.title}`
//                 }
//               >
//                 <div className="news-list__cell news-list__cell--title">
//                   <div className="news-list__title">
//                     {clean(n.title) || "—"}
//                   </div>
//                   <div
//                     className={`news-list__excerpt ${clean(n.excerpt) ? "" : "is-empty"}`}
//                   >
//                     {clean(n.excerpt) || "—"}
//                   </div>
//                 </div>

//                 <div className="news-list__cell news-list__cell--cat">
//                   <span className="news-list__pill">
//                     {clean(n.category) || "News"}
//                   </span>
//                 </div>

//                 <div className="news-list__cell news-list__cell--date">
//                   {toDisplayDate((n as any).date)}
//                 </div>

//                 <div className="news-list__cell news-list__cell--status">
//                   <span className={`news-list__status ${statusClass(n)}`}>
//                     {statusLabel(n)}
//                   </span>
//                 </div>

//                 <div className="news-list__cell news-list__cell--author">
//                   {author || <span className="news-list__muted">–</span>}
//                 </div>

//                 {!hideAction ? (
//                   <div
//                     className="list__actions news-list__cell news-list__cell--action"
//                     onClick={openFromAction}
//                     onMouseDown={(e) => e.stopPropagation()}
//                   >
//                     <span
//                       className="edit-trigger"
//                       role="button"
//                       tabIndex={0}
//                       aria-label={
//                         rejected
//                           ? `Info: ${clean(n.title) || "News"}`
//                           : `Bearbeiten: ${clean(n.title) || "News"}`
//                       }
//                       onClick={openFromAction}
//                       onKeyDown={openFromActionKey}
//                     >
//                       <img
//                         src={rejected ? "/icons/info.svg" : "/icons/edit.svg"}
//                         alt=""
//                         aria-hidden="true"
//                         className="icon-img"
//                       />
//                     </span>
//                   </div>
//                 ) : (
//                   <div
//                     className="list__actions news-list__cell news-list__cell--action news-list__actions--hidden"
//                     aria-hidden="true"
//                   />
//                 )}
//               </li>
//             );
//           })}
//         </ul>
//       </div>
//     </section>
//   );
// }
