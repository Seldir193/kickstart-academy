import type { Booking } from "../../types";

export function successMessageKey(action: string) {
  if (action === "confirm") return "common.admin.onlineBookings.notice.confirmedWithInvoice";
  if (action === "resend") return "common.admin.onlineBookings.notice.confirmationResent";
  if (action === "processing") return statusUpdatedKey();
  if (action === "cancelled") return statusUpdatedKey();
  if (action === "delete") return "common.admin.onlineBookings.notice.deleted";
  if (action === "cancelConfirmed") return "common.admin.onlineBookings.notice.cancelledConfirmed";
  if (action === "approvePayment") return "common.admin.onlineBookings.notice.paymentApproved";
  return "common.admin.onlineBookings.dialog.error.actionFailed";
}

function statusUpdatedKey() {
  return "common.admin.onlineBookings.notice.statusUpdated";
}

export function dialogFlags(booking: Booking) {
  const s = booking.status ?? "pending";
  return {
    s,
    showInvoiceDetails: booking.paymentStatus === "paid",
    canShowProcessing: false,
    canShowConfirm: !["confirmed", "cancelled", "deleted"].includes(s),
    canShowCancel: !["cancelled", "deleted", "confirmed"].includes(s),
    canShowPaymentApprove: canApprovePayment(booking, s),
  };
}

function canApprovePayment(booking: Booking, status: string) {
  return !["cancelled", "deleted"].includes(status) && booking.paymentStatus !== "paid";
}
