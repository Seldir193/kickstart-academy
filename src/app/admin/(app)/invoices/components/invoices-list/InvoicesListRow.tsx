//src\app\admin\(app)\invoices\components\invoices-list\InvoicesListRow.tsx
"use client";

import React from "react";
import type { DocItem } from "../../utils/invoiceUi";
import type { InvoiceRow } from "../../utils/invoiceList";
import {
  displayTitle,
  docNoFrom,
  iconForType,
  metaLine,
} from "../../utils/invoiceUi";
import {
  actionDisabled,
  actionTitle,
  canShowCollection,
  hasFinalDunning,
  isDunningRow,
  isHandedOver,
  isVoidedDunningRow,
  quickSendAllowed,
  quickSendTitle,
  canRefund,
  canWithdraw,
  refundTitle,
  withdrawTitle,
} from "./invoicesListLogic";

type Props = {
  d: DocItem;
  idx: number;
  total: number;
  openPdf: (d: DocItem) => void;
  fmtDate: (iso?: string) => string;
  rowBusyId?: string;
  onMarkPaid?: (row: InvoiceRow) => void;
  onOpenReturned?: (row: InvoiceRow) => void;
  onOpenDunning?: (row: InvoiceRow) => void;
  onQuickSendDoc?: (row: InvoiceRow) => void;
  onVoidDunning?: (row: InvoiceRow) => void;
  onMarkCollection?: (row: InvoiceRow) => void;
  onOpenRefund?: (row: InvoiceRow) => void;
  onOpenWithdraw?: (row: InvoiceRow) => void;
};

function listItemClass(idx: number, total: number) {
  const base = "list__item chip is-fullhover is-interactive ks-invoices__item";
  return idx < total - 1 ? `${base} ks-invoices__withSep` : base;
}

function onRowKeyDown(e: React.KeyboardEvent, open: () => void) {
  if (e.key === "Enter" || e.key === " ") open();
}

