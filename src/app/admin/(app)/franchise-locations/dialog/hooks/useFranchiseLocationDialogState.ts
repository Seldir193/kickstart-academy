import { useEffect, useMemo, useState } from "react";
import type { TFunction } from "i18next";
import { buildForm, buildPayload } from "../lib/form";
import type { FranchiseLocationDialogProps } from "../types";

export function useFranchiseLocationDialogState(
  props: FranchiseLocationDialogProps,
  t: TFunction,
) {
  const isEdit = Boolean(props.initial?.id);
  const title = useDialogTitle(isEdit, t);
  const state = useDialogState(props);
  const actions = useDialogActions(props, state, t);
  return { ...state, actions, isEdit, title };
}

function useDialogTitle(isEdit: boolean, t: TFunction) {
  return useMemo(
    () => getDialogTitle(isEdit, t),
    [isEdit, t],
  );
}

function getDialogTitle(isEdit: boolean, t: TFunction) {
  return isEdit
    ? t("common.admin.franchiseLocations.formDialog.titleEdit")
    : t("common.admin.franchiseLocations.formDialog.titleAdd");
}

function useDialogState(props: FranchiseLocationDialogProps) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState(() => buildForm(props.initial));
  useResetEffect(props, setBusy, setErr, setForm);
  useEscapeClose(props.open, props.onClose);
  return { busy, err, form, setBusy, setErr, setForm };
}

function useResetEffect(
  props: FranchiseLocationDialogProps,
  setBusy: (value: boolean) => void,
  setErr: (value: string | null) => void,
  setForm: (value: ReturnType<typeof buildForm>) => void,
) {
  useEffect(() => {
    if (!props.open) return;
    setErr(null);
    setBusy(false);
    setForm(buildForm(props.initial));
  }, [props.open, props.initial?.id]);
}

function useEscapeClose(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e: KeyboardEvent) => closeOnEscape(e, onClose);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);
}

function closeOnEscape(e: KeyboardEvent, onClose: () => void) {
  if (e.key === "Escape") onClose();
}

function useDialogActions(
  props: FranchiseLocationDialogProps,
  state: ReturnType<typeof useDialogState>,
  t: TFunction,
) {
  return {
    submit: () => submitLocation(props, state, t),
    handleDelete: () => deleteLocation(props, state, t),
  };
}

async function submitLocation(
  props: FranchiseLocationDialogProps,
  state: ReturnType<typeof useDialogState>,
  t: TFunction,
) {
  const payload = buildPayload(state.form);
  if (!validatePayload(payload, state.setErr, t)) return;
  await runSaveAction(props, state, payload, t);
}

function validatePayload(
  payload: ReturnType<typeof buildPayload>,
  setErr: (value: string | null) => void,
  t: TFunction,
) {
  setErr(null);
  if (!payload.licenseeFirstName || !payload.licenseeLastName) {
    setErr(t("common.admin.franchiseLocations.formDialog.errors.nameRequired"));
    return false;
  }
  return validateLocation(payload, setErr, t);
}

function validateLocation(
  payload: ReturnType<typeof buildPayload>,
  setErr: (value: string | null) => void,
  t: TFunction,
) {
  if (!payload.country || !payload.city) {
    setErr(t("common.admin.franchiseLocations.formDialog.errors.locationRequired"));
    return false;
  }
  return true;
}

async function runSaveAction(
  props: FranchiseLocationDialogProps,
  state: ReturnType<typeof useDialogState>,
  payload: ReturnType<typeof buildPayload>,
  t: TFunction,
) {
  try {
    await executeSave(props, state, payload);
  } catch (e: unknown) {
    state.setErr(errorMessage(e, t, "saveFailed"));
  } finally {
    state.setBusy(false);
  }
}

async function executeSave(
  props: FranchiseLocationDialogProps,
  state: ReturnType<typeof useDialogState>,
  payload: ReturnType<typeof buildPayload>,
) {
  state.setBusy(true);
  await props.onSave(payload);
  props.onClose();
}

async function deleteLocation(
  props: FranchiseLocationDialogProps,
  state: ReturnType<typeof useDialogState>,
  t: TFunction,
) {
  if (!props.onDelete) return;
  await runDeleteAction(props, state, t);
}

async function runDeleteAction(
  props: FranchiseLocationDialogProps,
  state: ReturnType<typeof useDialogState>,
  t: TFunction,
) {
  try {
    await executeDelete(props, state);
  } catch (e: unknown) {
    state.setErr(errorMessage(e, t, "deleteFailed"));
  } finally {
    state.setBusy(false);
  }
}

async function executeDelete(
  props: FranchiseLocationDialogProps,
  state: ReturnType<typeof useDialogState>,
) {
  state.setBusy(true);
  await props.onDelete?.();
  props.onClose();
}

function errorMessage(e: unknown, t: TFunction, key: string) {
  if (e instanceof Error && e.message) return e.message;
  return t(`common.admin.franchiseLocations.formDialog.errors.${key}`);
}
