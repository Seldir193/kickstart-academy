"use client";

import type { TFunction } from "i18next";
import type { PlacesSortKey, PlacesSortOption as SortOption } from "./types";

type Props = {
  option: SortOption;
  active: boolean;
  t: TFunction;
  onSelect: (value: PlacesSortKey) => void;
};

export default function PlacesSortOption({ option, active, t, onSelect }: Props) {
  return (
    <li>
      <button type="button" className={optionClassName(active)} onClick={() => onSelect(option.value)}>
        {t(option.labelKey, { defaultValue: option.defaultValue })}
      </button>
    </li>
  );
}

function optionClassName(active: boolean) {
  return "ks-training-select__option" + (active ? " is-selected" : "");
}
