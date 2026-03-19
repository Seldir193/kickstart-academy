//src\app\admin\(app)\invoices\components\invoices-list\InvoicesList.tsx
"use client";

import React, { useMemo } from "react";
import type { DocItem } from "../../utils/invoiceUi";
import type { InvoiceRow } from "../../utils/invoiceList";
import InvoicesListRow from "./InvoicesListRow";
import { loadingVisVars, minHeightVars } from "./invoicesListLogic";

type Props = {
  loading: boolean;
  items: DocItem[];
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

function listMinHeight(loading: boolean, itemsLen: number) {
  if (!loading) return undefined;
  return itemsLen > 0 ? undefined : 240;
}

export default function InvoicesList(props: Props) {
  const showEmpty = !props.loading && props.items.length === 0;
  const showList = props.items.length > 0;

  const minHeight = useMemo(
    () => listMinHeight(props.loading, props.items.length),
    [props.loading, props.items.length],
  );

  return (
    <div className="ks-invoices__listWrap" style={minHeightVars(minHeight)}>
      {showEmpty ? (
        <div className="card__empty">Keine Dokumente gefunden.</div>
      ) : showList ? (
        <ul className="list list--bleed">
          {props.items.map((d, idx) => (
            <InvoicesListRow
              key={d.id}
              d={d}
              idx={idx}
              total={props.items.length}
              openPdf={props.openPdf}
              fmtDate={props.fmtDate}
              rowBusyId={props.rowBusyId}
              onMarkPaid={props.onMarkPaid}
              onOpenReturned={props.onOpenReturned}
              onOpenDunning={props.onOpenDunning}
              onQuickSendDoc={props.onQuickSendDoc}
              onVoidDunning={props.onVoidDunning}
              onMarkCollection={props.onMarkCollection}
              onOpenRefund={props.onOpenRefund}
              onOpenWithdraw={props.onOpenWithdraw}
            />
          ))}
        </ul>
      ) : (
        <div className="card__empty">Lade…</div>
      )}

      {props.loading && showList ? (
        <div
          className="text-gray-600 mt-2 ks-invoices__loadingLine"
          aria-live="polite"
          style={loadingVisVars(props.loading)}
        />
      ) : null}
    </div>
  );
}
