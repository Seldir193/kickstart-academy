// src/app/admin/news/components/RejectedNewsList.tsx
"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import type { News } from "../types";
import {
  blurTarget,
  canSubmitForReview,
  onActionKey,
  stop,
} from "./NewsTableList.helpers";

type Props = {
  items: (News & {
    provider?: { id?: string; fullName?: string; email?: string } | null;
  })[];
  loading?: boolean;
  onInfo: (n: News) => void;
  onOpen: (n: News) => void;
};

function providerLabel(n: any) {
  const p = n?.provider;
  const name = String(p?.fullName || "").trim();
  if (name) return name;
  const mail = String(p?.email || "").trim();
  if (mail) return mail;
  return String(n?.providerId || "—");
}

export default function RejectedNewsList({
  items,
  loading,
  onInfo,
  onOpen,
}: Props) {
  const { t } = useTranslation();
  if (!items.length) {
    return (
      <section className="card">
        <div className="card__empty">
          {t("common.admin.news.rejectedList.empty")}
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="card__body pending-news">
        {items.map((n) => {
          const canResubmit = canSubmitForReview(n as any);
          const disabled = Boolean(loading) || !canResubmit;

          return (
            <div key={String((n as any)._id)} className="pending-news__row">
              <div className="pending-news__meta">
                <div className="pending-news__title">
                  {n.title || t("common.emptyDash")}
                </div>

                <div className="pending-news__sub">
                  <span className="pending-news__by">
                    {t("common.admin.news.rejectedList.by")}: {providerLabel(n)}
                  </span>
                  <span className="pending-news__sep">•</span>
                  <span className="pending-news__status">
                    {t("common.status")}:{" "}
                    <b>{t("common.admin.news.rejectedList.rejected")}</b>
                  </span>
                </div>
              </div>

              <div className="pending-news__actions">
                <span
                  className={`edit-trigger ${loading ? "is-disabled" : ""}`}
                  role="button"
                  tabIndex={loading ? -1 : 0}
                  title={t("common.admin.news.rejectedList.showReason")}
                  aria-label={t("common.admin.news.rejectedList.showReason")}
                  aria-disabled={loading ? true : undefined}
                  onClick={(e) => {
                    stop(e);
                    blurTarget(e.currentTarget);
                    if (loading) return;
                    onInfo(n);
                  }}
                  onKeyDown={(e) =>
                    onActionKey(e, () => void onInfo(n), Boolean(loading))
                  }
                >
                  <img
                    src="/icons/info.svg"
                    alt=""
                    aria-hidden="true"
                    className="icon-img"
                  />
                </span>

                <span
                  className={`edit-trigger ${disabled ? "is-disabled" : ""}`}
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  {...(!disabled
                    ? { title: t("common.admin.news.rejectedList.resubmit") }
                    : {})}
                  aria-label={t("common.admin.news.rejectedList.resubmit")}
                  aria-disabled={disabled ? true : undefined}
                  {...(disabled
                    ? {
                        "data-ks-tip": t(
                          "common.admin.news.rejectedList.updateFirst",
                        ),
                      }
                    : {})}
                  onClick={(e) => {
                    stop(e);
                    blurTarget(e.currentTarget);
                    if (disabled) return;
                    onOpen(n);
                  }}
                  onKeyDown={(e) =>
                    onActionKey(e, () => void onOpen(n), disabled)
                  }
                >
                  <img
                    src="/icons/arrow_right_alt.svg"
                    alt=""
                    aria-hidden="true"
                    className="icon-img icon-img--left"
                  />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// // src/app/admin/news/components/RejectedNewsList.tsx
// "use client";

// import React from "react";
// import type { News } from "../types";
// import {
//   blurTarget,
//   canSubmitForReview,
//   onActionKey,
//   stop,
// } from "./NewsTableList.helpers";

// type Props = {
//   items: (News & {
//     provider?: { id?: string; fullName?: string; email?: string } | null;
//   })[];
//   loading?: boolean;
//   onInfo: (n: News) => void;
//   onOpen: (n: News) => void;
// };

// function providerLabel(n: any) {
//   const p = n?.provider;
//   const name = String(p?.fullName || "").trim();
//   if (name) return name;
//   const mail = String(p?.email || "").trim();
//   if (mail) return mail;
//   return String(n?.providerId || "—");
// }

// export default function RejectedNewsList({
//   items,
//   loading,
//   onInfo,
//   onOpen,
// }: Props) {
//   if (!items.length) {
//     return (
//       <section className="card">
//         <div className="card__empty">Keine abgelehnten Beiträge.</div>
//       </section>
//     );
//   }

//   return (
//     <section className="card">
//       <div className="card__body pending-news">
//         {items.map((n) => {
//           const canResubmit = canSubmitForReview(n as any);
//           const disabled = Boolean(loading) || !canResubmit;

//           return (
//             <div key={String((n as any)._id)} className="pending-news__row">
//               <div className="pending-news__meta">
//                 <div className="pending-news__title">{n.title || "—"}</div>

//                 <div className="pending-news__sub">
//                   <span className="pending-news__by">
//                     Von: {providerLabel(n)}
//                   </span>
//                   <span className="pending-news__sep">•</span>
//                   <span className="pending-news__status">
//                     Status: <b>Abgelehnt</b>
//                   </span>
//                 </div>
//               </div>

//               <div className="pending-news__actions">
//                 <span
//                   className={`edit-trigger ${loading ? "is-disabled" : ""}`}
//                   role="button"
//                   tabIndex={loading ? -1 : 0}
//                   title="Begründung anzeigen"
//                   aria-label="Begründung anzeigen"
//                   aria-disabled={loading ? true : undefined}
//                   onClick={(e) => {
//                     stop(e);
//                     blurTarget(e.currentTarget);
//                     if (loading) return;
//                     onInfo(n);
//                   }}
//                   onKeyDown={(e) =>
//                     onActionKey(e, () => void onInfo(n), Boolean(loading))
//                   }
//                 >
//                   <img
//                     src="/icons/info.svg"
//                     alt=""
//                     aria-hidden="true"
//                     className="icon-img"
//                   />
//                 </span>

//                 <span
//                   className={`edit-trigger ${disabled ? "is-disabled" : ""}`}
//                   role="button"
//                   tabIndex={disabled ? -1 : 0}
//                   {...(!disabled ? { title: "Erneut senden" } : {})}
//                   aria-label="Erneut senden"
//                   aria-disabled={disabled ? true : undefined}
//                   {...(disabled
//                     ? { "data-ks-tip": "Bitte zuerst aktualisieren" }
//                     : {})}
//                   onClick={(e) => {
//                     stop(e);
//                     blurTarget(e.currentTarget);
//                     if (disabled) return;
//                     onOpen(n);
//                   }}
//                   onKeyDown={(e) =>
//                     onActionKey(e, () => void onOpen(n), disabled)
//                   }
//                 >
//                   <img
//                     src="/icons/arrow_right_alt.svg"
//                     alt=""
//                     aria-hidden="true"
//                     className="icon-img icon-img--left"
//                   />
//                 </span>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </section>
//   );
// }
