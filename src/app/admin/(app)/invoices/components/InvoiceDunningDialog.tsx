"use client";

export { default } from "./invoice-dunning-dialog/InvoiceDunningDialog";

// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import type { DunningStage, InvoiceRow } from "../utils/invoiceList";
// import type { RowActionState } from "../hooks/useInvoiceRowActions";

// type Props = {
//   state: RowActionState;
//   setState: React.Dispatch<React.SetStateAction<RowActionState>>;
//   onClose: () => void;
//   onSubmitReturned: () => void;
//   onSubmitDunning: () => void;
// };

// function stageLabel(value: DunningStage) {
//   if (value === "reminder") return "Zahlungserinnerung";
//   if (value === "dunning1") return "1. Mahnung";
//   if (value === "dunning2") return "2. Mahnung";
//   return "Letzte Mahnung";
// }

// function orderedStages(): DunningStage[] {
//   return ["reminder", "dunning1", "dunning2", "final"];
// }

// function nextStageForRow(row: InvoiceRow): DunningStage {
//   const next = String(row.nextDunningStage || "reminder").trim();
//   if (next === "dunning1") return "dunning1";
//   if (next === "dunning2") return "dunning2";
//   if (next === "final") return "final";
//   return "reminder";
// }

// function visibleStagesForRow(row: InvoiceRow): DunningStage[] {
//   const list = orderedStages();
//   const next = nextStageForRow(row);
//   const idx = list.indexOf(next);
//   if (idx < 0) return ["reminder"];
//   return list.slice(0, idx + 1);
// }

// function canPickStage(row: InvoiceRow, stage: DunningStage) {
//   return nextStageForRow(row) === stage;
// }

// function stageExists(row: InvoiceRow, stage: DunningStage): boolean {
//   const list = row.dunningSentStages;
//   if (Array.isArray(list)) return list.includes(stage);
//   return false;
// }

// export default function InvoiceDunningDialog({
//   state,
//   setState,
//   onClose,
//   onSubmitReturned,
//   onSubmitDunning,
// }: Props) {
//   const [stageOpen, setStageOpen] = useState(false);
//   const stageTriggerRef = useRef<HTMLButtonElement | null>(null);
//   const stageMenuRef = useRef<HTMLUListElement | null>(null);

//   useEffect(() => {
//     if (!state.open) setStageOpen(false);
//   }, [state.open]);

//   useEffect(() => {
//     if (!stageOpen) return;

//     function onPointerDown(ev: PointerEvent) {
//       const target = ev.target as Node;
//       if (stageTriggerRef.current?.contains(target)) return;
//       if (stageMenuRef.current?.contains(target)) return;
//       setStageOpen(false);
//     }

//     document.addEventListener("pointerdown", onPointerDown);
//     return () => document.removeEventListener("pointerdown", onPointerDown);
//   }, [stageOpen]);

//   if (!state.open || !state.row) return null;

//   const row = state.row;
//   const docRef =
//     row.invoiceNo || row.stornoNo || row.cancellationNo || row.bookingId || "-";

//   function applyStage(next: DunningStage) {
//     const exists = stageExists(row, next);
//     setState((prev) => ({
//       ...prev,
//       stage: next,
//       resolvedStage: next,
//       canSend: !exists,
//       inputsDisabled: exists,
//     }));
//     setStageOpen(false);
//   }

//   function toggleStageOpen() {
//     setStageOpen((prev) => !prev);
//   }

//   const inputsDisabled = state.loading || state.inputsDisabled;

//   return (
//     <div className="ks-inv-dialog" onClick={onClose}>
//       <div
//         className="ks-inv-dialog__panel"
//         onClick={(e) => e.stopPropagation()}
//         role="dialog"
//         aria-modal="true"
//         aria-label={
//           state.mode === "returned"
//             ? "Mark returned and bank fee"
//             : "Send dunning step"
//         }
//       >
//         <div className="ks-inv-dialog__head">
//           <div className="ks-inv-dialog__headText">
//             <div className="ks-inv-dialog__title">
//               {state.mode === "returned"
//                 ? "Mark returned + bank fee"
//                 : "Send dunning step"}
//             </div>

//             <div className="ks-inv-dialog__meta">
//               {row.title || "Dokument"} · {row.customerName || "-"}
//             </div>

//             <div className="ks-inv-dialog__meta">{docRef}</div>
//           </div>

//           <div className="dialog-head__actions">
//             <button
//               type="button"
//               className="modal__close"
//               onClick={onClose}
//               aria-label="Close"
//               title="Close"
//             >
//               <img
//                 src="/icons/close.svg"
//                 alt=""
//                 aria-hidden="true"
//                 className="icon-img"
//               />
//             </button>
//           </div>
//         </div>

//         <div className="ks-inv-dialog__body">
//           {state.mode === "dunning" ? (
//             <label className="ks-inv-dialog__field">
//               <span className="ks-inv-dialog__label">Stage</span>

