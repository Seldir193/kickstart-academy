"use client";

import type { KeyboardEvent } from "react";
import type { TFunction } from "i18next";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  t: TFunction;
};

export default function PlacesSearch({ value, onChange, onClear, t }: Props) {
  return (
    <div className="ks-places-toolbar__search">
      <SearchField value={value} onChange={onChange} onClear={onClear} t={t} />
    </div>
  );
}

function SearchField({ value, onChange, onClear, t }: Props) {
  return (
    <div className="input-with-icon">
      <SearchIcon />
      <input
        className="input input-with-icon__input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("common.admin.places.searchPlaceholder", {
          defaultValue: "Name, street, city, zip...",
        })}
        onKeyDown={(event) => handleSearchKey(event, onClear)}
      />
    </div>
  );
}

function SearchIcon() {
  return (
    <img
      src="/icons/search.svg"
      alt=""
      aria-hidden="true"
      className="input-with-icon__icon"
    />
  );
}

function handleSearchKey(
  event: KeyboardEvent<HTMLInputElement>,
  onClear: () => void,
) {
  if (event.key !== "Escape") return;
  onClear();
}
