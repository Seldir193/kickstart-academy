"use client";

import { useTranslation } from "react-i18next";
import SelectBox from "@/app/admin/(app)/bookings/components/SelectBox";
import SelectOption from "@/app/admin/(app)/bookings/components/SelectOption";
import { useDropdown } from "@/app/admin/(app)/bookings/components/useDropdown";
import type { FeedbackSortKey } from "../helpers";

type Props = {
  value: FeedbackSortKey;
  onChange: (value: FeedbackSortKey) => void;
};

type OptionProps = Props & {
  option: FeedbackSortKey;
  close: () => void;
};

export default function FeedbackSortFilter(props: Props) {
  const { t } = useTranslation();
  const dropdown = useDropdown();

  return (
    <div className="news-admin__filter feedback-admin__select">
      <SelectBox
        dd={dropdown}
        label={getSortLabel(props.value, t)}
        disabled={false}
        ariaLabel={t("admin.feedbacks.filters.sortAria")}
      >
        <SortOptions {...props} close={dropdown.close} />
      </SelectBox>
    </div>
  );
}

function SortOptions(props: Props & { close: () => void }) {
  return (
    <>
      <SortOption option="newest" {...props} />
      <SortOption option="oldest" {...props} />
      <SortOption option="aToZ" {...props} />
      <SortOption option="zToA" {...props} />
    </>
  );
}

function SortOption(props: OptionProps) {
  const { t } = useTranslation();

  return (
    <SelectOption
      active={props.value === props.option}
      onClick={() => selectSort(props)}
      text={getSortLabel(props.option, t)}
    />
  );
}

function selectSort(props: OptionProps) {
  props.onChange(props.option);
  props.close();
}

function getSortLabel(value: FeedbackSortKey, t: (key: string) => string) {
  return t(`admin.feedbacks.sort.${value}`);
}