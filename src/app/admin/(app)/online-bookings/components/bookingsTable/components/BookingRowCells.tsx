import type { ReactNode } from "react";
import type { Booking } from "../../../types";
import { formatDateOnlyDE, programAbbr, safeText } from "../../../utils";
import { getAgeText } from "../lib/bookingRow";
import { renderPayment } from "../lib/bookingPayment";
import { renderStatus } from "../lib/bookingStatus";
import type { Translator } from "../types";

type Props = {
  booking: Booking;
  t: Translator;
  language: string;
};

export default function BookingRowCells({ booking, t, language }: Props) {
  return (
    <>
      <NameCell booking={booking} />
      <TextCell name="email" value={safeText(booking.email) || "—"} />
      <TextCell name="age bookings-mono" value={getAgeText(booking.age)} />
      <TextCell
        name="date bookings-mono"
        value={formatDateOnlyDE(booking.date, language)}
      />
      <TextCell name="program bookings-mono" value={programAbbr(booking)} />
      <TextCell name="status" value={renderStatus(t, booking.status)} />
      <TextCell name="payment" value={renderPayment(t, booking)} />
      <TextCell
        name="created"
        value={formatDateOnlyDE(booking.createdAt, language)}
      />
    </>
  );
}

function NameCell({ booking }: { booking: Booking }) {
  return (
    <div className="news-list__cell news-list__cell--name">
      <div className="news-list__title">
        {safeText(booking.firstName)} {safeText(booking.lastName)}
      </div>
    </div>
  );
}

function TextCell({ name, value }: { name: string; value: ReactNode }) {
  return (
    <div className={`news-list__cell news-list__cell--${name}`}>{value}</div>
  );
}