export default function InvoicesListRow(props: Props) {
  const row = props.d as InvoiceRow;
  const isCreditNote = row.type === "creditnote";
  const busy = props.rowBusyId === row.id;
  const disabled = actionDisabled(row, props.rowBusyId);
  const paymentDisabled = disabled || isCreditNote;
  const quickAllowed = quickSendAllowed(row);
  const showCollection =
    !isCreditNote && canShowCollection(row, props.rowBusyId);

  const refundAllowed = canRefund(row, props.rowBusyId);
  const withdrawAllowed = canWithdraw(row, props.rowBusyId);

  const sendDisabled = paymentDisabled || hasFinalDunning(row);

  const sendTitle = isCreditNote
    ? "Not available for credit notes"
    : hasFinalDunning(row)
      ? "Final already sent"
      : actionTitle(row, "Send dunning step");

  return (
    <li
      key={props.d.id}
      className={listItemClass(props.idx, props.total)}
      onClick={() => props.openPdf(props.d)}
      tabIndex={0}
      onKeyDown={(e) => onRowKeyDown(e, () => props.openPdf(props.d))}
    >
      <div className="list__body ks-invoices__rowBody">
        <span aria-hidden="true" className="ks-invoices__rowIcon">
          <img src={iconForType(props.d.type)} alt="" width={18} height={18} />
        </span>

        <div className="ks-invoices__rowMain">
          <div className="ks-invoices__rowLeft">
            <div className="list__title">{displayTitle(props.d)}</div>

            <div
              className="list__meta"
              data-ks-tip={
                props.d.customerChildName
                  ? `Child: ${props.d.customerChildName}`
                  : undefined
              }
            >
              {metaLine(props.d, props.fmtDate)}
            </div>
          </div>

          <div className="ks-doc-select__badgeCol" aria-hidden>
            {isHandedOver(row) ? (
              <span className="ks-doc-select__badge">Collection</span>
            ) : null}
            <span className="ks-doc-select__badge">
              {(docNoFrom(props.d) || "").replaceAll("/", "-")}
            </span>
          </div>
        </div>
      </div>

      <div className="list__actions ks-invoices__hoverActions">
        <button
          type="button"
          className="ks-doc-open"
          aria-label="Open PDF"
          title="Open PDF"
          onClick={(e) => {
            e.stopPropagation();
            props.openPdf(props.d);
          }}
        >
          <img src="/icons/eye.svg" alt="" width={18} height={18} />
        </button>

        <button
          type="button"
          className="ks-doc-open"
          aria-label="Mark as paid"
          title={
            isCreditNote
              ? "Not available for credit notes"
              : actionTitle(row, "Mark as paid")
          }
          onClick={(e) => {
            e.stopPropagation();
            props.onMarkPaid?.(row);
          }}
          disabled={paymentDisabled}
        >
          <img src="/icons/check_circle.svg" alt="" width={18} height={18} />
        </button>

        <button
          type="button"
          className="ks-doc-open"
          aria-label="Mark returned and add fee"
          title={
            isCreditNote
              ? "Not available for credit notes"
              : actionTitle(row, "Mark returned + fee")
          }
          onClick={(e) => {
            e.stopPropagation();
            props.onOpenReturned?.(row);
          }}
          disabled={paymentDisabled}
        >
          <img src="/icons/undo.svg" alt="" width={18} height={18} />
        </button>

        <button
          type="button"
          className="ks-doc-open"
          aria-label="Refund"
          title={refundTitle(row)}
          onClick={(e) => {
            e.stopPropagation();
            if (!refundAllowed) return;
            props.onOpenRefund?.(row);
          }}
          disabled={!refundAllowed}
          aria-disabled={!refundAllowed}
          style={{
            opacity: refundAllowed ? 1 : 0.35,
            cursor: refundAllowed ? "pointer" : "not-allowed",
          }}
        >
          <img src="/icons/credit_note.svg" alt="" width={18} height={18} />
        </button>

        <button
          type="button"
          className="ks-doc-open"
          aria-label="Withdraw (14 days)"
          title={withdrawTitle(row)}
          onClick={(e) => {
            e.stopPropagation();
            if (!withdrawAllowed) return;
            props.onOpenWithdraw?.(row);
          }}
          disabled={!withdrawAllowed}
          aria-disabled={!withdrawAllowed}
          style={{
            opacity: withdrawAllowed ? 1 : 0.35,
            cursor: withdrawAllowed ? "pointer" : "not-allowed",
          }}
        >
          <img src="/icons/void.svg" alt="" width={18} height={18} />
        </button>

        <button
          type="button"
          className="ks-doc-open"
          aria-label="Send dunning step"
          title={sendTitle}
          onClick={(e) => {
            e.stopPropagation();
            props.onOpenDunning?.(row);
          }}
          disabled={sendDisabled}
        >
          <img src="/icons/mail_send.svg" alt="" width={18} height={18} />
        </button>

        <button
          type="button"
          className="ks-doc-open"
          aria-label="Send this document by email"
          title={quickSendTitle(row)}
          onClick={(e) => {
            e.stopPropagation();
            props.onQuickSendDoc?.(row);
          }}
          disabled={busy || !quickAllowed}
        >
          <img src="/icons/resend.svg" alt="" width={18} height={18} />
        </button>

        <button
          type="button"
          className="ks-doc-open"
          aria-label="Void dunning (obsolete)"
          title={
            !isDunningRow(row)
              ? "Dunning only"
              : isVoidedDunningRow(row)
                ? "Already voided"
                : "Void dunning (payment reminder/dunning)"
          }
          onClick={(e) => {
            e.stopPropagation();
            props.onVoidDunning?.(row);
          }}
          disabled={!isDunningRow(row) || busy || isVoidedDunningRow(row)}
        >
          <img src="/icons/void.svg" alt="" width={18} height={18} />
        </button>

        <button
          type="button"
          className="ks-doc-open"
          aria-label="Hand over to collection"
          title={
            isHandedOver(row)
              ? "Already handed over to collection"
              : "Hand over to collection"
          }
          onClick={(e) => {
            e.stopPropagation();
            if (!showCollection) return;
            props.onMarkCollection?.(row);
          }}
          disabled={busy || !showCollection}
          tabIndex={showCollection ? 0 : -1}
          style={{ display: showCollection ? "inline-flex" : "none" }}
        >
          <img src="/icons/collection.svg" alt="" width={18} height={18} />
        </button>
      </div>
    </li>
  );
}

// //src\app\admin\(app)\invoices\components\invoices-list\InvoicesListRow.tsx
// "use client";

