"use client";

import { useTranslation } from "react-i18next";
import StornoDialogView from "./components/StornoDialogView";
import { useStornoBookings } from "./hooks/useStornoBookings";
import { useStornoFamilyScope } from "./hooks/useStornoFamilyScope";
import { useStornoMenuState } from "./hooks/useStornoMenuState";
import { useStornoSubmit } from "./hooks/useStornoSubmit";
import type { StornoDialogProps } from "./types";

export default function StornoDialogContent(props: StornoDialogProps) {
  const { t } = useTranslation();
  const scope = useStornoFamilyScope(props.customer._id, t);
  const bookings = useStornoBookings(props.customer, scope, t);
  const menus = useStornoMenuState(bookings.filtered.length);
  const submit = useStornoSubmit(props.customer, bookings, props.onClose, props.onChanged, t);
  return <StornoDialogView {...props} t={t} scope={scope} menus={menus} bookings={bookings} submit={submit} />;
}
