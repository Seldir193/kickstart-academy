import type { MouseEvent } from "react";
import type { Booking } from "../../../types";
import type { Translator } from "../types";

type Props = {
  booking: Booking;
  hideEdit: boolean;
  onOpen: (b: Booking) => void;
  t: Translator;
};

export default function BookingRowActionCell({ booking, hideEdit, onOpen, t }: Props) {
  if (hideEdit) return <HiddenActionCell />;

  return (
    <div className="news-list__cell news-list__cell--action" onClick={(e) => open(e, booking, onOpen)} onMouseDown={stop}>
      <EditTrigger t={t} />
    </div>
  );
}

function HiddenActionCell() {
  return <div className="news-list__cell news-list__cell--action news-list__actions--hidden" aria-hidden="true" />;
}

function EditTrigger({ t }: { t: Translator }) {
  return (
    <span className="edit-trigger" role="button" tabIndex={0} aria-label={t("common.admin.onlineBookings.table.edit")}>
      <img src="/icons/edit.svg" alt="" aria-hidden="true" className="icon-img" />
    </span>
  );
}

function open(e: MouseEvent<HTMLDivElement>, b: Booking, onOpen: (b: Booking) => void) {
  e.stopPropagation();
  onOpen(b);
}

function stop(e: MouseEvent<HTMLDivElement>) {
  e.stopPropagation();
}
