"use client";

import { useTranslation } from "react-i18next";
import SelectBox from "@/app/admin/(app)/bookings/components/SelectBox";
import SelectOption from "@/app/admin/(app)/bookings/components/SelectOption";
import { useDropdown } from "@/app/admin/(app)/bookings/components/useDropdown";
import type { FeedbackCategoryFilter } from "../helpers";

type Props = {
  value: FeedbackCategoryFilter;
  onChange: (value: FeedbackCategoryFilter) => void;
};

type OptionProps = Props & {
  option: FeedbackCategoryFilter;
  close: () => void;
};

export default function FeedbackCategoryFilterBox(props: Props) {
  const { t } = useTranslation();
  const dropdown = useDropdown();

  return (
    <div className="news-admin__filter feedback-admin__select">
      <SelectBox
        dd={dropdown}
        label={getCategoryLabel(props.value, t)}
        disabled={false}
        ariaLabel={t("admin.feedbacks.filters.categoryAria")}
      >
        <CategoryOptions {...props} close={dropdown.close} />
      </SelectBox>
    </div>
  );
}

function CategoryOptions(props: Props & { close: () => void }) {
  return (
    <>
      <CategoryOption option="all" {...props} />
      <CategoryOption option="parents" {...props} />
      <CategoryOption option="players" {...props} />
      <CategoryOption option="coaches" {...props} />
      <CategoryOption option="partners" {...props} />
    </>
  );
}

function CategoryOption(props: OptionProps) {
  const { t } = useTranslation();

  return (
    <SelectOption
      active={props.value === props.option}
      onClick={() => selectCategory(props)}
      text={getCategoryLabel(props.option, t)}
    />
  );
}

function selectCategory(props: OptionProps) {
  props.onChange(props.option);
  props.close();
}

function getCategoryLabel(
  value: FeedbackCategoryFilter,
  t: (key: string) => string,
) {
  if (value === "all") return t("admin.feedbacks.filters.all");
  return t(`admin.feedbacks.category.${value}`);
}