"use client";

import { useTranslation } from "react-i18next";
import BookingDialogPortal from "./components/BookingDialogPortal";
import BookingDialogView from "./components/BookingDialogView";
import { useBookingDialogActions } from "./hooks/useBookingDialogActions";
import { useBookingDialogModel } from "./hooks/useBookingDialogModel";
import type { BookingDialogProps } from "./types";

export default function BookingDialogContent(props: BookingDialogProps) {
  const { t, i18n } = useTranslation();
  const model = useBookingDialogModel(props.booking, t, i18n.language);
  const actions = useBookingDialogActions(props, t);
  return (
    <BookingDialogPortal>
      <BookingDialogView
        {...props}
        actions={actions}
        model={model}
        t={t}
        lang={i18n.language}
      />
    </BookingDialogPortal>
  );
}
