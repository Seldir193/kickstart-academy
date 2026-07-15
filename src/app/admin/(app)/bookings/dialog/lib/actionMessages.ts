const successKeys: Record<string, string> = {
  processing: "common.admin.bookings.notice.statusUpdated",
  cancelled: "common.admin.bookings.notice.statusUpdated",
  confirm: "common.admin.bookings.notice.confirmed",
  resend: "common.admin.bookings.notice.confirmationResent",
  cancelConfirmed: "common.admin.bookings.notice.cancelledConfirmed",
  delete: "common.admin.bookings.notice.deleted",
  restore: "common.admin.bookings.notice.restored",
  eligible: "common.admin.bookings.notice.subscriptionUpdated",
  approvePayment: "common.admin.bookings.notice.paymentApproved",
};

export function successMessageKey(action: string) {
  return (
    successKeys[action] || "common.admin.bookings.dialog.error.actionFailed"
  );
}
