import { useTranslation } from "react-i18next";
import { useBookDetailsState } from "./useBookDetailsState";
import { useBookDialogDropdowns } from "./useBookDialogDropdowns";
import { useBookFamilyScope } from "./useBookFamilyScope";
import { useBookOfferScope } from "./useBookOfferScope";
import { useBookSubmit } from "./useBookSubmit";
import type { BookDialogController, BookDialogProps } from "../types";

export function useBookDialogController(
  props: BookDialogProps,
): BookDialogController {
  const { t, i18n } = useTranslation();
  const dropdowns = useBookDialogDropdowns();
  const family = useBookFamilyScope(props.customerId, props.initialChildUid, t);
  const offers = useBookOfferScope(t, i18n.language);
  const details = useBookDetailsState();
  const submit = useBookSubmit({
    customerId: props.customerId,
    onClose: props.onClose,
    onBooked: props.onBooked,
    family,
    offers,
    details,
    t,
  });
  return { t, family, offers, details, dropdowns, submit };
}
