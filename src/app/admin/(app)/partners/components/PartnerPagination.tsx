"use client";

import { useTranslation } from "react-i18next";

type Props = {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function PartnerPagination(props: Props) {
  if (props.totalPages <= 1) return null;

  return (
    <div className="partner-admin__pagination">
      <PartnerPageButton
        direction="prev"
        disabled={props.page <= 1}
        onClick={props.onPrev}
      />
      <PartnerPageCount page={props.page} totalPages={props.totalPages} />
      <PartnerPageButton
        direction="next"
        disabled={props.page >= props.totalPages}
        onClick={props.onNext}
      />
    </div>
  );
}

function PartnerPageCount(props: { page: number; totalPages: number }) {
  return (
    <span className="partner-admin__pagination-count">
      {props.page} / {props.totalPages}
    </span>
  );
}

function PartnerPageButton(props: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const isPrev = props.direction === "prev";
  const label = isPrev
    ? t("admin.partners.pagination.previousPage")
    : t("admin.partners.pagination.nextPage");

  return (
    <button
      type="button"
      className={`partner-admin__pagination-btn${
        isPrev ? " is-prev" : " is-next"
      }`}
      aria-label={label}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      <img
        src="/icons/arrow_right_alt.svg"
        alt=""
        aria-hidden="true"
        className="partner-admin__pagination-icon"
      />
    </button>
  );
}
