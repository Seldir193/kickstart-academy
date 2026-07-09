import { useState } from "react";
import { toastErrorMessage } from "@/lib/toast-messages";
import { fetchCustomer, postCancel } from "../../api";
import { todayISO } from "../../formatters";
import type { CancelBookingsState, CancelSubmitState, TFunc } from "../types";
import type { Customer } from "../../../../types";

export function useCancelSubmit(
  customer: Customer,
  bookings: CancelBookingsState,
  onClose: () => void,
  onChanged: (freshCustomer: Customer) => void,
  t: TFunc,
): CancelSubmitState {
  const state = useSubmitFields();
  const derived = submitDerived(state, bookings);
  const submit = () => submitCancel(customer, bookings, state, onClose, onChanged, t);
  return { ...state, ...derived, submit };
}

function useSubmitFields() {
  const [cancelDate, setCancelDate] = useState(todayISO());
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  return { cancelDate, setCancelDate, endDate, setEndDate, reason, setReason, saving, setSaving };
}

function submitDerived(state: ReturnType<typeof useSubmitFields>, bookings: CancelBookingsState) {
  const endBeforeStart = Boolean(state.endDate && state.cancelDate && state.endDate < state.cancelDate);
  const disabledByNonCancelableCourse = bookings.courseValueIsNonCancelable;
  const disabled = submitDisabled(state, bookings, endBeforeStart, disabledByNonCancelableCourse);
  return { endBeforeStart, disabledByNonCancelableCourse, disabled };
}

function submitDisabled(state: ReturnType<typeof useSubmitFields>, bookings: CancelBookingsState, endBeforeStart: boolean, disabledByNonCancelableCourse: boolean) {
  return state.saving || !bookings.selected || !state.cancelDate || !state.endDate || bookings.selectedIsCancelled || endBeforeStart || disabledByNonCancelableCourse;
}

async function submitCancel(customer: Customer, bookings: CancelBookingsState, state: ReturnType<typeof useSubmitFields>, onClose: () => void, onChanged: (freshCustomer: Customer) => void, t: TFunc) {
  if (!canSubmit(customer, bookings, state)) return;
  state.setSaving(true);
  bookings.setErr(null);
  await postCancelWithHandling(customer, bookings, state, onClose, onChanged, t);
}

function canSubmit(customer: Customer, bookings: CancelBookingsState, state: ReturnType<typeof useSubmitFields>) {
  if (!customer._id || !bookings.selected?._id) return false;
  if (!state.cancelDate || !state.endDate) return false;
  return !bookings.courseValueIsNonCancelable;
}

async function postCancelWithHandling(customer: Customer, bookings: CancelBookingsState, state: ReturnType<typeof useSubmitFields>, onClose: () => void, onChanged: (freshCustomer: Customer) => void, t: TFunc) {
  try {
    await postCancel(customer._id, bookings.selected._id, state.cancelDate, state.endDate, state.reason);
    await refreshAfterCancel(customer, onChanged);
    onClose();
  } catch (e: unknown) {
    bookings.setErr(toastErrorMessage(t, e, "common.admin.customers.cancelDialog.errors.cancelFailed"));
  } finally {
    state.setSaving(false);
  }
}

async function refreshAfterCancel(customer: Customer, onChanged: (freshCustomer: Customer) => void) {
  const fresh = await fetchCustomer(customer._id);
  if (fresh) onChanged(fresh);
}