// import React from "react";
// import type { DocItem } from "../../utils/invoiceUi";
// import type { InvoiceRow } from "../../utils/invoiceList";
// import {
//   displayTitle,
//   docNoFrom,
//   iconForType,
//   metaLine,
// } from "../../utils/invoiceUi";
// import {
//   actionDisabled,
//   actionTitle,
//   canShowCollection,
//   hasFinalDunning,
//   isDunningRow,
//   isHandedOver,
//   isVoidedDunningRow,
//   quickSendAllowed,
//   quickSendTitle,
//   canRefund,
//   canWithdraw,
//   refundTitle,
//   withdrawTitle,
// } from "./invoicesListLogic";

// type Props = {
//   d: DocItem;
//   idx: number;
//   total: number;
//   openPdf: (d: DocItem) => void;
//   fmtDate: (iso?: string) => string;
//   rowBusyId?: string;
//   onMarkPaid?: (row: InvoiceRow) => void;
//   onOpenReturned?: (row: InvoiceRow) => void;
//   onOpenDunning?: (row: InvoiceRow) => void;
//   onQuickSendDoc?: (row: InvoiceRow) => void;
//   onVoidDunning?: (row: InvoiceRow) => void;
//   onMarkCollection?: (row: InvoiceRow) => void;
//   onOpenRefund?: (row: InvoiceRow) => void;
//   onOpenWithdraw?: (row: InvoiceRow) => void;
// };

// function listItemClass(idx: number, total: number) {
//   const base = "list__item chip is-fullhover is-interactive ks-invoices__item";
//   return idx < total - 1 ? `${base} ks-invoices__withSep` : base;
// }

// function onRowKeyDown(e: React.KeyboardEvent, open: () => void) {
//   if (e.key === "Enter" || e.key === " ") open();
// }

// export default function InvoicesListRow(props: Props) {
//   const row = props.d as InvoiceRow;
//   const isCreditNote = row.type === "creditnote";
//   const busy = props.rowBusyId === row.id;
//   const disabled = actionDisabled(row, props.rowBusyId);
//   const paymentDisabled = disabled || isCreditNote;
//   const quickAllowed = quickSendAllowed(row);
//   const showCollection =
//     !isCreditNote && canShowCollection(row, props.rowBusyId);

//   const refundAllowed = canRefund(row, props.rowBusyId);
//   const withdrawAllowed = canWithdraw(row, props.rowBusyId);

//   const sendDisabled = paymentDisabled || hasFinalDunning(row);

//   const sendTitle = isCreditNote
//     ? "Für Gutschriften nicht verfügbar"
//     : hasFinalDunning(row)
//       ? "Final already sent"
//       : actionTitle(row, "Send dunning step");

//   return (
//     <li
//       key={props.d.id}
//       className={listItemClass(props.idx, props.total)}
//       onClick={() => props.openPdf(props.d)}
//       tabIndex={0}
//       onKeyDown={(e) => onRowKeyDown(e, () => props.openPdf(props.d))}
//     >
//       <div className="list__body ks-invoices__rowBody">
//         <span aria-hidden="true" className="ks-invoices__rowIcon">
//           <img src={iconForType(props.d.type)} alt="" width={18} height={18} />
//         </span>

//         <div className="ks-invoices__rowMain">
//           <div className="ks-invoices__rowLeft">
//             <div className="list__title">{displayTitle(props.d)}</div>

//             <div
//               className="list__meta"
//               data-ks-tip={
//                 props.d.customerChildName
//                   ? `Kind: ${props.d.customerChildName}`
//                   : undefined
//               }
//             >
//               {metaLine(props.d, props.fmtDate)}
//             </div>
//           </div>

//           <div className="ks-doc-select__badgeCol" aria-hidden>
//             {isHandedOver(row) ? (
//               <span className="ks-doc-select__badge">Inkasso</span>
//             ) : null}
//             <span className="ks-doc-select__badge">
//               {(docNoFrom(props.d) || "").replaceAll("/", "-")}
//             </span>
//           </div>
//         </div>
//       </div>

//       <div className="list__actions ks-invoices__hoverActions">
//         <button
//           type="button"
//           className="ks-doc-open"
//           aria-label="Open PDF"
//           title="Open PDF"
//           onClick={(e) => {
//             e.stopPropagation();
//             props.openPdf(props.d);
//           }}
//         >
//           <img src="/icons/eye.svg" alt="" width={18} height={18} />
//         </button>

