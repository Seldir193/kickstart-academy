import { useState } from "react";
import { setSubscriptionEligible, weeklyApproveBooking } from "../../api";
import { toastErrorMessage, toastText } from "@/lib/toast-messages";
import type {
  BookingDialogActions,
  BookingDialogProps,
  Translate,
} from "../types";
import { successMessageKey } from "../lib/actionMessages";
import { approvePaymentRequest } from "../lib/paymentApproval";
import {
  paymentApprovedPatch,
  subscriptionDisabledPatch,
  subscriptionEnabledPatch,
} from "../lib/updatePatches";

export function useBookingDialogActions(
  props: BookingDialogProps,
  t: Translate,
): BookingDialogActions {
  const [busy, setBusy] = useState("");
  const run = createRunner(props, t, busy, setBusy);
  return buildActions(props, t, busy, run);
}

function buildActions(
  props: BookingDialogProps,
  t: Translate,
  busy: string,
  run: Runner,
) {
  return {
    busy,
    runProcessing: () =>
      run("processing", () => props.onSetStatus("processing")),
    runConfirm: () => run("confirm", props.onConfirm),
    runResend: () => run("resend", props.onResend),
    runCancelConfirmed: () => run("cancelConfirmed", props.onCancelConfirmed),
    runCancel: () => run("cancelled", () => props.onSetStatus("cancelled")),
    runSubscriptionApprove: () => run("eligible", () => setSubscription(props)),
    runPaymentApprove: () =>
      run("approvePayment", () => approvePayment(props, t)),
    runDelete: () => run("delete", props.onDelete),
  };
}

type Runner = (action: string, fn: () => Promise<unknown>) => void;

function createRunner(
  props: BookingDialogProps,
  t: Translate,
  busy: string,
  setBusy: (value: string) => void,
): Runner {
  return (action, fn) => runAction(props, t, busy, setBusy, action, fn);
}

async function runAction(
  props: BookingDialogProps,
  t: Translate,
  busy: string,
  setBusy: (value: string) => void,
  action: string,
  fn: () => Promise<unknown>,
) {
  if (busy) return;
  try {
    setBusy(action);
    await fn();
    afterSuccess(props, t, action);
  } catch (e: unknown) {
    props.notify(
      toastErrorMessage(
        t,
        e,
        "common.admin.bookings.dialog.error.actionFailed",
      ),
    );
  } finally {
    setBusy("");
  }
}

function afterSuccess(props: BookingDialogProps, t: Translate, action: string) {
  props.notify(toastText(t, successMessageKey(action)));
  if (action === "delete") props.onClose();
}

async function setSubscription(props: BookingDialogProps) {
  return props.booking.meta?.subscriptionEligible
    ? disableSubscription(props)
    : enableSubscription(props);
}

async function enableSubscription(props: BookingDialogProps) {
  const data = await weeklyApproveBooking(props.booking._id);
  props.onUpdateBooking(subscriptionEnabledPatch(props.booking, data));
}

async function disableSubscription(props: BookingDialogProps) {
  const data = await setSubscriptionEligible({
    id: props.booking._id,
    eligible: false,
  });
  props.onUpdateBooking(subscriptionDisabledPatch(props.booking, data));
}

async function approvePayment(props: BookingDialogProps, t: Translate) {
  const data = await approvePaymentRequest(props.booking._id, t);
  props.onUpdateBooking(paymentApprovedPatch(props.booking, data));
}
