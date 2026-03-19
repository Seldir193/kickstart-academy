// // //src\app\admin\(app)\invoices\components\InvoicesList.tsx
"use client";

export { default } from "./invoices-list/InvoicesList";

// "use client";

// import React from "react";
// import type { DocItem } from "../utils/invoiceUi";
// import type { InvoiceRow } from "../utils/invoiceList";
// import {
//   displayTitle,
//   docNoFrom,
//   iconForType,
//   metaLine,
// } from "../utils/invoiceUi";

// type Props = {
//   loading: boolean;
//   items: DocItem[];
//   openPdf: (d: DocItem) => void;
//   fmtDate: (iso?: string) => string;
//   rowBusyId?: string;
//   onMarkPaid?: (row: InvoiceRow) => void;
//   onOpenReturned?: (row: InvoiceRow) => void;
//   onOpenDunning?: (row: InvoiceRow) => void;
//   onQuickSendDoc?: (row: InvoiceRow) => void;
//   onVoidDunning?: (row: InvoiceRow) => void;
//   onMarkCollection?: (row: InvoiceRow) => void;
// };

// function isHandedOver(row: InvoiceRow) {
//   return String((row as any)?.collectionStatus || "none") === "handed_over";
// }

// function hasFinalDunning(row: InvoiceRow) {
//   if (String(row.lastDunningStage || "") === "final") return true;
//   const stages = row.dunningSentStages;
//   return Array.isArray(stages) ? stages.includes("final") : false;
// }

// function canShowCollection(row: InvoiceRow, rowBusyId?: string) {
//   if (isDunningRow(row)) return false;
//   if (!row.bookingId) return false;
//   if (isPaidRow(row)) return false;
//   if (isHandedOver(row)) return false;
//   if (!hasFinalDunning(row)) return false;
//   if (rowBusyId === row.id) return false;
//   return true;
// }

// function minHeightVars(minHeight?: number) {
//   if (!minHeight) return {};
//   return { ["--invMinHeight" as any]: `${minHeight}px` };
// }

// function loadingVisVars(visible: boolean) {
//   return { ["--invLoadingVisibility" as any]: visible ? "visible" : "hidden" };
// }

// function isDunningRow(row: InvoiceRow) {
//   return String((row as any).type || "").toLowerCase() === "dunning";
// }

// function isPaidRow(row: InvoiceRow) {
//   return row.paymentStatus === "paid";
// }

// function canUseRowActions(row: InvoiceRow) {
//   if (isDunningRow(row)) return false;
//   return Boolean(row.bookingId);
// }

// function actionDisabled(row: InvoiceRow, rowBusyId?: string) {
//   if (!canUseRowActions(row)) return true;
//   if (isPaidRow(row)) return true;
//   return rowBusyId === row.id;
// }

// function actionTitle(row: InvoiceRow, base: string) {
//   if (isDunningRow(row)) return "Archived dunning document";
//   if (!row.bookingId) return "No booking reference";
//   if (isPaidRow(row)) return "Already paid";
//   return base;
// }

// function quickSendAllowed(row: InvoiceRow) {
//   const t = String((row as any).type || "").toLowerCase();
//   if (!row.bookingId) return false;
//   if (t === "dunning") return Boolean(row.lastDunningStage);
//   return t === "participation" || t === "storno" || t === "cancellation";
// }

// function quickSendTitle(row: InvoiceRow) {
//   const t = String((row as any).type || "").toLowerCase();
//   if (!row.bookingId) return "No booking reference";
//   if (t === "dunning") {
//     return row.lastDunningStage
//       ? "Erneut senden (Mahnung/Zahlungserinnerung)"
//       : "Noch keine Mahnung/Zahlungserinnerung vorhanden";
//   }
//   if (t === "participation") return "Teilnahme per E-Mail senden";
//   if (t === "storno") return "Storno per E-Mail senden";
//   if (t === "cancellation") return "Kündigung per E-Mail senden";
//   return "Senden";
// }

// function isVoidedDunningRow(row: InvoiceRow) {
//   const v = (row as any)?.voidedAt;
//   return Boolean(v);
// }

// export default function InvoicesList({
//   loading,
//   items,
//   openPdf,
//   fmtDate,
//   rowBusyId,
//   onMarkPaid,
//   onOpenReturned,
//   onOpenDunning,
//   onQuickSendDoc,
//   onVoidDunning,
//   onMarkCollection,
// }: Props) {
//   const showEmpty = !loading && items.length === 0;
//   const showList = items.length > 0;
//   const listMinHeight = loading && !showList ? 240 : undefined;

//   return (
//     <div className="ks-invoices__listWrap" style={minHeightVars(listMinHeight)}>
//       {showEmpty ? (
//         <div className="card__empty">Keine Dokumente gefunden.</div>
//       ) : showList ? (
//         <ul className="list list--bleed">
//           {items.map((d, idx) => {
//             const row = d as InvoiceRow;
//             const busy = rowBusyId === row.id;
//             const disabled = actionDisabled(row, rowBusyId);
//             const quickAllowed = quickSendAllowed(row);
//             const showCollection = canShowCollection(row, rowBusyId);

//             const sendDisabled = disabled || hasFinalDunning(row);
//             const sendTitle = hasFinalDunning(row)
//               ? "Final already sent"
//               : actionTitle(row, "Send dunning step");

