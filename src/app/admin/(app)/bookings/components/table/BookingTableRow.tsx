import type { KeyboardEvent } from "react";
import type { Booking } from "../../types";
import type { BookingRowContext } from "./types";
import {
  idOf,
  labelOpen,
  labelSelect,
  onKeyActivate,
} from "./bookingRowUtils";
import { BookingRowAction } from "./BookingRowAction";
import {
  BookingAgeCell,
  BookingCreatedCell,
  BookingDateCell,
  BookingEmailCell,
  BookingNameCell,
  BookingPaymentCell,
  BookingProgramCell,
  BookingStatusCell,
} from "./BookingRowCells";

type RowModel = ReturnType<typeof rowModel>;

export function BookingTableRow({ b, ctx }: { b: Booking; ctx: BookingRowContext }) {
  return <BookingRowShell b={b} ctx={ctx} model={rowModel(b, ctx)} />;
}

function BookingRowShell(props: { b: Booking; ctx: BookingRowContext; model: RowModel }) {
  const { b, ctx, model } = props;
  return (
    <li key={model.id} {...rowProps(b, ctx, model)}>
      <BookingCells b={b} ctx={ctx} />
      <BookingAction b={b} ctx={ctx} model={model} />
    </li>
  );
}

function BookingCells({ b, ctx }: { b: Booking; ctx: BookingRowContext }) {
  return (
    <>
      <BookingNameCell b={b} />
      <BookingEmailCell b={b} t={ctx.t} />
      <BookingAgeCell b={b} />
      <BookingDateCell b={b} lang={ctx.lang} />
      <BookingProgramCell b={b} />
      <BookingStatusCell b={b} t={ctx.t} />
      <BookingPaymentCell b={b} t={ctx.t} />
      <BookingCreatedCell b={b} lang={ctx.lang} />
    </>
  );
}

function BookingAction(props: { b: Booking; ctx: BookingRowContext; model: RowModel }) {
  const { b, ctx, model } = props;
  return <BookingRowAction b={b} hidden={model.hideEdit} rowBusy={model.rowBusy} onOpen={ctx.onOpen} t={ctx.t} />;
}

function rowModel(b: Booking, ctx: BookingRowContext) {
  const id = idOf(b);
  const checked = ctx.selected.has(id);
  const rowBusy = Boolean(ctx.busyRowId && ctx.busyRowId === id);
  return { id, checked, rowBusy, hideEdit: ctx.selectMode || checked };
}

function rowProps(b: Booking, ctx: BookingRowContext, model: RowModel) {
  return {
    className: rowClass(model.checked, ctx.selectMode),
    onClick: () => ctx.onRowClick(b),
    onKeyDown: (e: KeyboardEvent) => onKeyActivate(e, () => ctx.onRowClick(b)),
    tabIndex: 0,
    role: "button",
    "aria-pressed": ctx.selectMode ? model.checked : undefined,
    "aria-label": ctx.selectMode ? labelSelect(b, ctx.t) : labelOpen(b, ctx.t),
  };
}

function rowClass(checked: boolean, selectMode: boolean) {
  const base = "list__item chip news-list__row is-fullhover is-interactive";
  return [base, checked ? "is-selected" : "", selectMode ? "is-selectmode" : ""].join(" ");
}
