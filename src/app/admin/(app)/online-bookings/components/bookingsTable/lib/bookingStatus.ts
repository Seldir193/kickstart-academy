import type { Booking } from "../../../types";
import { asStatus } from "../../../utils";
import type { Translator } from "../types";

export function renderStatus(t: Translator, status?: Booking["status"]) {
  const value = asStatus(status);
  const key = statusKey(value);

  return key ? t(`common.admin.onlineBookings.status.${key}`) : value;
}

function statusKey(value: string) {
  if (value === "pending") return "pending";
  if (value === "processing") return "processing";
  if (value === "confirmed") return "confirmed";
  if (value === "cancelled") return "cancelled";
  if (value === "deleted") return "deleted";
  return "";
}
