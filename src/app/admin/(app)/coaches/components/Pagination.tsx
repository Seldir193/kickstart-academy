// src/app/admin/(app)/coaches/components/Pagination.tsx
"use client";
import { useTranslation } from "react-i18next";
type Props = {
  page: number;
  pages: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function Pagination({ page, pages, onPrev, onNext }: Props) {
  const { t } = useTranslation();
  return (
    <div className="pager pager--arrows coach-pager">
      <button
        type="button"
        className="btn"
        aria-label={t("common.admin.coaches.pagination.previous")}
        disabled={page <= 1}
        onClick={onPrev}
      >
        <img
          src="/icons/arrow_right_alt.svg"
          alt=""
          aria-hidden="true"
          className="icon-img icon-img--left"
        />
      </button>

      <div className="pager__count" aria-live="polite" aria-atomic="true">
        {page} / {pages}
      </div>

      <button
        type="button"
        className="btn"
        aria-label={t("common.admin.coaches.pagination.next")}
        disabled={page >= pages}
        onClick={onNext}
      >
        <img
          src="/icons/arrow_right_alt.svg"
          alt=""
          aria-hidden="true"
          className="icon-img"
        />
      </button>
    </div>
  );
}
