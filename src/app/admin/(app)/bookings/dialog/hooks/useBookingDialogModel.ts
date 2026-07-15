import { useMemo } from "react";
import type { Booking } from "../../types";
import type { BookingDialogModel, Translate } from "../types";
import {
  adminMessageLines,
  inferBookingType,
  inferProgram,
  inferVenue,
  isWeeklyBooking,
} from "../lib/display";
import { asStatus } from "../lib/status";
import {
  messageToLines,
  regularCourseLineFromSchedule,
  safeText,
  splitLabelValue,
  toMessageLine,
} from "../lib/text";

export function useBookingDialogModel(
  booking: Booking,
  t: Translate,
  lang?: string,
): BookingDialogModel {
  const base = useMemo(() => buildBaseModel(booking, t), [booking, t]);
  const messageLines = useMemo(
    () => buildMessageLines(booking, base.isAdminBooking, t, lang),
    [booking, base.isAdminBooking, t, lang],
  );
  return { ...base, messageLines };
}

function buildBaseModel(booking: Booking, t: Translate) {
  const bookingType = inferBookingType(booking);
  const scheduleLine = safeText(booking.meta?.scheduleLine);
  const isWeeklyType = isWeeklyBooking(booking, bookingType);
  return modelFromValues(booking, t, bookingType, scheduleLine, isWeeklyType);
}

function modelFromValues(
  booking: Booking,
  t: Translate,
  bookingType: string,
  scheduleLine: string,
  isWeeklyType: boolean,
) {
  const status = asStatus(booking.status);
  const isOneTimeType = bookingType === "One-Time";
  return {
    ...displayValues(booking, t, bookingType, scheduleLine, isOneTimeType),
    ...actionValues(booking, status, isWeeklyType, isOneTimeType),
    status,
  };
}

function displayValues(
  booking: Booking,
  t: Translate,
  bookingType: string,
  scheduleLine: string,
  isOneTimeType: boolean,
) {
  const regularCourseLine = regularCourseLineFromSchedule(scheduleLine);
  return {
    programText: inferProgram(booking),
    venueText: inferVenue(booking, t),
    bookingType,
    isOneTimeType,
    isWishDate: /schnuppertraining/i.test(booking.message || ""),
    scheduleLine,
    regularCourseLine,
    hasRegularCourseLine:
      isWeeklyBooking(booking, bookingType) && regularCourseLine,
    showInvoiceDetails: booking.paymentStatus === "paid",
    isAdminBooking: booking.source === "admin_booking",
  };
}

function actionValues(
  booking: Booking,
  status: ReturnType<typeof asStatus>,
  isWeeklyType: boolean,
  isOneTimeType: boolean,
) {
  return {
    canShowProcessing:
      status === "pending" && booking.source !== "admin_booking",
    canShowConfirm:
      status !== "confirmed" && status !== "cancelled" && status !== "deleted",
    canShowCancel:
      status !== "cancelled" && status !== "deleted" && status !== "confirmed",
    canShowSubscriptionApprove: canApproveSubscription(
      booking,
      status,
      isWeeklyType,
    ),
    canShowPaymentApprove: canApprovePayment(booking, status, isOneTimeType),
  };
}

function canApproveSubscription(
  booking: Booking,
  status: ReturnType<typeof asStatus>,
  isWeeklyType: boolean,
) {
  return (
    isWeeklyType &&
    status !== "cancelled" &&
    status !== "deleted" &&
    booking.paymentStatus !== "paid"
  );
}

function canApprovePayment(
  booking: Booking,
  status: ReturnType<typeof asStatus>,
  isOneTimeType: boolean,
) {
  return (
    isOneTimeType &&
    status !== "cancelled" &&
    status !== "deleted" &&
    booking.paymentStatus !== "paid"
  );
}

function buildMessageLines(
  booking: Booking,
  isAdminBooking: boolean,
  t: Translate,
  lang?: string,
) {
  const lines = isAdminBooking
    ? adminMessageLines(booking, booking.detail || null, t, lang)
    : publicMessageLines(booking, t);
  return lines.map(toMessageLine);
}

function publicMessageLines(booking: Booking, t: Translate) {
  return messageToLines(booking.message, t).filter((ln) => !isProgramLine(ln));
}

function isProgramLine(line: string) {
  const { label } = splitLabelValue(line);
  return label ? label.toLowerCase().includes("programm") : false;
}
