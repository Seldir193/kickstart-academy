// src/app/admin/(app)/coaches/components/PendingCoachesList.tsx
"use client";

import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
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

type Translate = TFunction;
type Props = {
  items: Coach[];
  onOpen: (c: Coach) => void;
  onApprove: (c: Coach) => void;
  onReject: (c: Coach) => void;
  busy: boolean;
  busySlug?: string | null;
};

function isFirstReviewText(s: string, t: Translate) {
  const value = cleanStr(s).toLowerCase();
  const localized = cleanStr(
    t("common.admin.coaches.pending.firstReview"),
  ).toLowerCase();

  return value === "first review" || value === localized;
}
function changeText(c: Coach, t: Translate) {
  const s = cleanStr(draftSummary(c));
  return s && !isFirstReviewText(s, t) ? s : "";
}
function changeDate(c: Coach, lang?: string) {
  const iso = cleanStr(
    (c as any).draftUpdatedAt || (c as any).lastChangeAt || "",
  );
  return iso ? fmtDateDE(iso, lang) : "";
}

function dateLine(c: Coach, date: string, t: Translate) {
  if (!date) return "";
  if (!everApproved(c))
    return `${t("common.admin.coaches.pending.date")}: ${date}`;
  return `${t("common.admin.coaches.pending.dateOfChange")}: ${date}`;
}

function isRowBusy(
  busy: boolean,
  busySlug: string | null | undefined,
  c: Coach,
) {
  if (!busy) return false;
  return cleanStr(busySlug) === cleanStr(getSlug(c));
}

function EmptyState({ text }: { text: string }) {
  return (
    <section className="card">
      <div className="card__empty">{text}</div>
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
  t: Translate;
}) {
  const { c, disabled, onOpen, onApprove, onReject, t } = p;

  return (
    <div className="pending-coaches__actions">
      <ActionBtn
        label={t("common.admin.coaches.pending.open")}
        disabled={disabled}
        onClick={() => (disabled ? null : onOpen(c))}
      />
      <ActionBtn
        label={t("common.admin.coaches.pending.approve")}
        disabled={disabled}
        onClick={() => (disabled ? null : onApprove(c))}
      />
      <ActionBtn
        label={t("common.admin.coaches.pending.reject")}
        danger
        disabled={disabled}
        onClick={() => (disabled ? null : onReject(c))}
      />
    </div>
  );
}

function StatusLine(p: { c: Coach; t: Translate }) {
  const { c, t } = p;

  return (
    <div className="pending-coaches__sub">
      <span>
        {t("common.admin.coaches.pending.by")}: {providerLabel(c)}
      </span>
      <span className="pending-coaches__sep">•</span>
      <span>
        {t("common.admin.coaches.pending.status")}:{" "}
        <b>{pendingReviewLabel(c, t)}</b>
      </span>
    </div>
  );
}

function RowMeta(p: { c: Coach; t: Translate; lang?: string }) {
  const { c, t, lang } = p;
  const text = changeText(c, t);
  const date = changeDate(c, lang);
  const line = dateLine(c, date, t);

  return (
    <div className="pending-coaches__meta">
      <div className="pending-coaches__title">{fullName(c)}</div>
      <StatusLine c={c} t={t} />
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
  const { t, i18n } = useTranslation();
  if (!items.length)
    return <EmptyState text={t("common.admin.coaches.pending.empty")} />;

  return (
    <section className="card">
      <div className="card__body pending-coaches">
        {items.map((c) => {
          const slug = cleanStr(getSlug(c));
          const rowBusy = isRowBusy(busy, busySlug, c);

          return (
            <div key={slug} className="pending-coaches__row">
              <RowMeta c={c} t={t} lang={i18n.language} />
              <RowActions
                c={c}
                disabled={rowBusy}
                onOpen={onOpen}
                onApprove={onApprove}
                onReject={onReject}
                t={t}
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

// function isFirstReviewText(s: string) {
//   return cleanStr(s).toLowerCase() === "erstprüfung";
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

// function dateLine(c: Coach, date: string) {
//   if (!date) return "";
//   if (!everApproved(c)) return `Datum: ${date}`;
//   return `Datum der Änderung: ${date}`;
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
//   const text = changeText(c);
//   const date = changeDate(c);
//   const line = dateLine(c, date);

//   return (
//     <div className="pending-coaches__meta">
//       <div className="pending-coaches__title">{fullName(c)}</div>
//       <StatusLine c={c} />
//       {text ? <div className="pending-coaches__sub">{text}</div> : null}
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
