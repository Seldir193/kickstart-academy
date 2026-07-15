import { useState } from "react";
import { toastErrorMessage } from "@/lib/toast-messages";
import { fetchCustomer, postStornoMail, postStornoStatus } from "../../api";
import type { Customer } from "../../../../types";
import type { StornoBookingsState, StornoSubmitState, TFunc } from "../types";

export function useStornoSubmit(
  customer: Customer,
  bookings: StornoBookingsState,
  onClose: () => void,
  onChanged: (freshCustomer: Customer) => void,
  t: TFunc,
): StornoSubmitState {
  const state = useSubmitFields();
  const disabled = state.saving || !bookings.selected || bookings.isCancelled;
  const submit = () =>
    submitStorno(customer, bookings, state, onClose, onChanged, t);
  return { ...state, disabled, submit };
}

function useSubmitFields() {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  return { note, setNote, saving, setSaving };
}

async function submitStorno(
  customer: Customer,
  bookings: StornoBookingsState,
  state: ReturnType<typeof useSubmitFields>,
  onClose: () => void,
  onChanged: (freshCustomer: Customer) => void,
  t: TFunc,
) {
  if (!canSubmit(customer, bookings)) return;
  state.setSaving(true);
  bookings.setErr(null);
  await postStornoWithHandling(
    customer,
    bookings,
    state,
    onClose,
    onChanged,
    t,
  );
}

function canSubmit(customer: Customer, bookings: StornoBookingsState) {
  return Boolean(customer._id && bookings.selected?._id);
}

async function postStornoWithHandling(
  customer: Customer,
  bookings: StornoBookingsState,
  state: ReturnType<typeof useSubmitFields>,
  onClose: () => void,
  onChanged: (freshCustomer: Customer) => void,
  t: TFunc,
) {
  try {
    await postStornoStatus(customer._id, bookings.selected._id, state.note);
    await postStornoMail(customer._id, bookings.selected._id, state.note);
    await refreshAfterStorno(customer, onChanged);
    onClose();
  } catch (e: unknown) {
    bookings.setErr(
      toastErrorMessage(
        t,
        e,
        "common.admin.customers.stornoDialog.errors.cancelFailed",
      ),
    );
  } finally {
    state.setSaving(false);
  }
}

async function refreshAfterStorno(
  customer: Customer,
  onChanged: (freshCustomer: Customer) => void,
) {
  const fresh = await fetchCustomer(customer._id);
  if (fresh) onChanged(fresh);
}
