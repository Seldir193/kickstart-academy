import type { Booking, Status } from "../types";

export type OnlineBookingDialogProps = {
  booking: Booking;
  onClose: () => void;
  onConfirm: () => Promise<unknown>;
  onResend: () => Promise<unknown>;
  onSetStatus: (s: Status) => Promise<unknown>;
  onDelete: () => Promise<unknown>;
  onCancelConfirmed: () => Promise<unknown>;
  onApprovePayment: () => Promise<unknown>;
  notify: (text: string) => void;
  onUpdateBooking: (patch: Partial<Booking>) => void;
};

export type MessageRow = {
  label?: string;
  value: string;
};

export type Translate = (key: string) => string;
