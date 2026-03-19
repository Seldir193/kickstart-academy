// src/app/admin/(app)/coaches/components/PendingCoachesList.tsx
"use client";

import type { Coach } from "../types";
import {
  cleanStr,
  draftSummary,
  everApproved,
  fmtDateDE,
  fullName,
  getSlug,
  pendingReviewLabel,
  providerLabel,
} from "../utils";

type Props = {
  items: Coach[];
  onOpen: (c: Coach) => void;
  onApprove: (c: Coach) => void;
  onReject: (c: Coach) => void;
  busy: boolean;
  busySlug?: string | null;
};

function isFirstReviewText(s: string) {
  return cleanStr(s).toLowerCase() === "erstprüfung";
}

function changeText(c: Coach) {
  const s = cleanStr(draftSummary(c));
  return s && !isFirstReviewText(s) ? s : "";
}

function changeDate(c: Coach) {
  const iso = cleanStr(
    (c as any).draftUpdatedAt || (c as any).lastChangeAt || "",
  );
  return iso ? fmtDateDE(iso) : "";
}

function dateLine(c: Coach, date: string) {
  if (!date) return "";
  if (!everApproved(c)) return `Datum: ${date}`;
  return `Datum der Änderung: ${date}`;
}

function isRowBusy(
  busy: boolean,
  busySlug: string | null | undefined,
  c: Coach,
) {
  if (!busy) return false;
  return cleanStr(busySlug) === cleanStr(getSlug(c));
}

function EmptyState() {
  return (
    <section className="card">
      <div className="card__empty">Keine neuen Coaches zur Prüfung.</div>
    </section>
  );
}

function ActionBtn(p: {
  label: string;
  danger?: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={p.danger ? "btn btn--danger" : "btn"}
      aria-disabled={p.disabled}
      onClick={p.onClick}
    >
      {p.label}
    </button>
  );
}

function RowActions(p: {
  c: Coach;
  disabled: boolean;
  onOpen: (c: Coach) => void;
  onApprove: (c: Coach) => void;
  onReject: (c: Coach) => void;
}) {
  const { c, disabled, onOpen, onApprove, onReject } = p;

  return (
    <div className="pending-coaches__actions">
      <ActionBtn
        label="Öffnen"
        disabled={disabled}
        onClick={() => (disabled ? null : onOpen(c))}
      />
      <ActionBtn
        label="Freigeben"
        disabled={disabled}
        onClick={() => (disabled ? null : onApprove(c))}
      />
      <ActionBtn
        label="Ablehnen"
        danger
        disabled={disabled}
        onClick={() => (disabled ? null : onReject(c))}
      />
    </div>
  );
}

function StatusLine({ c }: { c: Coach }) {
  return (
    <div className="pending-coaches__sub">
      <span>Von: {providerLabel(c)}</span>
      <span className="pending-coaches__sep">•</span>
      <span>
        Status: <b>{pendingReviewLabel(c)}</b>
      </span>
    </div>
  );
}

function RowMeta({ c }: { c: Coach }) {
  const text = changeText(c);
  const date = changeDate(c);
  const line = dateLine(c, date);

  return (
    <div className="pending-coaches__meta">
      <div className="pending-coaches__title">{fullName(c)}</div>
      <StatusLine c={c} />
      {text ? <div className="pending-coaches__sub">{text}</div> : null}
      {line ? <div className="pending-coaches__sub">{line}</div> : null}
    </div>
  );
}