//             return (
//               <li
//                 key={d.id}
//                 className={
//                   "list__item chip is-fullhover is-interactive ks-invoices__item" +
//                   (idx < items.length - 1 ? " ks-invoices__withSep" : "")
//                 }
//                 onClick={() => openPdf(d)}
//                 tabIndex={0}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" || e.key === " ") openPdf(d);
//                 }}
//               >
//                 <div className="list__body ks-invoices__rowBody">
//                   <span aria-hidden="true" className="ks-invoices__rowIcon">
//                     <img
//                       src={iconForType(d.type)}
//                       alt=""
//                       width={18}
//                       height={18}
//                     />
//                   </span>

//                   <div className="ks-invoices__rowMain">
//                     <div className="ks-invoices__rowLeft">
//                       <div className="list__title">{displayTitle(d)}</div>

//                       <div
//                         className="list__meta"
//                         data-ks-tip={
//                           d.customerChildName
//                             ? `Kind: ${d.customerChildName}`
//                             : undefined
//                         }
//                       >
//                         {metaLine(d, fmtDate)}
//                       </div>
//                     </div>
//                     {/*
//                     <div className="ks-doc-select__badgeCol" aria-hidden>
//                       <span className="ks-doc-select__badge">
//                         {docNoFrom(d) || ""}
//                       </span>
//                     </div> */}
//                     <div className="ks-doc-select__badgeCol" aria-hidden>
//                       {isHandedOver(row) ? (
//                         <span className="ks-doc-select__badge">Inkasso</span>
//                       ) : null}
//                       <span className="ks-doc-select__badge">
//                         {docNoFrom(d) || ""}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="list__actions ks-invoices__hoverActions">
//                   <button
//                     type="button"
//                     className="ks-doc-open"
//                     aria-label="Open PDF"
//                     title="Open PDF"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       openPdf(d);
//                     }}
//                   >
//                     <img src="/icons/eye.svg" alt="" width={18} height={18} />
//                   </button>

//                   <button
//                     type="button"
//                     className="ks-doc-open"
//                     aria-label="Mark as paid"
//                     title={actionTitle(row, "Mark as paid")}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onMarkPaid?.(row);
//                     }}
//                     disabled={disabled}
//                   >
//                     <img
//                       src="/icons/check_circle.svg"
//                       alt=""
//                       width={18}
//                       height={18}
//                     />
//                   </button>

//                   <button
//                     type="button"
//                     className="ks-doc-open"
//                     aria-label="Mark returned and add fee"
//                     title={actionTitle(row, "Mark returned + fee")}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onOpenReturned?.(row);
//                     }}
//                     disabled={disabled}
//                   >
//                     <img src="/icons/undo.svg" alt="" width={18} height={18} />
//                   </button>

//                   <button
//                     type="button"
//                     className="ks-doc-open"
//                     aria-label="Send dunning step"
//                     title={sendTitle}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onOpenDunning?.(row);
//                     }}
//                     disabled={sendDisabled}
//                   >
//                     <img
//                       src="/icons/mail_send.svg"
//                       alt=""
//                       width={18}
//                       height={18}
//                     />
//                   </button>

//                   <button
//                     type="button"
//                     className="ks-doc-open"
//                     aria-label="Send this document by email"
//                     title={quickSendTitle(row)}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onQuickSendDoc?.(row);
//                     }}
//                     disabled={busy || !quickAllowed}
//                   >
//                     <img
//                       src="/icons/resend.svg"
//                       alt=""
//                       width={18}
//                       height={18}
//                     />
//                   </button>

//                   <button
//                     type="button"
//                     className="ks-doc-open"
//                     aria-label="Void dunning (gegenstandslos)"
//                     title={
//                       !isDunningRow(row)
//                         ? "Nur für Mahnungen"
//                         : isVoidedDunningRow(row)
//                           ? "Bereits gegenstandslos"
//                           : "Gegenstandslos (Mahnung/Zahlungserinnerung)"
//                     }
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onVoidDunning?.(row);
//                     }}
//                     disabled={
//                       !isDunningRow(row) || busy || isVoidedDunningRow(row)
//                     }
//                   >
//                     <img src="/icons/void.svg" alt="" width={18} height={18} />
//                   </button>

//                   <button
//                     type="button"
//                     className="ks-doc-open"
//                     aria-label="Hand over to collection"
//                     title={
//                       isHandedOver(row)
//                         ? "Bereits an Inkasso übergeben"
//                         : "Inkasso übergeben"
//                     }
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       if (!showCollection) return;
//                       onMarkCollection?.(row);
//                     }}
//                     disabled={busy || !showCollection}
//                     tabIndex={showCollection ? 0 : -1}
//                     style={{
//                       visibility: showCollection ? "visible" : "hidden",
//                     }}
//                   >
//                     <img
//                       src="/icons/collection.svg"
//                       alt=""
//                       width={18}
//                       height={18}
//                     />
//                   </button>
//                 </div>
//               </li>
//             );
//           })}
//         </ul>
//       ) : (
//         <div className="card__empty">Lade…</div>
//       )}

//       {loading && showList ? (
//         <div
//           className="text-gray-600 mt-2 ks-invoices__loadingLine"
//           aria-live="polite"
//           style={loadingVisVars(loading)}
//         />
//       ) : null}
//     </div>
//   );
// }
