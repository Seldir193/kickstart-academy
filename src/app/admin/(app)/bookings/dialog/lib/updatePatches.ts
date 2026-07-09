import type { Booking } from "../../types";

type ApiData = Record<string, string | null | undefined> | null;

export function subscriptionEnabledPatch(booking: Booking, data: ApiData) {
  return { meta: { ...booking.meta, subscriptionEligible: true, subscriptionEligibleAt: data?.subscriptionEligibleAt || new Date().toISOString() } };
}

export function subscriptionDisabledPatch(booking: Booking, data: ApiData) {
  return { meta: { ...booking.meta, subscriptionEligible: false, subscriptionEligibleAt: data?.subscriptionEligibleAt || null } };
}

export function paymentApprovedPatch(booking: Booking, data: ApiData) {
  return { meta: { ...booking.meta, paymentApprovalRequired: false, paymentApprovedAt: data?.paymentApprovedAt || new Date().toISOString(), paymentApprovedEmailSentAt: data?.paymentApprovedEmailSentAt || null } };
}
