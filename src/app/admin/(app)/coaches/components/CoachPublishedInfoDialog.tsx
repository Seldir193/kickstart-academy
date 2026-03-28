"use client";

import type { Coach } from "../types";
import { fullName } from "../utils";

function cleanStr(v: unknown) {
  return String(v ?? "").trim();
}

function val(v: any) {
  const s = cleanStr(v);
  return s ? s : "—";
}

export default function CoachPublishedInfoDialog({
  open,
  coach,
  onClose,
}: {
  open: boolean;
  coach: Coach | null;
  onClose: () => void;
}) {
  if (!open || !coach) return null;

  return (
    <div className="dialog-backdrop coach-info" role="dialog" aria-modal="true">
      <button
        type="button"
        className="coach-info__backdrop-hit"
        aria-label="Close"
        onClick={onClose}
      />

      <div className="dialog coach-info__dialog">
        <div className="dialog-head coach-info__head">
          <div className="coach-info__head-left">
            <div className="coach-info__title">Coach: {fullName(coach)}</div>
            <div className="coach-info__subtitle">
              Nur Ansicht (freigegeben)
            </div>
          </div>

          <div className="coach-info__head-right">
            <span className="coach-info__badge is-approved">Freigegeben</span>

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

        <div className="dialog-body coach-info__body">
          <div className="coach-info__grid">
            <section className="coach-info__section">
              <div className="coach-info__section-title">Details</div>
              <div className="coach-info__list">
                <div className="coach-info__row">
                  <div className="coach-info__label">Slug</div>
                  <div className="coach-info__value">
                    {val((coach as any).slug)}
                  </div>
                </div>
                <div className="coach-info__row">
                  <div className="coach-info__label">Vorname</div>
                  <div className="coach-info__value">
                    {val((coach as any).firstName)}
                  </div>
                </div>
                <div className="coach-info__row">
                  <div className="coach-info__label">Nachname</div>
                  <div className="coach-info__value">
                    {val((coach as any).lastName)}
                  </div>
                </div>
                <div className="coach-info__row">
                  <div className="coach-info__label">Position</div>
                  <div className="coach-info__value">
                    {val((coach as any).position)}
                  </div>
                </div>
                <div className="coach-info__row">
                  <div className="coach-info__label">Seit</div>
                  <div className="coach-info__value">
                    {val((coach as any).since)}
                  </div>
                </div>
                <div className="coach-info__row is-multiline">
                  <div className="coach-info__label">Abschluss</div>
                  <div className="coach-info__value">
                    {val((coach as any).degree)}
                  </div>
                </div>
              </div>
            </section>

            <section className="coach-info__section">
              <div className="coach-info__section-title">Favoriten</div>
              <div className="coach-info__list">
                <div className="coach-info__row">
                  <div className="coach-info__label">Lieblingsverein</div>
                  <div className="coach-info__value">
                    {val((coach as any).favClub)}
                  </div>
                </div>
                <div className="coach-info__row">
                  <div className="coach-info__label">Lieblingstrainer</div>
                  <div className="coach-info__value">
                    {val((coach as any).favCoach)}
                  </div>
                </div>
                <div className="coach-info__row">
                  <div className="coach-info__label">Lieblingstrick</div>
                  <div className="coach-info__value">
                    {val((coach as any).favTrick)}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

// // src/app/admin/(app)/coaches/components/CoachPublishedInfoDialog.tsx
// "use client";

// import type { Coach } from "../types";
// import { fullName } from "../utils";

// function cleanStr(v: unknown) {
//   return String(v ?? "").trim();
// }

// function val(v: any) {
//   const s = cleanStr(v);
//   return s ? s : "—";
// }

// export default function CoachPublishedInfoDialog({
//   open,
//   coach,
//   onClose,
// }: {
//   open: boolean;
//   coach: Coach | null;
//   onClose: () => void;
// }) {
//   if (!open || !coach) return null;

//   return (
//     <div className="modal fl-info" role="dialog" aria-modal="true">
//       <div className="modal__overlay" onClick={onClose} />

//       <div className="modal__panel modal__panel--md">
//         <div className="card fl-info__card">
//           <div className="fl-info__head">
//             <div className="fl-info__head-left">
//               <div className="fl-info__title">Coach: {fullName(coach)}</div>
//               <div className="fl-info__subtitle">Nur Ansicht (freigegeben)</div>
//             </div>

//             <div className="fl-info__head-right">
//               <span className="fl-info__badge is-approved">Freigegeben</span>

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

//           <div className="fl-info__body">
//             <div className="fl-info__grid">
//               <section className="fl-info__section">
//                 <div className="fl-info__section-title">Details</div>
//                 <div className="fl-info__list">
//                   <div className="fl-info__row">
//                     <div className="fl-info__label">Slug</div>
//                     <div className="fl-info__value">
//                       {val((coach as any).slug)}
//                     </div>
//                   </div>
//                   <div className="fl-info__row">
//                     <div className="fl-info__label">Vorname</div>
//                     <div className="fl-info__value">
//                       {val((coach as any).firstName)}
//                     </div>
//                   </div>
//                   <div className="fl-info__row">
//                     <div className="fl-info__label">Nachname</div>
//                     <div className="fl-info__value">
//                       {val((coach as any).lastName)}
//                     </div>
//                   </div>
//                   <div className="fl-info__row">
//                     <div className="fl-info__label">Position</div>
//                     <div className="fl-info__value">
//                       {val((coach as any).position)}
//                     </div>
//                   </div>
//                   <div className="fl-info__row">
//                     <div className="fl-info__label">Seit</div>
//                     <div className="fl-info__value">
//                       {val((coach as any).since)}
//                     </div>
//                   </div>
//                   <div className="fl-info__row is-multiline">
//                     <div className="fl-info__label">Abschluss</div>
//                     <div className="fl-info__value">
//                       {val((coach as any).degree)}
//                     </div>
//                   </div>
//                 </div>
//               </section>

//               <section className="fl-info__section">
//                 <div className="fl-info__section-title">Favoriten</div>
//                 <div className="fl-info__list">
//                   <div className="fl-info__row">
//                     <div className="fl-info__label">Lieblingsverein</div>
//                     <div className="fl-info__value">
//                       {val((coach as any).favClub)}
//                     </div>
//                   </div>
//                   <div className="fl-info__row">
//                     <div className="fl-info__label">Lieblingstrainer</div>
//                     <div className="fl-info__value">
//                       {val((coach as any).favCoach)}
//                     </div>
//                   </div>
//                   <div className="fl-info__row">
//                     <div className="fl-info__label">Lieblingstrick</div>
//                     <div className="fl-info__value">
//                       {val((coach as any).favTrick)}
//                     </div>
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
