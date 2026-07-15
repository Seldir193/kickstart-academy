import type { FeedbackCategory } from "../../../types";
import { getFeedbackCategoryKey } from "../../../helpers";

export type Translate = (key: string) => string;

export function categoryLabel(category: FeedbackCategory, t: Translate) {
  return t(getFeedbackCategoryKey(category));
}

export function statusLabel(active: boolean, t: Translate) {
  return active ? t("admin.feedbacks.active") : t("admin.feedbacks.inactive");
}

export function activeOptionClass(isActive: boolean) {
  return (
    "ks-selectbox__option" + (isActive ? " ks-selectbox__option--active" : "")
  );
}

export function openSelectClass(isOpen: boolean) {
  return "ks-selectbox" + (isOpen ? " ks-selectbox--open" : "");
}
