import type { Booking } from "../../types";
import type { TFn } from "./types";
import {
  asStatus,
  bookingAge,
  formatDateOnly,
  paymentClass,
  paymentStatus,
  programAbbr,
  safeText,
} from "./bookingRowUtils";

export function BookingNameCell({ b }: { b: Booking }) {
  return (
    <div className="news-list__cell news-list__cell--name">
      <div className="news-list__title">
        {safeText(b.firstName)} {safeText(b.lastName)}
      </div>
    </div>
  );
}

export function BookingEmailCell({ b, t }: { b: Booking; t: TFn }) {
  return cell(
    "email",
    safeText(b.email) || t("common.admin.bookings.row.empty"),
  );
}

export function BookingAgeCell({ b }: { b: Booking }) {
  return cell("age bookings-mono", bookingAge(b));
}

export function BookingDateCell({ b, lang }: { b: Booking; lang?: string }) {
  return cell("date bookings-mono", formatDateOnly(b.date, lang));
}

export function BookingProgramCell({ b }: { b: Booking }) {
  return cell("program bookings-mono", programAbbr(b));
}

export function BookingStatusCell({ b, t }: { b: Booking; t: TFn }) {
  return cell(
    "status",
    t(`common.admin.bookings.status.${asStatus(b.status)}`),
  );
}

export function BookingCreatedCell({ b, lang }: { b: Booking; lang?: string }) {
  return cell("created", formatDateOnly(b.createdAt, lang));
}

export function BookingPaymentCell({ b, t }: { b: Booking; t: TFn }) {
  const p = paymentStatus(b);
  if (!p) return cell("payment", t("common.admin.bookings.row.empty"));
  return paymentBadge(p, t);
}

function cell(mod: string, value: string) {
  return (
    <div className={`news-list__cell news-list__cell--${mod}`}>{value}</div>
  );
}

function paymentBadge(p: string, t: TFn) {
  return (
    <div className="news-list__cell news-list__cell--payment">
      <span className={paymentClass(p)}>
        {t(`common.admin.bookings.payment.${p}`)}
      </span>
    </div>
  );
}
