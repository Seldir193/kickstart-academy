import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toastErrorMessage, toastText } from "@/lib/toast-messages";
import { buildHolidayRows } from "../lib/messageRows";
import { dialogFlags, successMessageKey } from "../lib/actions";
import type { OnlineBookingDialogProps, Translate } from "../types";

export function useOnlineBookingDialogState(props: OnlineBookingDialogProps) {
  const { t, i18n } = useTranslation();
  const [busy, setBusy] = useState("");
  const flags = dialogFlags(props.booking);
  const messageRows = useDialogMessageRows(props, t, i18n.language);
  const run = useRunAction(props, t, busy, setBusy);
  return { t, i18n, busy, flags, messageRows, run };
}

function useDialogMessageRows(
  props: OnlineBookingDialogProps,
  t: Translate,
  lang: string,
) {
  return useMemo(
    () => buildHolidayRows(t, lang, props.booking),
    [t, lang, props.booking],
  );
}

function useRunAction(
  props: OnlineBookingDialogProps,
  t: Translate,
  busy: string,
  setBusy: (value: string) => void,
) {
  return async (action: string, fn: () => Promise<unknown>) => {
    if (busy) return;
    await executeAction(props, t, action, fn, setBusy);
  };
}

async function executeAction(
  props: OnlineBookingDialogProps,
  t: Translate,
  action: string,
  fn: () => Promise<unknown>,
  setBusy: (value: string) => void,
) {
  try {
    setBusy(action);
    await fn();
    handleActionSuccess(props, t, action);
  } catch (e) {
    handleActionError(props, t, e);
  } finally {
    setBusy("");
  }
}

function handleActionSuccess(
  props: OnlineBookingDialogProps,
  t: Translate,
  action: string,
) {
  props.notify(toastText(t, successMessageKey(action)));
  if (action === "delete") props.onClose();
}

function handleActionError(
  props: OnlineBookingDialogProps,
  t: Translate,
  error: unknown,
) {
  props.notify(
    toastErrorMessage(
      t,
      error,
      "common.admin.onlineBookings.dialog.error.actionFailed",
    ),
  );
}

export async function approvePayment(props: OnlineBookingDialogProps) {
  await props.onApprovePayment();
  props.onUpdateBooking({ meta: approvedPaymentMeta(props) });
}

function approvedPaymentMeta(props: OnlineBookingDialogProps) {
  return {
    ...props.booking.meta,
    paymentApprovalRequired: false,
    paymentApprovedAt: new Date().toISOString(),
  };
}

export type OnlineBookingDialogState = ReturnType<
  typeof useOnlineBookingDialogState
>;
