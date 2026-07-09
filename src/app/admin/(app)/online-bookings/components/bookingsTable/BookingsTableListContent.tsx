"use client";

import { useTranslation } from "react-i18next";
import type { Booking } from "../../types";
import { idOf } from "./lib/bookingRow";
import { useBookingsTableSelection } from "./hooks/useBookingsTableSelection";
import BookingsTableBulkActions from "./components/BookingsTableBulkActions";
import BookingsTableEmptyState from "./components/BookingsTableEmptyState";
import BookingsTableSection from "./components/BookingsTableSection";
import type { BookingsTableListProps } from "./types";

export default function BookingsTableListContent(props: BookingsTableListProps) {
  const i18n = useTranslation();
  const table = useBookingsTableSelection(props.items, props.selectMode);
  const onRowClick = createRowClick(props, table);

  return renderContent(props, table, onRowClick, i18n.t, i18n.i18n.language);
}

function renderContent(
  props: BookingsTableListProps,
  table: ReturnType<typeof useBookingsTableSelection>,
  onRowClick: (b: Booking) => void,
  t: ReturnType<typeof useTranslation>["t"],
  language: string,
) {
  if (!props.items.length) return <BookingsTableEmptyState busy={props.busy} t={t} />;

  return <TableView props={props} table={table} onRowClick={onRowClick} t={t} language={language} />;
}

function TableView(props: ViewProps) {
  return (
    <div className="news-table">
      <BookingsTableBulkActions {...props.props} table={props.table} t={props.t} />
      <BookingsTableSection {...sectionProps(props)} />
    </div>
  );
}

function sectionProps({ props, table, onRowClick, t, language }: ViewProps) {
  return {
    items: props.items,
    selectMode: props.selectMode,
    selected: table.sel.selected,
    onOpen: props.onOpen,
    onRowClick,
    t,
    language,
  };
}

function createRowClick(
  props: BookingsTableListProps,
  table: ReturnType<typeof useBookingsTableSelection>,
) {
  return (b: Booking) => handleRowClick(props, table, b);
}

function handleRowClick(
  props: BookingsTableListProps,
  table: ReturnType<typeof useBookingsTableSelection>,
  b: Booking,
) {
  const id = idOf(b);
  if (!id) return;
  props.selectMode ? table.sel.toggleOne(id) : props.onOpen(b);
}

type ViewProps = {
  props: BookingsTableListProps;
  table: ReturnType<typeof useBookingsTableSelection>;
  onRowClick: (b: Booking) => void;
  t: ReturnType<typeof useTranslation>["t"];
  language: string;
};
