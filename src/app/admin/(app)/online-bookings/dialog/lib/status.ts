import type { Booking, Status } from "../../types";
import type { Translate } from "../types";

const STATUSES = ["pending", "processing", "confirmed", "cancelled", "deleted"];
const PAYMENT_STATUSES = ["open", "paid", "returned"];

export function asStatus(s?: Booking["status"]): Status {
  return (s ?? "pending") as Status;
}

export function renderStatus(t: Translate, status?: Booking["status"]) {
  const value = asStatus(status);
  if (!STATUSES.includes(value)) return value;
  return t(`common.admin.onlineBookings.status.${value}`);
}

export function renderPaymentStatus(t: Translate, status?: Booking["paymentStatus"]) {
  if (!status) return "—";
  if (!PAYMENT_STATUSES.includes(status)) return status;
  return t(`common.admin.onlineBookings.payment.${status}`);
}

export function statusBadgeClass(status?: Booking["status"]) {
  const value = asStatus(status);
  return value === "cancelled" || value === "deleted" ? "badge badge-muted" : "badge";
}

export function paymentBadgeClass(status?: Booking["paymentStatus"]) {
  if (status === "paid") return "badge badge-success";
  if (status === "returned") return "badge badge-danger";
  return "badge";
}
