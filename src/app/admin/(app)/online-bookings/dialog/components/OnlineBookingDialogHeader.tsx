import type { Booking } from "../../types";
import {
  paymentBadgeClass,
  renderPaymentStatus,
  renderStatus,
  statusBadgeClass,
} from "../lib/status";
import type { Translate } from "../types";

type Props = {
  booking: Booking;
  onClose: () => void;
  t: Translate;
};

export function OnlineBookingDialogHeader({ booking, onClose, t }: Props) {
  return (
    <div className="dialog-head online-booking-dialog__head">
      <HeaderMain booking={booking} t={t} />
      <CloseAction onClose={onClose} t={t} />
    </div>
  );
}

function HeaderMain({ booking, t }: { booking: Booking; t: Translate }) {
  return (
    <div className="online-booking-dialog__head-main">
      <TitleRow booking={booking} t={t} />
    </div>
  );
}

function TitleRow({ booking, t }: { booking: Booking; t: Translate }) {
  return (
    <div className="online-booking-dialog__title-row">
      <h2 className="dialog-title online-booking-dialog__title">
        {booking.firstName} {booking.lastName}
      </h2>
      <StatusBadge booking={booking} t={t} />
      <PaymentBadge booking={booking} t={t} />
    </div>
  );
}

function StatusBadge({ booking, t }: { booking: Booking; t: Translate }) {
  return (
    <span className={statusBadgeClass(booking.status)}>
      {renderStatus(t, booking.status)}
    </span>
  );
}

function PaymentBadge({ booking, t }: { booking: Booking; t: Translate }) {
  if (!booking.paymentStatus) return null;
  return (
    <span className={paymentBadgeClass(booking.paymentStatus)}>
      {renderPaymentStatus(t, booking.paymentStatus)}
    </span>
  );
}

function CloseAction({ onClose, t }: { onClose: () => void; t: Translate }) {
  return (
    <div className="dialog-head__actions">
      <button
        type="button"
        className="dialog-close"
        aria-label={t("common.admin.onlineBookings.dialog.close")}
        onClick={onClose}
      >
        <img
          src="/icons/close.svg"
          alt=""
          aria-hidden="true"
          className="icon-img"
        />
      </button>
    </div>
  );
}
