import type {
  BookingDialogActions,
  BookingDialogModel,
  BookingDialogProps,
  Translate,
} from "../types";
import BookingActionButton from "./BookingActionButton";

type Props = Pick<BookingDialogProps, "booking"> & {
  actions: BookingDialogActions;
  model: BookingDialogModel;
  t: Translate;
};

export default function BookingDialogActionsBar(props: Props) {
  return (
    <div className="booking-dialog__actions">
      <ProcessingAction {...props} />
      <ConfirmAction {...props} />
      <ConfirmedActions {...props} />
      <CancelAction {...props} />
      <SubscriptionAction {...props} />
      <PaymentAction {...props} />
      <DeleteAction {...props} />
    </div>
  );
}

function ProcessingAction({ actions, model, t }: Props) {
  if (!model.canShowProcessing) return null;
  return actionButton(
    actions,
    "processing",
    t("common.admin.bookings.dialog.actions.processing"),
    t,
    actions.runProcessing,
  );
}

function ConfirmAction({ actions, model, t }: Props) {
  if (!model.canShowConfirm) return null;
  return actionButton(
    actions,
    "confirm",
    t("common.admin.bookings.dialog.actions.confirm"),
    t,
    actions.runConfirm,
  );
}

function ConfirmedActions(props: Props) {
  if (props.model.status !== "confirmed") return null;
  return (
    <>
      <ResendAction {...props} />
      <CancelConfirmedAction {...props} />
    </>
  );
}

function ResendAction({ actions, t }: Props) {
  return actionButton(
    actions,
    "resend",
    t("common.admin.bookings.dialog.actions.resend"),
    t,
    actions.runResend,
  );
}

function CancelConfirmedAction({ actions, t }: Props) {
  const label = t(
    "common.admin.bookings.dialog.actions.cancelConfirmedBooking",
  );
  return actionButton(
    actions,
    "cancelConfirmed",
    label,
    t,
    actions.runCancelConfirmed,
    "btn btn--danger",
  );
}

function CancelAction({ actions, model, t }: Props) {
  if (!model.canShowCancel) return null;
  return actionButton(
    actions,
    "cancelled",
    t("common.admin.bookings.dialog.actions.cancel"),
    t,
    actions.runCancel,
  );
}

function SubscriptionAction({ actions, booking, model, t }: Props) {
  if (!model.canShowSubscriptionApprove) return null;
  return actionButton(
    actions,
    "eligible",
    subscriptionLabel(booking, t),
    t,
    actions.runSubscriptionApprove,
  );
}

function PaymentAction({ actions, model, t }: Props) {
  if (!model.canShowPaymentApprove) return null;
  return actionButton(
    actions,
    "approvePayment",
    t("common.admin.bookings.dialog.actions.approvePayment"),
    t,
    actions.runPaymentApprove,
    "btn btn--success",
  );
}

function DeleteAction({ actions, model, t }: Props) {
  if (model.status === "deleted") return null;
  return actionButton(
    actions,
    "delete",
    t("common.admin.bookings.dialog.actions.delete"),
    t,
    actions.runDelete,
    "btn btn--danger",
  );
}

function actionButton(
  actions: BookingDialogActions,
  action: string,
  label: string,
  t: Translate,
  onClick: () => void,
  className?: string,
) {
  return (
    <BookingActionButton
      busy={actions.busy}
      action={action}
      label={label}
      waitLabel={t("common.admin.bookings.dialog.actions.pleaseWait")}
      onClick={onClick}
      className={className}
    />
  );
}

function subscriptionLabel(booking: Props["booking"], t: Translate) {
  return booking.meta?.subscriptionEligible
    ? t("common.admin.bookings.dialog.actions.removeSubscriptionApproval")
    : t("common.admin.bookings.dialog.actions.approveForSubscription");
}
