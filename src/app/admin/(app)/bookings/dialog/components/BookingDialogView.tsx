import type {
  BookingDialogActions,
  BookingDialogModel,
  BookingDialogProps,
  Translate,
} from "../types";
import BookingDialogBody from "./BookingDialogBody";
import BookingDialogHeader from "./BookingDialogHeader";

type Props = BookingDialogProps & {
  actions: BookingDialogActions;
  model: BookingDialogModel;
  t: Translate;
  lang?: string;
};

export default function BookingDialogView(props: Props) {
  return (
    <div
      className="dialog-backdrop booking-dialog"
      role="dialog"
      aria-modal="true"
      aria-label={props.t("common.admin.bookings.dialog.ariaLabel")}
    >
      <BackdropHit onClose={props.onClose} t={props.t} />
      <div className="dialog booking-dialog__dialog">
        <BookingDialogHeader {...props} />
        <BookingDialogBody {...props} />
      </div>
    </div>
  );
}

function BackdropHit({ onClose, t }: { onClose: () => void; t: Translate }) {
  return (
    <button
      type="button"
      className="dialog-backdrop-hit"
      aria-label={t("common.admin.bookings.dialog.close")}
      onClick={onClose}
    />
  );
}
