// src/app/admin/franchise-locations/components/PendingLocationsList.tsx

"use client";

import React from "react";
import type { FranchiseLocation } from "../types";
import { buildDraftHint, hasReviewChange } from "./LocationsTableList.hints";

type Props = {
  items: FranchiseLocation[];
  loading?: boolean;
  showChangeInfo?: boolean;
  onApprove: (it: FranchiseLocation) => void;
  onReject: (it: FranchiseLocation) => void;
  onOpen: (it: FranchiseLocation) => void;
};

function pickFirst(...vals: any[]) {
  for (const v of vals) {
    const s = String(v ?? "").trim();
    if (s) return s;
  }
  return "";
}

function ownerLabel(it: FranchiseLocation) {
  const full =
    `${it.licenseeFirstName || ""} ${it.licenseeLastName || ""}`.trim();
  return pickFirst(
    full,
    it.ownerName,
    it.ownerEmail,
    it.ownerId,
    (it as any).owner,
    "—",
  );
}

function changeAtRaw(it: FranchiseLocation) {
  const x: any = it as any;
  return pickFirst(
    x.lastProviderEditAt,
    x.submittedAt,
    x.updatedAt,
    x.updated_at,
    x.modifiedAt,
    x.modified_at,
  );
}

function formatDateDe(raw: string) {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("de-DE");
}

function dateLabel(it: FranchiseLocation) {
  return hasReviewChange(it) ? "Date of change:" : "Date:";
}

function pendingStatus(it: FranchiseLocation) {
  return hasReviewChange(it) ? "Please review" : "Awaiting approval";
}

function hintText(it: FranchiseLocation, show?: boolean) {
  if (!show) return "";
  if (!hasReviewChange(it)) return "";
  return buildDraftHint(it);
}

function changeDate(it: FranchiseLocation, show?: boolean) {
  if (!show) return "";
  const raw = changeAtRaw(it);
  return raw ? formatDateDe(raw) : "";
}

function EmptyState() {
  return (
    <section className="card">
      <div className="card__empty">No new locations awaiting review.</div>
    </section>
  );
}

export default function PendingLocationsList(p: Props) {
  if (!p.items.length) return <EmptyState />;

  return (
    <section className="card">
      <div className="card__body pending-news">
        {p.items.map((it) => {
          const hint = hintText(it, p.showChangeInfo);
          const date = changeDate(it, p.showChangeInfo);
          const status = pendingStatus(it);

          return (
            <div key={String((it as any).id)} className="pending-news__row">
              <div className="pending-news__meta">
                <div className="pending-news__title">{ownerLabel(it)}</div>
                {hint ? <div className="pending-news__sub">{hint}</div> : null}
                {date ? (
                  <div className="pending-news__sub">
                    <span>{dateLabel(it)}</span>
                    <span>{date}</span>
                  </div>
                ) : null}
                <div className="pending-news__sub">
                  <span>
                    {it.country || "—"} • {it.city || "—"}
                  </span>
                  <span>•</span>
                  <span>
                    Status: <b>{status}</b>
                  </span>
                </div>
              </div>

              <div className="pending-news__actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => p.onOpen(it)}
                  disabled={p.loading}
                >
                  Open
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => p.onApprove(it)}
                  disabled={p.loading}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={() => p.onReject(it)}
                  disabled={p.loading}
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// // src/app/admin/franchise-locations/components/PendingLocationsList.tsx

// "use client";

// import React from "react";
// import type { FranchiseLocation } from "../types";
// import { buildDraftHint, hasReviewChange } from "./LocationsTableList.hints";

// type Props = {
//   items: FranchiseLocation[];
//   loading?: boolean;
//   showChangeInfo?: boolean;
//   onApprove: (it: FranchiseLocation) => void;
//   onReject: (it: FranchiseLocation) => void;
//   onOpen: (it: FranchiseLocation) => void;
// };

// function pickFirst(...vals: any[]) {
//   for (const v of vals) {
//     const s = String(v ?? "").trim();
//     if (s) return s;
//   }
//   return "";
// }

// function ownerLabel(it: FranchiseLocation) {
//   const full =
//     `${it.licenseeFirstName || ""} ${it.licenseeLastName || ""}`.trim();
//   return pickFirst(
//     full,
//     it.ownerName,
//     it.ownerEmail,
//     it.ownerId,
//     (it as any).owner,
//     "—",
//   );
// }

// function changeAtRaw(it: FranchiseLocation) {
//   const x: any = it as any;
//   return pickFirst(
//     x.lastProviderEditAt,
//     x.submittedAt,
//     x.updatedAt,
//     x.updated_at,
//     x.modifiedAt,
//     x.modified_at,
//   );
// }

// function formatDateDe(raw: string) {
//   const d = new Date(raw);
//   if (Number.isNaN(d.getTime())) return raw;
//   return d.toLocaleDateString("de-DE");
// }

// function dateLabel(it: FranchiseLocation) {
//   return hasReviewChange(it) ? "Datum der Änderung:" : "Datum:";
// }

// function pendingStatus(it: FranchiseLocation) {
//   return hasReviewChange(it) ? "Bitte prüfen" : "Wartet auf Freigabe";
// }

// function hintText(it: FranchiseLocation, show?: boolean) {
//   if (!show) return "";
//   if (!hasReviewChange(it)) return "";
//   return buildDraftHint(it);
// }

// function changeDate(it: FranchiseLocation, show?: boolean) {
//   if (!show) return "";
//   const raw = changeAtRaw(it);
//   return raw ? formatDateDe(raw) : "";
// }

// function EmptyState() {
//   return (
//     <section className="card">
//       <div className="card__empty">Keine neuen Standorte zur Prüfung.</div>
//     </section>
//   );
// }

// export default function PendingLocationsList(p: Props) {
//   if (!p.items.length) return <EmptyState />;

//   return (
//     <section className="card">
//       <div className="card__body pending-news">
//         {p.items.map((it) => {
//           const hint = hintText(it, p.showChangeInfo);
//           const date = changeDate(it, p.showChangeInfo);
//           const status = pendingStatus(it);

//           return (
//             <div key={String((it as any).id)} className="pending-news__row">
//               <div className="pending-news__meta">
//                 <div className="pending-news__title">{ownerLabel(it)}</div>
//                 {hint ? <div className="pending-news__sub">{hint}</div> : null}
//                 {date ? (
//                   <div className="pending-news__sub">
//                     <span>{dateLabel(it)}</span>
//                     <span>{date}</span>
//                   </div>
//                 ) : null}
//                 <div className="pending-news__sub">
//                   <span>
//                     {it.country || "—"} • {it.city || "—"}
//                   </span>
//                   <span>•</span>
//                   <span>
//                     Status: <b>{status}</b>
//                   </span>
//                 </div>
//               </div>

//               <div className="pending-news__actions">
//                 <button
//                   type="button"
//                   className="btn"
//                   onClick={() => p.onOpen(it)}
//                   disabled={p.loading}
//                 >
//                   Öffnen
//                 </button>
//                 <button
//                   type="button"
//                   className="btn"
//                   onClick={() => p.onApprove(it)}
//                   disabled={p.loading}
//                 >
//                   Freigeben
//                 </button>
//                 <button
//                   type="button"
//                   className="btn btn--danger"
//                   onClick={() => p.onReject(it)}
//                   disabled={p.loading}
//                 >
//                   Ablehnen
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </section>
//   );
// }
