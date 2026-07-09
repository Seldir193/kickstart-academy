import type { BookingDialogActions, BookingDialogModel, BookingDialogProps, Translate } from "../types";
import BookingDetailsSection from "./BookingDetailsSection";
import BookingDialogActionsBar from "./BookingDialogActionsBar";
import BookingMessageSection from "./BookingMessageSection";

type Props = Pick<BookingDialogProps, "booking"> & {
  actions: BookingDialogActions;
  model: BookingDialogModel;
  t: Translate;
  lang?: string;
};

export default function BookingDialogBody(props: Props) {
  return <div className="dialog-body booking-dialog__body"><div className="booking-dialog__grid"><BookingDetailsSection {...props} /><BookingMessageSection model={props.model} t={props.t} /></div><BookingDialogActionsBar {...props} /></div>;
}
