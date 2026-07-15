"use client";

import type { TFunction } from "i18next";
import React from "react";
import { useTranslation } from "react-i18next";
import { InvoicesListRowActions } from "./row/InvoicesListRowActions";
import { InvoicesListRowBody } from "./row/InvoicesListRowBody";
import type { InvoiceRowState, InvoicesListRowProps } from "./row/types";
import { useInvoiceRowState } from "./row/useInvoiceRowState";

type RowItemProps = {
  props: InvoicesListRowProps;
  state: InvoiceRowState;
  t: TFunction;
};

function listItemClass(idx: number, total: number) {
  const base = "list__item chip is-fullhover is-interactive ks-invoices__item";
  return idx < total - 1 ? `${base} ks-invoices__withSep` : base;
}

function onRowKeyDown(e: React.KeyboardEvent, open: () => void) {
  if (e.key === "Enter" || e.key === " ") open();
}

function rowKeyDownHandler(props: InvoicesListRowProps) {
  return (e: React.KeyboardEvent) =>
    onRowKeyDown(e, () => props.openPdf(props.d));
}

function InvoiceRowItem({ props, state, t }: RowItemProps) {
  return (
    <li
      key={props.d.id}
      className={listItemClass(props.idx, props.total)}
      onClick={() => props.openPdf(props.d)}
      tabIndex={0}
      onKeyDown={rowKeyDownHandler(props)}
    >
      <InvoicesListRowBody
        doc={props.d}
        fmtDate={props.fmtDate}
        row={state.row}
        t={t}
      />
      <InvoicesListRowActions props={props} state={state} t={t} />
    </li>
  );
}

export default function InvoicesListRow(props: InvoicesListRowProps) {
  const { t } = useTranslation();
  const state = useInvoiceRowState(props, t);
  return <InvoiceRowItem props={props} state={state} t={t} />;
}
