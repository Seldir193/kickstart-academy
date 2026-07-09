import type { SyntheticEvent } from "react";
import type { Booking } from "../../types";
import type { TFn } from "./types";
import { stopAndRun } from "./bookingRowUtils";

type ActionProps = {
  b: Booking;
  hidden: boolean;
  rowBusy: boolean;
  onOpen: (b: Booking) => void;
  t: TFn;
};

type VisibleProps = Omit<ActionProps, "hidden">;

export function BookingRowAction(props: ActionProps) {
  if (props.hidden) return <HiddenAction />;
  return <VisibleAction {...props} />;
}

function HiddenAction() {
  return <div className="news-list__cell news-list__cell--action news-list__actions--hidden" aria-hidden="true" />;
}

function VisibleAction(props: VisibleProps) {
  return <div {...visibleActionProps(props)}><EditTrigger rowBusy={props.rowBusy} t={props.t} /></div>;
}

function visibleActionProps(props: VisibleProps) {
  return {
    className: "news-list__cell news-list__cell--action",
    onClick: (e: SyntheticEvent) => stopAndRun(e, () => props.onOpen(props.b)),
    onMouseDown: (e: SyntheticEvent) => e.stopPropagation(),
  };
}

function EditTrigger({ rowBusy, t }: { rowBusy: boolean; t: TFn }) {
  return (
    <span className="edit-trigger" role="button" tabIndex={0} aria-label={t("common.admin.bookings.row.openAction")} aria-disabled={rowBusy ? true : undefined}>
      <img src="/icons/edit.svg" alt="" aria-hidden="true" className="icon-img" />
    </span>
  );
}