export default function PendingCoachesList({
  items,
  onOpen,
  onApprove,
  onReject,
  busy,
  busySlug,
}: Props) {
  if (!items.length) return <EmptyState />;

  return (
    <section className="card">
      <div className="card__body pending-coaches">
        {items.map((c) => {
          const slug = cleanStr(getSlug(c));
          const rowBusy = isRowBusy(busy, busySlug, c);

          return (
            <div key={slug} className="pending-coaches__row">
              <RowMeta c={c} />
              <RowActions
                c={c}
                disabled={rowBusy}
                onOpen={onOpen}
                onApprove={onApprove}
                onReject={onReject}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

// // src/app/admin/(app)/coaches/components/PendingCoachesList.tsx
// "use client";

// import type { Coach } from "../types";
// import {
//   cleanStr,
//   draftSummary,
//   everApproved,
//   fmtDateDE,
//   fullName,
//   getSlug,
//   pendingReviewLabel,
//   providerLabel,
// } from "../utils";

// type Props = {
//   items: Coach[];
//   onOpen: (c: Coach) => void;
//   onApprove: (c: Coach) => void;
//   onReject: (c: Coach) => void;
//   busy: boolean;
//   busySlug?: string | null;
// };

// function cleanLower(v: unknown) {
//   return cleanStr(v).toLowerCase();
// }

// function isFirstReviewText(s: string) {
//   return cleanLower(s) === "erstprüfung";
// }

// function changeText(c: Coach) {
//   const s = cleanStr(draftSummary(c));
//   return s && !isFirstReviewText(s) ? s : "";
// }

// function changeDate(c: Coach) {
//   const iso = cleanStr(
//     (c as any).draftUpdatedAt || (c as any).lastChangeAt || "",
//   );
//   return iso ? fmtDateDE(iso) : "";
// }

// function changeMeta(c: Coach) {
//   const text = changeText(c);
//   const date = changeDate(c);
//   const show = everApproved(c) && (Boolean(text) || Boolean(date));
//   return { text, date, show };
// }

// function dateLine(text: string, date: string) {
//   if (!date) return "";
//   return text ? `Datum der Änderung: ${date}` : `Änderung ${date}`;
// }

// function isRowBusy(
//   busy: boolean,
//   busySlug: string | null | undefined,
//   c: Coach,
// ) {
//   if (!busy) return false;
//   return cleanStr(busySlug) === cleanStr(getSlug(c));
// }

// function EmptyState() {
//   return (
//     <section className="card">
//       <div className="card__empty">Keine neuen Coaches zur Prüfung.</div>
//     </section>
//   );
// }

// function ActionBtn(p: {
//   label: string;
//   danger?: boolean;
//   disabled: boolean;
//   onClick: () => void;
// }) {
//   return (
//     <button
//       type="button"
//       className={p.danger ? "btn btn--danger" : "btn"}
//       aria-disabled={p.disabled}
//       onClick={p.onClick}
//     >
//       {p.label}
//     </button>
//   );
// }

// function RowActions(p: {
//   c: Coach;
//   disabled: boolean;
//   onOpen: (c: Coach) => void;
//   onApprove: (c: Coach) => void;
//   onReject: (c: Coach) => void;
// }) {
//   const { c, disabled, onOpen, onApprove, onReject } = p;
//   return (
//     <div className="pending-coaches__actions">
//       <ActionBtn
//         label="Öffnen"
//         disabled={disabled}
//         onClick={() => (disabled ? null : onOpen(c))}
//       />
//       <ActionBtn
//         label="Freigeben"
//         disabled={disabled}
//         onClick={() => (disabled ? null : onApprove(c))}
//       />
//       <ActionBtn
//         label="Ablehnen"
//         danger
//         disabled={disabled}
//         onClick={() => (disabled ? null : onReject(c))}
//       />
//     </div>
//   );
// }

// function StatusLine({ c }: { c: Coach }) {
//   return (
//     <div className="pending-coaches__sub">
//       <span>Von: {providerLabel(c)}</span>
//       <span className="pending-coaches__sep">•</span>
//       <span>
//         Status: <b>{pendingReviewLabel(c)}</b>
//       </span>
//     </div>
//   );
// }

// function RowMeta({ c }: { c: Coach }) {
//   const { text, date, show } = changeMeta(c);
//   const line = show ? dateLine(text, date) : "";
//   return (
//     <div className="pending-coaches__meta">
//       <div className="pending-coaches__title">{fullName(c)}</div>
//       <StatusLine c={c} />
//       {show && text ? <div className="pending-coaches__sub">{text}</div> : null}
//       {line ? <div className="pending-coaches__sub">{line}</div> : null}
//     </div>
//   );
// }

// export default function PendingCoachesList({
//   items,
//   onOpen,
//   onApprove,
//   onReject,
//   busy,
//   busySlug,
// }: Props) {
//   if (!items.length) return <EmptyState />;

//   return (
//     <section className="card">
//       <div className="card__body pending-coaches">
//         {items.map((c) => {
//           const slug = cleanStr(getSlug(c));
//           const rowBusy = isRowBusy(busy, busySlug, c);
//           return (
//             <div key={slug} className="pending-coaches__row">
//               <RowMeta c={c} />
//               <RowActions
//                 c={c}
//                 disabled={rowBusy}
//                 onOpen={onOpen}
//                 onApprove={onApprove}
//                 onReject={onReject}
//               />
//             </div>
//           );
//         })}
//       </div>
//     </section>
//   );
// }

// // src/app/admin/(app)/coaches/components/PendingCoachesList.tsx
// "use client";

// import type { Coach } from "../types";
// import {
//   cleanStr,
//   draftSummary,
//   everApproved,
//   fmtDateDE,
//   fullName,
//   getSlug,
//   pendingReviewLabel,
//   providerLabel,
// } from "../utils";

// type Props = {
//   items: Coach[];
//   onOpen: (c: Coach) => void;
//   onApprove: (c: Coach) => void;
//   onReject: (c: Coach) => void;
//   busy: boolean;
//   busySlug?: string | null;
// };

// function changeText(c: Coach) {
//   const s = cleanStr(draftSummary(c));
//   if (!s) return "";
//   if (s.toLowerCase() === "erstprüfung") return "";
//   return s;
// }

// function changeDate(c: Coach) {
//   const iso = cleanStr(
//     (c as any).draftUpdatedAt || (c as any).lastChangeAt || "",
//   );
//   return iso ? fmtDateDE(iso) : "";
// }

// function isRowBusy(
//   busy: boolean,
//   busySlug: string | null | undefined,
//   c: Coach,
// ) {
//   if (!busy) return false;
//   const slug = cleanStr(getSlug(c));
//   return slug && cleanStr(busySlug) === slug;
// }

// function changeMeta(c: Coach) {
//   const text = changeText(c);
//   const date = changeDate(c);
//   const show = everApproved(c) && (Boolean(text) || Boolean(date));
//   return { text, date, show };
// }

// function EmptyState() {
//   return (
//     <section className="card">
//       <div className="card__empty">Keine neuen Coaches zur Prüfung.</div>
//     </section>
//   );
// }

// function RowActions(args: {
//   c: Coach;
//   rowBusy: boolean;
//   onOpen: (c: Coach) => void;
//   onApprove: (c: Coach) => void;
//   onReject: (c: Coach) => void;
// }) {
//   const { c, rowBusy, onOpen, onApprove, onReject } = args;

//   return (
//     <div className="pending-coaches__actions">
//       <button
//         type="button"
//         className="btn"
//         aria-disabled={rowBusy}
//         onClick={() => {
//           if (rowBusy) return;
//           onOpen(c);
//         }}
//       >
//         Öffnen
//       </button>

//       <button
//         type="button"
//         className="btn"
//         aria-disabled={rowBusy}
//         onClick={() => {
//           if (rowBusy) return;
//           onApprove(c);
//         }}
//       >
//         Freigeben
//       </button>

//       <button
//         type="button"
//         className="btn btn--danger"
//         aria-disabled={rowBusy}
//         onClick={() => {
//           if (rowBusy) return;
//           onReject(c);
//         }}
//       >
//         Ablehnen
//       </button>
//     </div>
//   );
// }

// // function RowActions(args: {
// //   c: Coach;
// //   rowBusy: boolean;
// //   onOpen: (c: Coach) => void;
// //   onApprove: (c: Coach) => void;
// //   onReject: (c: Coach) => void;
// // }) {
// //   const { c, rowBusy, onOpen, onApprove, onReject } = args;

// //   return (
// //     <div className="pending-coaches__actions">
// //       <button type="button" className="btn" onClick={() => onOpen(c)}>
// //         Öffnen
// //       </button>

// //       <button
// //         type="button"
// //         className="btn"
// //         onClick={() => onApprove(c)}
// //         disabled={rowBusy}
// //       >
// //         Freigeben
// //       </button>

// //       <button
// //         type="button"
// //         className="btn btn--danger"
// //         onClick={() => onReject(c)}
// //         disabled={rowBusy}
// //       >
// //         Ablehnen
// //       </button>
// //     </div>
// //   );
// // }

// function RowMeta({ c }: { c: Coach }) {
//   const { text, date, show } = changeMeta(c);

//   return (
//     <div className="pending-coaches__meta">
//       <div className="pending-coaches__title">{fullName(c)}</div>

//       <div className="pending-coaches__sub">
//         <span>Von: {providerLabel(c)}</span>
//         <span className="pending-coaches__sep">•</span>
//         <span>
//           Status: <b>{pendingReviewLabel(c)}</b>
//         </span>
//       </div>

//       {show && text ? <div className="pending-coaches__sub">{text}</div> : null}
//       {show && date ? (
//         <div className="pending-coaches__sub">Änderung: {date}</div>
//       ) : null}
//     </div>
//   );
// }

// export default function PendingCoachesList({
//   items,
//   onOpen,
//   onApprove,
//   onReject,
//   busy,
//   busySlug,
// }: Props) {
//   if (!items.length) return <EmptyState />;

//   return (
//     <section className="card">
//       <div className="card__body pending-coaches">
//         {items.map((c) => {
//           const slug = cleanStr(getSlug(c));
//           //const rowBusy = isRowBusy(busy, busySlug, c);
//           const rowBusy = !!busy && cleanStr(busySlug) === slug;

//           return (
//             <div key={slug} className="pending-coaches__row">
//               <RowMeta c={c} />
//               <RowActions
//                 c={c}
//                 rowBusy={rowBusy}
//                 onOpen={onOpen}
//                 onApprove={onApprove}
//                 onReject={onReject}
//               />
//             </div>
//           );
//         })}
//       </div>
//     </section>
//   );
// }