//               <div
//                 className={
//                   "ks-training-select ks-inv-dialog__select" +
//                   (stageOpen ? " ks-training-select--open" : "")
//                 }
//               >
//                 <button
//                   type="button"
//                   ref={stageTriggerRef}
//                   className="ks-training-select__trigger"
//                   onClick={toggleStageOpen}
//                   disabled={state.loading}
//                 >
//                   <span className="ks-training-select__label">
//                     {stageLabel(state.resolvedStage)}
//                   </span>
//                   <span
//                     className="ks-training-select__chevron"
//                     aria-hidden="true"
//                   />
//                 </button>

//                 {stageOpen ? (
//                   <ul
//                     ref={stageMenuRef}
//                     className="ks-training-select__menu"
//                     role="listbox"
//                     aria-label="Stage"
//                   >
//                     {visibleStagesForRow(row).map((st) => {
//                       const enabled = canPickStage(row, st);
//                       return (
//                         <li key={st}>
//                           <button
//                             type="button"
//                             className={
//                               "ks-training-select__option" +
//                               (state.resolvedStage === st ? " is-selected" : "")
//                             }
//                             onClick={() => applyStage(st)}
//                             disabled={!enabled}
//                           >
//                             {stageLabel(st)}
//                           </button>
//                         </li>
//                       );
//                     })}
//                   </ul>
//                 ) : null}
//               </div>
//             </label>
//           ) : null}

//           <label className="ks-inv-dialog__field">
//             <span className="ks-inv-dialog__label">Rücklastschriftgebühr</span>
//             <input
//               className="input"
//               type="text"
//               inputMode="decimal"
//               value={state.bankFee}
//               onChange={(e) =>
//                 setState((prev) => ({ ...prev, bankFee: e.target.value }))
//               }
//               placeholder="z. B. 16,76"
//               disabled={inputsDisabled}
//             />
//           </label>

//           {state.mode === "returned" ? (
//             <label className="ks-inv-dialog__field">
//               <span className="ks-inv-dialog__label">Return note</span>
//               <textarea
//                 className="input ks-inv-dialog__textarea"
//                 value={state.returnNote}
//                 onChange={(e) =>
//                   setState((prev) => ({ ...prev, returnNote: e.target.value }))
//                 }
//                 rows={3}
//                 disabled={state.loading}
//               />
//             </label>
//           ) : null}

//           {state.mode === "dunning" ? (
//             <>
//               <label className="ks-inv-dialog__field">
//                 <span className="ks-inv-dialog__label">Mahngebühr</span>
//                 <input
//                   className="input"
//                   type="text"
//                   inputMode="decimal"
//                   value={state.dunningFee}
//                   onChange={(e) =>
//                     setState((prev) => ({
//                       ...prev,
//                       dunningFee: e.target.value,
//                     }))
//                   }
//                   placeholder="z. B. 5,00"
//                   disabled={inputsDisabled}
//                 />
//               </label>

//               <label className="ks-inv-dialog__field">
//                 <span className="ks-inv-dialog__label">Bearbeitungsgebühr</span>
//                 <input
//                   className="input"
//                   type="text"
//                   inputMode="decimal"
//                   value={state.processingFee}
//                   onChange={(e) =>
//                     setState((prev) => ({
//                       ...prev,
//                       processingFee: e.target.value,
//                     }))
//                   }
//                   placeholder="z. B. 0,00"
//                   disabled={inputsDisabled}
//                 />
//               </label>

//               <label className="ks-inv-dialog__field">
//                 <span className="ks-inv-dialog__label">Freitext</span>
//                 <textarea
//                   className="input ks-inv-dialog__textarea"
//                   value={state.freeText}
//                   onChange={(e) =>
//                     setState((prev) => ({ ...prev, freeText: e.target.value }))
//                   }
//                   rows={4}
//                   disabled={inputsDisabled}
//                 />
//               </label>
//             </>
//           ) : null}

//           {state.error ? (
//             <div className="ks-inv-dialog__error">{state.error}</div>
//           ) : null}
//         </div>

//         <div className="ks-inv-dialog__footer">
//           <div className="ks-inv-dialog__footerMain">
//             {state.mode === "returned" ? (
//               <button
//                 type="button"
//                 className="btn"
//                 onClick={onSubmitReturned}
//                 disabled={state.loading}
//               >
//                 {state.loading ? "Saving..." : "Save returned"}
//               </button>
//             ) : (
//               <button
//                 type="button"
//                 className="btn"
//                 onClick={onSubmitDunning}
//                 disabled={state.loading || !state.canSend}
//               >
//                 {state.loading ? "Sending..." : "Send"}
//               </button>
//             )}

//             {state.notice ? (
//               <span
//                 className={
//                   "ks-inv-dialog__notice" +
//                   (state.noticeTone === "success"
//                     ? " is-success"
//                     : state.noticeTone === "error"
//                       ? " is-error"
//                       : "")
//                 }
//                 aria-live="polite"
//               >
//                 {state.notice}
//               </span>
//             ) : null}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
