"use client";

import { OnlineBookingDialogView } from "./components/OnlineBookingDialogView";
import { useOnlineBookingDialogState } from "./hooks/useOnlineBookingDialogState";
import type { OnlineBookingDialogProps } from "./types";

export default function OnlineBookingDialogContent(props: OnlineBookingDialogProps) {
  const state = useOnlineBookingDialogState(props);
  return <OnlineBookingDialogView props={props} state={state} />;
}
