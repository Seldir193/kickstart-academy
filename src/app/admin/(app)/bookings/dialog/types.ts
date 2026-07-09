import type { Booking, Status } from "../types";

export type BookingDialogProps = {
  booking: Booking;
  onClose: () => void;
  onConfirm: () => Promise<unknown>;
  onResend: () => Promise<unknown>;
  onSetStatus: (s: Status) => Promise<unknown>;
  onDelete: () => Promise<unknown>;
  onCancelConfirmed: () => Promise<unknown>;
  notify: (text: string) => void;
  onUpdateBooking: (patch: Partial<Booking>) => void;
};

export type Translate = (key: string) => string;

export type MessageLine = {
  label?: string;
  value: string;
  raw: string;
};

export type BookingDialogModel = {
  status: Status;
  programText: string;
  venueText: string;
  bookingType: string;
  isOneTimeType: boolean;
  isWishDate: boolean;
  scheduleLine: string;
  regularCourseLine: string;
  hasRegularCourseLine: string | false;
  showInvoiceDetails: boolean;
  canShowProcessing: boolean;
  canShowConfirm: boolean;
  canShowCancel: boolean;
  canShowSubscriptionApprove: boolean;
  canShowPaymentApprove: boolean;
  messageLines: MessageLine[];
};

export type BookingDialogActions = {
  busy: string;
  runProcessing: () => void;
  runConfirm: () => void;
  runResend: () => void;
  runCancelConfirmed: () => void;
  runCancel: () => void;
  runSubscriptionApprove: () => void;
  runPaymentApprove: () => void;
  runDelete: () => void;
};
