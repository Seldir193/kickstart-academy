import type { Booking } from "../../types";
import { formatDateOnlyDE, formatDateTimeDE } from "../../utils";
import type { OnlineBookingDialogState } from "../hooks/useOnlineBookingDialogState";
import { stripProgramTitle } from "../lib/formatters";

type DetailRow = {
  label: string;
  value: string | number;
  full?: boolean;
};

export function BookingDetailsSection({
  booking,
  state,
}: {
  booking: Booking;
  state: OnlineBookingDialogState;
}) {
  const rows = bookingDetailRows(booking, state);
  return (
    <section className="dialog-section online-booking-dialog__section">
      <SectionHead
        title={state.t("common.admin.onlineBookings.dialog.section.booking")}
      />
      <div className="dialog-section__body">
        <div className="online-booking-dialog__details">
          {rows.map((row) => (
            <BookingDetailRow key={row.label} row={row} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHead({ title }: { title: string }) {
  return (
    <div className="dialog-section__head">
      <h3 className="dialog-section__title online-booking-dialog__section-title">
        {title}
      </h3>
    </div>
  );
}

function BookingDetailRow({ row }: { row: DetailRow }) {
  const className = row.full
    ? "online-booking-dialog__row online-booking-dialog__row--full"
    : "online-booking-dialog__row";
  return (
    <div className={className}>
      <div className="dialog-label">{row.label}</div>
      <div className="dialog-value">{row.value}</div>
    </div>
  );
}

function bookingDetailRows(booking: Booking, state: OnlineBookingDialogState) {
  const rows = baseBookingRows(booking, state);
  return state.flags.showInvoiceDetails
    ? [...rows, ...invoiceRows(booking, state)]
    : rows;
}

function baseBookingRows(
  booking: Booking,
  state: OnlineBookingDialogState,
): DetailRow[] {
  return [
    programRow(booking, state),
    venueRow(booking, state),
    nameRow(booking, state),
    emailRow(booking, state),
    ageRow(booking, state),
    dateRow(booking, state),
    createdRow(booking, state),
    paymentApprovedRow(booking, state),
    codeRow(booking, state),
  ];
}

function programRow(
  booking: Booking,
  state: OnlineBookingDialogState,
): DetailRow {
  return fullRow(state, "program", stripProgramTitle(booking.offerTitle));
}

function venueRow(
  booking: Booking,
  state: OnlineBookingDialogState,
): DetailRow {
  return fullRow(state, "venue", booking.venue || "—");
}

function nameRow(booking: Booking, state: OnlineBookingDialogState): DetailRow {
  return detailRow(state, "name", `${booking.firstName} ${booking.lastName}`);
}

function emailRow(
  booking: Booking,
  state: OnlineBookingDialogState,
): DetailRow {
  return detailRow(state, "email", booking.email || "—");
}

function ageRow(booking: Booking, state: OnlineBookingDialogState): DetailRow {
  return detailRow(state, "age", booking.age ?? "—");
}

function dateRow(booking: Booking, state: OnlineBookingDialogState): DetailRow {
  return detailRow(
    state,
    "dateStart",
    formatDateOnlyDE(booking.date, state.i18n.language),
  );
}

function createdRow(
  booking: Booking,
  state: OnlineBookingDialogState,
): DetailRow {
  return detailRow(
    state,
    "created",
    formatDateTimeDE(booking.createdAt, state.i18n.language),
  );
}

function paymentApprovedRow(
  booking: Booking,
  state: OnlineBookingDialogState,
): DetailRow {
  return detailRow(
    state,
    "paymentApprovedAt",
    paymentApprovedValue(booking, state),
  );
}

function paymentApprovedValue(
  booking: Booking,
  state: OnlineBookingDialogState,
) {
  return booking.meta?.paymentApprovedAt
    ? formatDateTimeDE(booking.meta.paymentApprovedAt, state.i18n.language)
    : "—";
}

function codeRow(booking: Booking, state: OnlineBookingDialogState): DetailRow {
  return detailRow(state, "confirmationCode", booking.confirmationCode || "—");
}

function invoiceRows(
  booking: Booking,
  state: OnlineBookingDialogState,
): DetailRow[] {
  return [invoiceNumberRow(booking, state), invoiceDateRow(booking, state)];
}

function invoiceNumberRow(
  booking: Booking,
  state: OnlineBookingDialogState,
): DetailRow {
  return detailRow(
    state,
    "invoiceNumber",
    booking.invoiceNumber || booking.invoiceNo || "—",
  );
}

function invoiceDateRow(
  booking: Booking,
  state: OnlineBookingDialogState,
): DetailRow {
  return detailRow(
    state,
    "invoiceDate",
    formatDateOnlyDE(booking.invoiceDate, state.i18n.language),
  );
}

function fullRow(
  state: OnlineBookingDialogState,
  key: string,
  value: string,
): DetailRow {
  return { label: fieldLabel(state, key), value, full: true };
}

function detailRow(
  state: OnlineBookingDialogState,
  key: string,
  value: string | number,
): DetailRow {
  return { label: fieldLabel(state, key), value };
}

function fieldLabel(state: OnlineBookingDialogState, key: string) {
  return state.t(`common.admin.onlineBookings.dialog.field.${key}`);
}
