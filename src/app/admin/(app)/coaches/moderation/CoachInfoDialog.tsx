// src/app/admin/(app)/coaches/moderation/CoachInfoDialog.tsx
"use client";

import type { Coach } from "../types";
import { fullName } from "../utils";

type Props = {
  open: boolean;
  coach: Coach | null;
  onClose: () => void;
};

function cleanStr(v: unknown) {
  return String(v ?? "").trim();
}

function valOrDash(v: unknown) {
  const s = cleanStr(v);
  return s ? s : "—";
}

export default function CoachInfoDialog({ open, coach, onClose }: Props) {
  if (!open || !coach) return null;

  const reason = valOrDash((coach as any).rejectionReason);

  return (
    <div className="modal fl-info" role="dialog" aria-modal="true">
      <div className="modal__overlay" onClick={onClose} />

      <div className="modal__panel modal__panel--md">
        <div className="card fl-info__card">
          <div className="fl-info__head">
            <div className="fl-info__head-left">
              <div className="fl-info__title">Abgelehnt: {fullName(coach)}</div>
              <div className="fl-info__subtitle">Nur Ansicht</div>
            </div>

            <div className="fl-info__head-right">
              <span className="fl-info__badge is-rejected">Abgelehnt</span>

              <div className="dialog-head__actions">
                <button
                  type="button"
                  className="modal__close"
                  aria-label="Close"
                  onClick={onClose}
                >
                  <img
                    src="/icons/close.svg"
                    alt=""
                    aria-hidden="true"
                    className="icon-img"
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="fl-info__body">
            <div className="fl-info__grid">
              <section className="fl-info__section fl-info__section--danger">
                <div className="fl-info__section-title">Ablehnungsgrund</div>

                <div className="fl-info__list">
                  <div className="fl-info__row is-multiline">
                    <div className="fl-info__label">Begründung</div>
                    <div className="fl-info__value">{reason}</div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// // src/app/admin/coaches/moderation/CoachInfoDialog.tsx
// "use client";

// import React from "react";
// import type { Coach } from "../types";
// import { fullName } from "../utils";

// type Props = {
//   open: boolean;
//   coach: Coach | null;
//   onClose: () => void;

//   // optional: nur Superadmin nutzt das, Lizenznehmer kann Dialog read-only öffnen
//   onApprove?: (c: Coach) => Promise<void> | void;
//   onReject?: (c: Coach, reason: string) => Promise<void> | void;
//   onResubmit?: (c: Coach) => Promise<void> | void;
// };

// function clean(v: any) {
//   return String(v ?? "").trim();
// }

// function val(v: any) {
//   const s = clean(v);
//   return s ? s : "—";
// }

// export default function CoachInfoDialog({ open, coach, onClose }: Props) {
//   if (!open || !coach) return null;

//   const reason = (coach as any).rejectionReason;

//   return (
//     <div className="modal fl-info" role="dialog" aria-modal="true">
//       <div className="modal__overlay" onClick={onClose} />

//       <div className="modal__panel modal__panel--md">
//         <div className="card fl-info__card">
//           <div className="fl-info__head">
//             <div className="fl-info__head-left">
//               <div className="fl-info__title">Abgelehnt: {fullName(coach)}</div>
//               <div className="fl-info__subtitle">Nur Ansicht</div>
//             </div>

//             <div className="fl-info__head-right">
//               <span className="fl-info__badge is-rejected">Rejected</span>

//               <div className="dialog-head__actions">
//                 <button
//                   type="button"
//                   className="modal__close"
//                   aria-label="Close"
//                   onClick={onClose}
//                 >
//                   <img
//                     src="/icons/close.svg"
//                     alt=""
//                     aria-hidden="true"
//                     className="icon-img"
//                   />
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="fl-info__body">
//             <div className="fl-info__grid">
//               <section className="fl-info__section fl-info__section--danger">
//                 <div className="fl-info__section-title">Reject Grund</div>
//                 <div className="fl-info__list">
//                   <div className="fl-info__row is-multiline">
//                     <div className="fl-info__label">Begründung</div>
//                     <div className="fl-info__value">{val(reason)}</div>
//                   </div>
//                 </div>
//               </section>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
