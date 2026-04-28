"use client";

import { useTranslation } from "react-i18next";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function FeedbackSearchInput(props: Props) {
  const { t } = useTranslation();

  return (
    <div className="news-admin__filter feedback-admin__search">
      <div className="input-with-icon">
        <img
          src="/icons/search.svg"
          alt=""
          aria-hidden="true"
          className="input-with-icon__icon"
        />
        <input
          className="input input-with-icon__input"
          placeholder={t("admin.feedbacks.search.placeholder")}
          value={props.value}
          onChange={(event) => props.onChange(event.target.value)}
          onKeyDown={(event) => clearSearch(event.key, props.onChange)}
        />
      </div>
    </div>
  );
}

function clearSearch(key: string, onChange: (value: string) => void) {
  if (key === "Escape") onChange("");
}