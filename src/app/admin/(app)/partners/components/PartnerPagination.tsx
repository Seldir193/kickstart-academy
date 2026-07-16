"use client";

import type { TFunction } from "i18next";
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
      {renderPartnerPageButton(props, "prev")}
      <PartnerPageCount page={props.page} totalPages={props.totalPages} />
      {renderPartnerPageButton(props, "next")}
    </div>
  );
}

type Direction = "prev" | "next";

function renderPartnerPageButton(props: Props, direction: Direction) {
  const isPrev = direction === "prev";
  return (
    <PartnerPageButton
      direction={direction}
      disabled={isPrev ? props.page <= 1 : props.page >= props.totalPages}
      onClick={isPrev ? props.onPrev : props.onNext}
    />
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
  direction: Direction;
  disabled: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const isPrev = props.direction === "prev";
  const label = pageButtonLabel(isPrev, t);

  return (
    <button
      type="button"
      className="btn"
      aria-label={label}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {renderPageButtonIcon(isPrev)}
    </button>
  );
}

function pageButtonLabel(isPrev: boolean, t: TFunction) {
  return isPrev
    ? t("admin.partners.pagination.previousPage")
    : t("admin.partners.pagination.nextPage");
}

function renderPageButtonIcon(isPrev: boolean) {
  return (
    <img
      src="/icons/arrow_right_alt.svg"
      alt=""
      aria-hidden="true"
      className={isPrev ? "icon-img icon-img--left" : "icon-img"}
    />
  );
}
