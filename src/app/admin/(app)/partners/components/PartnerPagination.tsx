"use client";

import { useTranslation } from "react-i18next";

type Props = {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function PartnerPagination(props: Props) {
  return (
    <div className="pager pager--arrows news-pager">
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
    <div className="pager__count" aria-live="polite" aria-atomic="true">
      {props.page} / {props.totalPages}
    </div>
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
      className="btn"
      aria-label={label}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      <img
        src="/icons/arrow_right_alt.svg"
        alt=""
        aria-hidden="true"
        className={isPrev ? "icon-img icon-img--left" : "icon-img"}
      />
    </button>
  );
}