//         <button
//           type="button"
//           className="ks-doc-open"
//           aria-label="Mark as paid"
//           title={
//             isCreditNote
//               ? "Für Gutschriften nicht verfügbar"
//               : actionTitle(row, "Mark as paid")
//           }
//           onClick={(e) => {
//             e.stopPropagation();
//             props.onMarkPaid?.(row);
//           }}
//           disabled={paymentDisabled}
//         >
//           <img src="/icons/check_circle.svg" alt="" width={18} height={18} />
//         </button>

//         <button
//           type="button"
//           className="ks-doc-open"
//           aria-label="Mark returned and add fee"
//           title={
//             isCreditNote
//               ? "Für Gutschriften nicht verfügbar"
//               : actionTitle(row, "Mark returned + fee")
//           }
//           onClick={(e) => {
//             e.stopPropagation();
//             props.onOpenReturned?.(row);
//           }}
//           disabled={paymentDisabled}
//         >
//           <img src="/icons/undo.svg" alt="" width={18} height={18} />
//         </button>

//         <button
//           type="button"
//           className="ks-doc-open"
//           aria-label="Refund"
//           title={refundTitle(row)}
//           onClick={(e) => {
//             e.stopPropagation();
//             if (!refundAllowed) return;
//             props.onOpenRefund?.(row);
//           }}
//           disabled={!refundAllowed}
//           aria-disabled={!refundAllowed}
//           style={{
//             opacity: refundAllowed ? 1 : 0.35,
//             cursor: refundAllowed ? "pointer" : "not-allowed",
//           }}
//         >
//           <img src="/icons/credit_note.svg" alt="" width={18} height={18} />
//         </button>

//         <button
//           type="button"
//           className="ks-doc-open"
//           aria-label="Withdraw (14 days)"
//           title={withdrawTitle(row)}
//           onClick={(e) => {
//             e.stopPropagation();
//             if (!withdrawAllowed) return;
//             props.onOpenWithdraw?.(row);
//           }}
//           disabled={!withdrawAllowed}
//           aria-disabled={!withdrawAllowed}
//           style={{
//             opacity: withdrawAllowed ? 1 : 0.35,
//             cursor: withdrawAllowed ? "pointer" : "not-allowed",
//           }}
//         >
//           <img src="/icons/void.svg" alt="" width={18} height={18} />
//         </button>

//         <button
//           type="button"
//           className="ks-doc-open"
//           aria-label="Send dunning step"
//           title={sendTitle}
//           onClick={(e) => {
//             e.stopPropagation();
//             props.onOpenDunning?.(row);
//           }}
//           disabled={sendDisabled}
//         >
//           <img src="/icons/mail_send.svg" alt="" width={18} height={18} />
//         </button>

//         <button
//           type="button"
//           className="ks-doc-open"
//           aria-label="Send this document by email"
//           title={quickSendTitle(row)}
//           onClick={(e) => {
//             e.stopPropagation();
//             props.onQuickSendDoc?.(row);
//           }}
//           disabled={busy || !quickAllowed}
//         >
//           <img src="/icons/resend.svg" alt="" width={18} height={18} />
//         </button>

//         <button
//           type="button"
//           className="ks-doc-open"
//           aria-label="Void dunning (gegenstandslos)"
//           title={
//             !isDunningRow(row)
//               ? "Nur für Mahnungen"
//               : isVoidedDunningRow(row)
//                 ? "Bereits gegenstandslos"
//                 : "Gegenstandslos (Mahnung/Zahlungserinnerung)"
//           }
//           onClick={(e) => {
//             e.stopPropagation();
//             props.onVoidDunning?.(row);
//           }}
//           disabled={!isDunningRow(row) || busy || isVoidedDunningRow(row)}
//         >
//           <img src="/icons/void.svg" alt="" width={18} height={18} />
//         </button>

//         <button
//           type="button"
//           className="ks-doc-open"
//           aria-label="Hand over to collection"
//           title={
//             isHandedOver(row)
//               ? "Bereits an Inkasso übergeben"
//               : "Inkasso übergeben"
//           }
//           onClick={(e) => {
//             e.stopPropagation();
//             if (!showCollection) return;
//             props.onMarkCollection?.(row);
//           }}
//           disabled={busy || !showCollection}
//           tabIndex={showCollection ? 0 : -1}
//           style={{ display: showCollection ? "inline-flex" : "none" }}
//         >
//           <img src="/icons/collection.svg" alt="" width={18} height={18} />
//         </button>
//       </div>
//     </li>
//   );
// }
