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
    <div className="dialog-backdrop coach-info" role="dialog" aria-modal="true">
      <button
        type="button"
        className="dialog-backdrop-hit coach-info__backdrop-hit"
        aria-label="Close"
        onClick={onClose}
      />

      <div className="dialog coach-info__dialog">
        <div className="dialog-head coach-info__head">
          <div className="coach-info__head-left">
            <div className="dialog-title coach-info__title">
              Coach: {fullName(coach)}
            </div>

            <div className="dialog-subtitle coach-info__subtitle">
              View only
            </div>
          </div>

          <div className="coach-info__head-right">
            <div className="dialog-head__actions">
              <button
                type="button"
                className="dialog-close modal__close"
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

        <div className="dialog-body coach-info__body">
          <div className="coach-info__grid">
            <section className="dialog-section coach-info__section coach-info__section--danger">
              <div className="dialog-section__head">
                <div className="dialog-section__title">Rejection reason</div>
              </div>

              <div className="dialog-section__body coach-info__list">
                <div className="coach-info__row is-multiline">
                  <div className="dialog-label">Reason</div>
                  <div className="dialog-value">{reason}</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

// //src\app\admin\(app)\coaches\moderation\CoachInfoDialog.tsx
// "use client";

// import type { Coach } from "../types";
// import { fullName } from "../utils";

// type Props = {
//   open: boolean;
//   coach: Coach | null;
//   onClose: () => void;
// };

// function cleanStr(v: unknown) {
//   return String(v ?? "").trim();
// }

// function valOrDash(v: unknown) {
//   const s = cleanStr(v);
//   return s ? s : "—";
// }

// export default function CoachInfoDialog({ open, coach, onClose }: Props) {
//   if (!open || !coach) return null;

//   const reason = valOrDash((coach as any).rejectionReason);

//   return (
//     <div className="dialog-backdrop coach-info" role="dialog" aria-modal="true">
//       <button
//         type="button"
//         className="dialog-backdrop-hit coach-info__backdrop-hit"
//         aria-label="Close"
//         onClick={onClose}
//       />

//       <div className="dialog coach-info__dialog">
//         <div className="dialog-head coach-info__head">
//           <div className="coach-info__head-left">
//             <div className="dialog-title coach-info__title">
//               Coach: {fullName(coach)}
//             </div>
//             <div className="dialog-subtitle coach-info__subtitle">
//               Nur Ansicht
//             </div>
//           </div>

//           <div className="coach-info__head-right">
//             <span className="dialog-status dialog-status--danger">
//               Abgelehnt
//             </span>

//             <div className="dialog-head__actions">
//               <button
//                 type="button"
//                 className="dialog-close modal__close"
//                 aria-label="Close"
//                 onClick={onClose}
//               >
//                 <img
//                   src="/icons/close.svg"
//                   alt=""
//                   aria-hidden="true"
//                   className="icon-img"
//                 />
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="dialog-body coach-info__body">
//           <div className="coach-info__grid">
//             <section className="dialog-section coach-info__section coach-info__section--danger">
//               <div className="dialog-section__head">
//                 <div className="dialog-section__title">Ablehnungsgrund</div>
//               </div>

//               <div className="dialog-section__body coach-info__list">
//                 <div className="coach-info__row is-multiline">
//                   <div className="dialog-label">Begründung</div>
//                   <div className="dialog-value">{reason}</div>
//                 </div>
//               </div>
//             </section>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// //src\app\admin\(app)\coaches\moderation\CoachInfoDialog.tsx
// "use client";

// import type { Coach } from "../types";
// import { fullName } from "../utils";

// type Props = {
//   open: boolean;
//   coach: Coach | null;
//   onClose: () => void;
// };

// function cleanStr(v: unknown) {
//   return String(v ?? "").trim();
// }

// function valOrDash(v: unknown) {
//   const s = cleanStr(v);
//   return s ? s : "—";
// }

// export default function CoachInfoDialog({ open, coach, onClose }: Props) {
//   if (!open || !coach) return null;

//   const reason = valOrDash((coach as any).rejectionReason);

//   return (
//     <div className="dialog-backdrop coach-info" role="dialog" aria-modal="true">
//       <button
//         type="button"
//         className="coach-info__backdrop-hit"
//         aria-label="Close"
//         onClick={onClose}
//       />

//       <div className="dialog coach-info__dialog">
//         <div className="dialog-head coach-info__head">
//           <div className="coach-info__head-left">
//             <div className="coach-info__title">Coach: {fullName(coach)}</div>
//             <div className="coach-info__subtitle">Nur Ansicht</div>
//           </div>

//           <div className="coach-info__head-right">
//             <span className="coach-info__badge is-rejected">Abgelehnt</span>

//             <div className="dialog-head__actions">
//               <button
//                 type="button"
//                 className="modal__close"
//                 aria-label="Close"
//                 onClick={onClose}
//               >
//                 <img
//                   src="/icons/close.svg"
//                   alt=""
//                   aria-hidden="true"
//                   className="icon-img"
//                 />
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="dialog-body coach-info__body">
//           <div className="coach-info__grid">
//             <section className="coach-info__section coach-info__section--danger">
//               <div className="coach-info__section-title">Ablehnungsgrund</div>

//               <div className="coach-info__list">
//                 <div className="coach-info__row is-multiline">
//                   <div className="coach-info__label">Begründung</div>
//                   <div className="coach-info__value">{reason}</div>
//                 </div>
//               </div>
//             </section>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
