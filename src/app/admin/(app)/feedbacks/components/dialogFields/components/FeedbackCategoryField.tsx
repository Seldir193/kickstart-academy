import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FeedbackCategory } from "../../../types";
import { FEEDBACK_CATEGORIES } from "../../../constants";
import { useCloseOnOutsideClick } from "../hooks/useCloseOnOutsideClick";
import { activeOptionClass, categoryLabel, openSelectClass } from "../lib/labels";
import type { BaseFieldProps } from "../types";
import SelectTrigger from "./SelectTrigger";

export default function FeedbackCategoryField(props: BaseFieldProps) {
  const { t } = useTranslation();
  const state = useCategoryState(props);
  return (
    <div className="field">
      <label className="dialog-label">{t("admin.feedbacks.category")}</label>
      <CategorySelect {...props} {...state} t={t} />
    </div>
  );
}

function useCategoryState({ updateFeedback }: BaseFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useCloseOnOutsideClick(dropdownRef, () => setIsOpen(false));
  const pickCategory = (category: FeedbackCategory) => {
    updateFeedback("category", category);
    setIsOpen(false);
  };
  return { isOpen, setIsOpen, dropdownRef, pickCategory };
}

function CategorySelect(props: BaseFieldProps & ReturnType<typeof useCategoryState> & { t: (key: string) => string }) {
  return (
    <div ref={props.dropdownRef} className={openSelectClass(props.isOpen)}>
      <SelectTrigger onClick={() => props.setIsOpen((open) => !open)}>
        {categoryLabel(props.draft.category, props.t)}
      </SelectTrigger>
      {props.isOpen ? <CategoryPanel {...props} /> : null}
    </div>
  );
}

function CategoryPanel(props: BaseFieldProps & ReturnType<typeof useCategoryState> & { t: (key: string) => string }) {
  return (
    <div className="ks-selectbox__panel">
      {FEEDBACK_CATEGORIES.map((category) => <CategoryOption key={category} category={category} {...props} />)}
    </div>
  );
}

function CategoryOption(props: BaseFieldProps & ReturnType<typeof useCategoryState> & { t: (key: string) => string; category: FeedbackCategory }) {
  const isActive = props.draft.category === props.category;
  return (
    <button type="button" className={activeOptionClass(isActive)} onClick={() => props.pickCategory(props.category)}>
      {categoryLabel(props.category, props.t)}
    </button>
  );
}
