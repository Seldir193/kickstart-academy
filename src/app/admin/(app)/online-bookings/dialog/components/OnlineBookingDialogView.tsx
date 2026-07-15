import { BookingDetailsSection } from "./BookingDetailsSection";
import { DialogActions } from "./DialogActions";
import { MessageSection } from "./MessageSection";
import { ModalPortal } from "./ModalPortal";
import { OnlineBookingDialogHeader } from "./OnlineBookingDialogHeader";
import type { OnlineBookingDialogState } from "../hooks/useOnlineBookingDialogState";
import type { OnlineBookingDialogProps } from "../types";

type Props = {
  props: OnlineBookingDialogProps;
  state: OnlineBookingDialogState;
};

export function OnlineBookingDialogView({ props, state }: Props) {
  return (
    <ModalPortal>
      <DialogBackdrop props={props} state={state} />
    </ModalPortal>
  );
}

function DialogBackdrop({ props, state }: Props) {
  const { booking, onClose } = props;
  const { t } = state;
  return (
    <div
      className="dialog-backdrop online-booking-dialog"
      role="dialog"
      aria-modal="true"
      aria-label={t("common.admin.onlineBookings.dialog.ariaLabel")}
    >
      <button
        type="button"
        className="dialog-backdrop-hit"
        aria-label={t("common.admin.onlineBookings.dialog.close")}
        onClick={onClose}
      />
      <div className="dialog online-booking-dialog__dialog">
        <OnlineBookingDialogHeader booking={booking} onClose={onClose} t={t} />
        <DialogBody props={props} state={state} />
      </div>
    </div>
  );
}

function DialogBody({ props, state }: Props) {
  return (
    <div className="dialog-body online-booking-dialog__body">
      <div className="online-booking-dialog__grid">
        <BookingDetailsSection booking={props.booking} state={state} />
        <MessageSection rows={state.messageRows} t={state.t} />
      </div>
      <DialogActions props={props} state={state} />
    </div>
  );
}
