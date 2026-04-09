// src/app/admin/franchise-locations/components/Pagination.tsx
"use client";

import React from "react";
import { useTranslation } from "react-i18next";

type Props = {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
};

function clamp_page(page: number, totalPages: number) {
  if (totalPages < 1) return 1;
  if (page < 1) return 1;
  if (page > totalPages) return totalPages;
  return page;
}

export default function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: Props) {
  const { t } = useTranslation();
  const p = clamp_page(page, totalPages);
  const prevDisabled = p <= 1;
  const nextDisabled = p >= totalPages;

  return (
    <div className="pager pager--arrows news-pager">
      <button
        type="button"
        className="btn"
        aria-label={t(
          "common.admin.franchiseLocations.pagination.previousPage",
        )}
        disabled={prevDisabled}
        onClick={onPrev}
      >
        <img
          alt=""
          aria-hidden="true"
          className="icon-img icon-img--left"
          src="/icons/arrow_right_alt.svg"
        />
      </button>

      <div className="pager__count" aria-live="polite" aria-atomic="true">
        {p} / {Math.max(1, totalPages)}
      </div>

      <button
        type="button"
        className="btn"
        aria-label={t("common.admin.franchiseLocations.pagination.nextPage")}
        disabled={nextDisabled}
        onClick={onNext}
      >
        <img
          alt=""
          aria-hidden="true"
          className="icon-img"
          src="/icons/arrow_right_alt.svg"
        />
      </button>
    </div>
  );
}
