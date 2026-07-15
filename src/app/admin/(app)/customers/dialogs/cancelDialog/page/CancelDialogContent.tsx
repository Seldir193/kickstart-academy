"use client";

import { useTranslation } from "react-i18next";
import { useCancelBookings } from "./hooks/useCancelBookings";
import { useCancelFamilyScope } from "./hooks/useCancelFamilyScope";
import { useCancelMenus } from "./hooks/useCancelMenus";
import { useCancelSubmit } from "./hooks/useCancelSubmit";
import CancelDialogView from "./components/CancelDialogView";
import type { CancelDialogProps } from "./types";

export default function CancelDialogContent(props: CancelDialogProps) {
  const { t } = useTranslation();
  const scope = useCancelFamilyScope(props.customer._id, t);
  const menus = useCancelMenus();
  const bookings = useCancelBookings(props.customer, scope, t);
  const submit = useCancelSubmit(
    props.customer,
    bookings,
    props.onClose,
    props.onChanged,
    t,
  );
  return (
    <CancelDialogView
      {...props}
      t={t}
      scope={scope}
      menus={menus}
      bookings={bookings}
      submit={submit}
    />
  );
}
