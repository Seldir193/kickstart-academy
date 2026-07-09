import type { Booking } from "../../../types";
import type { Translator } from "../types";

export function renderPayment(t: Translator, b: Booking) {
  const payment = String(b?.paymentStatus || "").trim().toLowerCase();
  if (!payment) return "—";

  return <span className={paymentClassName(payment)}>{paymentLabel(t, payment)}</span>;
}

function paymentClassName(payment: string) {
  if (payment === "paid") return "badge badge-success";
  if (payment === "returned") return "badge badge-danger";
  return "badge";
}

function paymentLabel(t: Translator, payment: string) {
  if (payment === "open") return t("common.admin.onlineBookings.payment.open");
  if (payment === "paid") return t("common.admin.onlineBookings.payment.paid");
  if (payment === "returned") {
    return t("common.admin.onlineBookings.payment.returned");
  }

  return payment;
}
