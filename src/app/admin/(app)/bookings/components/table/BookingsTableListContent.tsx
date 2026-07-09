"use client";

import { useTranslation } from "react-i18next";
import type { Booking } from "../../types";
import type { BookingRowContext, BookingsTableProps, TFn } from "./types";
import { idOf } from "./bookingRowUtils";
import { BookingsBulkActions } from "./BookingsBulkActions";
import { BookingsEmptyState } from "./BookingsEmptyState";
import { BookingsTableHead } from "./BookingsTableHead";
import { BookingTableRow } from "./BookingTableRow";
import { useBookingsTableState } from "./useBookingsTableState";

type TableState = ReturnType<typeof useBookingsTableState>;

export default function BookingsTableListContent(props: BookingsTableProps) {
  const { t, i18n } = useTranslation();
  const state = useBookingsTableState(props);
  const ctx = buildRowContext({ props, state, t, lang: i18n.language });
  if (!props.items.length) return <BookingsEmptyState t={t} />;
  return <BookingsTableLayout props={props} state={state} rowContext={ctx} t={t} />;
}

function BookingsTableLayout(args: LayoutArgs) {
  return <div className="news-table"><BookingsBulkActions {...bulkProps(args)} /><BookingsTableShell items={args.props.items} rowContext={args.rowContext} t={args.t} /></div>;
}

function BookingsTableShell(props: ShellProps) {
  return <div className="news-table__scroll"><BookingsCard {...props} /></div>;
}

function BookingsCard(props: ShellProps) {
  return <section className="card news-list"><div className="news-list__table"><BookingsTableHead t={props.t} /><BookingsRows {...props} /></div></section>;
}

function BookingsRows(props: RowsProps) {
  return <ul className="list list--bleed">{props.items.map((b) => row(b, props.rowContext))}</ul>;
}

function row(b: Booking, rowContext: BookingRowContext) {
  return <BookingTableRow key={idOf(b)} b={b} ctx={rowContext} />;
}

function buildRowContext(args: ContextArgs): BookingRowContext {
  return {
    selectMode: args.props.selectMode,
    selected: args.state.selection.selected,
    onRowClick: (b) => onRowClick(b, args.props, args.state),
    onOpen: args.props.onOpen,
    busyRowId: args.props.busyRowId ?? null,
    t: args.t,
    lang: args.lang,
  };
}

function onRowClick(b: Booking, props: BookingsTableProps, state: TableState) {
  if (props.selectMode && state.busy.any) return;
  const id = idOf(b);
  if (!id) return;
  props.selectMode ? state.selection.toggleOne(id) : props.onOpen(b);
}

function bulkProps(args: LayoutArgs) {
  return { ...bulkCore(args), ...bulkRefs(args), ...bulkHandlers(args), t: args.t };
}

function bulkCore(args: LayoutArgs) {
  return {
    selectMode: args.props.selectMode,
    count: args.state.counts.count,
    restoreCount: args.state.counts.restoreCount,
    busyDelete: args.state.busy.delete,
    busyRestore: args.state.busy.restore,
    itemsLength: args.props.items.length,
    selection: args.state.selection,
  };
}

function bulkRefs(args: LayoutArgs) {
  return {
    toggleBtnRef: args.props.toggleBtnRef,
    cancelBtnRef: args.state.refs.cancelBtnRef,
    clearBtnRef: args.state.refs.clearBtnRef,
  };
}

function bulkHandlers(args: LayoutArgs) {
  return {
    onToggleSelectMode: args.state.handlers.toggleMode,
    onToggleAll: args.state.handlers.toggleAll,
    onClear: args.state.handlers.clearSelection,
    onDelete: args.state.handlers.deleteSelected,
    onRestore: args.state.handlers.restoreSelected,
  };
}

type LayoutArgs = { props: BookingsTableProps; state: TableState; rowContext: BookingRowContext; t: TFn };
type ContextArgs = { props: BookingsTableProps; state: TableState; t: TFn; lang?: string };
type ShellProps = { items: Booking[]; rowContext: BookingRowContext; t: TFn };
type RowsProps = { items: Booking[]; rowContext: BookingRowContext };
