import type { Booking, Status } from "../../types";

export function asStatus(s?: Booking["status"]): Status {
  return (s ?? "pending") as Status;
}

export function statusBadgeClass(status: Status) {
  return status === "cancelled" || status === "deleted"
    ? "badge badge-muted"
    : "badge";
}

export function paymentBadgeClass(status?: Booking["paymentStatus"]) {
  if (status === "paid") return "badge badge-success";
  if (status === "returned") return "badge badge-danger";
  return "badge";
}
