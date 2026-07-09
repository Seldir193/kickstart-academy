import type { BookingDialogModel, BookingDialogProps, Translate } from "../types";
import { asStatus, paymentBadgeClass, statusBadgeClass } from "../lib/status";

type Props = BookingDialogProps & { model: BookingDialogModel; t: Translate };

export default function BookingDialogHeader({ booking, model, onClose, t }: Props) {
  return <div className="dialog-head booking-dialog__head"><div className="booking-dialog__head-main"><div className="booking-dialog__title-row"><h2 className="dialog-title booking-dialog__title">{booking.firstName} {booking.lastName}</h2><StatusBadge model={model} t={t} /><PaymentBadge booking={booking} t={t} /></div></div><HeaderActions onClose={onClose} t={t} /></div>;
}

function StatusBadge({ model, t }: { model: BookingDialogModel; t: Translate }) {
  return <span className={statusBadgeClass(model.status)}>{t(`common.admin.bookings.status.${asStatus(model.status)}`)}</span>;
}

function PaymentBadge({ booking, t }: Pick<Props, "booking" | "t">) {
  if (!booking.paymentStatus) return null;
  return <span className={paymentBadgeClass(booking.paymentStatus)}>{t(`common.admin.bookings.payment.${booking.paymentStatus}`)}</span>;
}

function HeaderActions({ onClose, t }: { onClose: () => void; t: Translate }) {
  return <div className="dialog-head__actions"><button type="button" className="dialog-close" aria-label={t("common.admin.bookings.dialog.close")} onClick={onClose}><img src="/icons/close.svg" alt="" aria-hidden="true" className="icon-img" /></button></div>;
}
