"use client";

import { useTranslation } from "react-i18next";

export default function SearchInput(props: {
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (key: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="input-with-icon">
      <img
        src="/icons/search.svg"
        alt=""
        aria-hidden="true"
        className="input-with-icon__icon"
      />
      <input
        className="input input-with-icon__input"
        placeholder={t("common.admin.bookings.search.placeholder")}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        onKeyDown={(e) => props.onKeyDown(e.key)}
      />
    </div>
  );
}
