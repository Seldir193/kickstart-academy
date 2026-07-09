import type { Status } from "../../types";
import { approvePayment } from "../hooks/useOnlineBookingDialogState";
import type { OnlineBookingDialogState } from "../hooks/useOnlineBookingDialogState";
import type { OnlineBookingDialogProps } from "../types";

type ActionProps = {
  props: OnlineBookingDialogProps;
  state: OnlineBookingDialogState;
};

type ButtonProps = {
  action: string;
  className?: string;
  labelKey: string;
  busy: string;
  onClick: () => void;
  t: (key: string) => string;
};

export function DialogActions({ props, state }: ActionProps) {
  return (
    <div className="online-booking-dialog__actions">
      <ProcessingAction props={props} state={state} />
      <ConfirmAction props={props} state={state} />
      <ConfirmedActions props={props} state={state} />
      <CancelAction props={props} state={state} />
      <ApprovePaymentAction props={props} state={state} />
      <DeleteAction props={props} state={state} />
    </div>
  );
}

function ProcessingAction({ props, state }: ActionProps) {
  if (!state.flags.canShowProcessing) return null;
  return <StatusAction action="processing" props={props} state={state} />;
}

function ConfirmAction({ props, state }: ActionProps) {
  if (!state.flags.canShowConfirm) return null;
  return actionButton("confirm", "confirm", () => props.onConfirm(), state);
}

function ConfirmedActions({ props, state }: ActionProps) {
  if (state.flags.s !== "confirmed") return null;
  return <>{resendAction(props, state)}{cancelConfirmedAction(props, state)}</>;
}

function resendAction(props: OnlineBookingDialogProps, state: OnlineBookingDialogState) {
  return actionButton("resend", "resend", () => props.onResend(), state);
}

function cancelConfirmedAction(props: OnlineBookingDialogProps, state: OnlineBookingDialogState) {
  return actionButton("cancelConfirmed", "cancelConfirmedBooking", () => props.onCancelConfirmed(), state, "btn btn--danger");
}

function CancelAction({ props, state }: ActionProps) {
  if (!state.flags.canShowCancel) return null;
  return <StatusAction action="cancelled" props={props} state={state} />;
}

function StatusAction({ action, props, state }: ActionProps & { action: Status }) {
  const label = action === "cancelled" ? "cancel" : action;
  return actionButton(action, label, () => props.onSetStatus(action), state);
}

function ApprovePaymentAction({ props, state }: ActionProps) {
  if (!state.flags.canShowPaymentApprove) return null;
  return actionButton("approvePayment", "approvePayment", () => approvePayment(props), state, "btn btn--success");
}

function DeleteAction({ props, state }: ActionProps) {
  if (state.flags.s === "deleted") return null;
  return actionButton("delete", "delete", () => props.onDelete(), state, "btn btn--danger");
}

function actionButton(action: string, label: string, fn: () => Promise<unknown>, state: OnlineBookingDialogState, className = "btn") {
  return <ActionButton action={action} busy={state.busy} className={className} labelKey={label} onClick={() => state.run(action, fn)} t={state.t} />;
}

function ActionButton({ action, busy, className = "btn", labelKey, onClick, t }: ButtonProps) {
  const label = busy === action ? "pleaseWait" : labelKey;
  return (
    <button type="button" className={className} aria-disabled={busy ? true : undefined} onClick={onClick}>
      {t(`common.admin.onlineBookings.dialog.action.${label}`)}
    </button>
  );
}
