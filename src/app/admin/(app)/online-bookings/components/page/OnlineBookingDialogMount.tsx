"use client";

import OnlineBookingDialog from "../../OnlineBookingDialog";
import type { Booking, Status } from "../../types";

type OnlineBookingDialogMountProps = {
  booking: Booking | null;
  setSel: (
    booking: Booking | null | ((prev: Booking | null) => Booking | null),
  ) => void;
  reload: () => Promise<void>;
  showOk: (text: string) => void;
  onConfirm: (id: string, resend: boolean) => Promise<unknown>;
  onSetStatus: (id: string, next: Status) => Promise<unknown>;
  onDeleteOne: (id: string) => Promise<unknown>;
  onCancelConfirmed: (id: string) => Promise<unknown>;
  onApprovePayment: (id: string) => Promise<unknown>;
};

export default function OnlineBookingDialogMount(
  props: OnlineBookingDialogMountProps,
) {
  if (!props.booking) return null;
  return (
    <OnlineBookingDialog
      booking={props.booking}
      onClose={() => props.setSel(null)}
      onConfirm={() => props.onConfirm(props.booking!._id, false)}
      onResend={() => props.onConfirm(props.booking!._id, true)}
      onSetStatus={(s) => props.onSetStatus(props.booking!._id, s as Status)}
      onDelete={() => props.onDeleteOne(props.booking!._id)}
      onCancelConfirmed={() => props.onCancelConfirmed(props.booking!._id)}
      onApprovePayment={() => props.onApprovePayment(props.booking!._id)}
      notify={props.showOk}
      onUpdateBooking={(patch) => updateSelectedBooking(patch, props)}
    />
  );
}

function updateSelectedBooking(
  patch: Partial<Booking>,
  props: OnlineBookingDialogMountProps,
) {
  props.setSel((prev) => (prev ? { ...prev, ...patch } : prev));
  props.reload();
}
