"use client";

import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

type Props = {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
};

function clampPage(page: number, totalPages: number) {
  if (totalPages < 1) return 1;
  if (page < 1) return 1;
  if (page > totalPages) return totalPages;
  return page;
}

export default function FeedbackPagination(props: Props) {
  const { t } = useTranslation();
  const page = clampPage(props.page, props.totalPages);
  const totalPages = Math.max(1, props.totalPages);

  return (
    <div className="pager pager--arrows news-pager">
      {renderPreviousButton(page, props, t)}

      <div className="pager__count" aria-live="polite" aria-atomic="true">
        {page} / {totalPages}
      </div>

      {renderNextButton(page, totalPages, props, t)}
    </div>
  );
}

function renderPreviousButton(page: number, props: Props, t: TFunction) {
  return (
    <PaginationButton
      disabled={page <= 1}
      label={t("admin.feedbacks.pagination.previousPage")}
      reverse
      onClick={props.onPrev}
    />
  );
}

function renderNextButton(
  page: number,
  totalPages: number,
  props: Props,
  t: TFunction,
) {
  return (
    <PaginationButton
      disabled={page >= totalPages}
      label={t("admin.feedbacks.pagination.nextPage")}
      onClick={props.onNext}
    />
  );
}

function PaginationButton(props: {
  disabled: boolean;
  label: string;
  reverse?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="btn"
      aria-label={props.label}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {renderPaginationIcon(props.reverse)}
    </button>
  );
}

function renderPaginationIcon(reverse?: boolean) {
  return (
    <img
      alt=""
      aria-hidden="true"
      className={`icon-img ${reverse ? "icon-img--left" : ""}`}
      src="/icons/arrow_right_alt.svg"
    />
  );
}
