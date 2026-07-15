import type { KeyboardEvent } from "react";
import type { Booking } from "../../../types";
import {
  getRowClassName,
  idOf,
  onKeyActivate,
  rowLabel,
} from "../lib/bookingRow";
import type { Translator } from "../types";
import BookingRowActionCell from "./BookingRowActionCell";
import BookingRowCells from "./BookingRowCells";

type Props = {
  booking: Booking;
  selectMode: boolean;
  selected: Set<string>;
  onOpen: (b: Booking) => void;
  onRowClick: (b: Booking) => void;
  t: Translator;
  language: string;
};

export default function BookingTableRow(props: Props) {
  const model = getRowModel(props);

  return (
    <li {...rowProps(props, model)}>
      <BookingRowCells
        booking={props.booking}
        t={props.t}
        language={props.language}
      />
      <BookingRowActionCell {...props} hideEdit={model.hideEdit} />
    </li>
  );
}

function getRowModel(props: Props) {
  const id = idOf(props.booking);
  const checked = props.selected.has(id);

  return { id, checked, hideEdit: props.selectMode || checked };
}

function rowProps(props: Props, model: ReturnType<typeof getRowModel>) {
  return {
    className: getRowClassName(model.checked, props.selectMode),
    onClick: () => props.onRowClick(props.booking),
    onKeyDown: (e: KeyboardEvent<HTMLLIElement>) =>
      onKeyActivate(e, () => props.onRowClick(props.booking)),
    tabIndex: 0,
    role: "button" as const,
    "aria-pressed": props.selectMode ? model.checked : undefined,
    "aria-label": rowLabel(props.t, props.booking, props.selectMode),
  };
}
