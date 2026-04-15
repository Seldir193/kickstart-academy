"use client";

import { useTranslation } from "react-i18next";

type Props = {
  page: number;
  pages: number;
  onPrev: () => void;
  onNext: () => void;
};

type BtnProps = {
  disabled: boolean;
  label: string;
  flip?: boolean;
  onClick: () => void;
};

function PagerBtn({ disabled, label, flip, onClick }: BtnProps) {
  return (
    <button
      type="button"
      className="btn"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      <img
        src="/icons/arrow_right_alt.svg"
        alt=""
        aria-hidden="true"
        className={"icon-img" + (flip ? " icon-img--left" : "")}
      />
    </button>
  );
}

export default function Pagination({ page, pages, onPrev, onNext }: Props) {
  const { t } = useTranslation();
  const prevDisabled = page <= 1;
  const nextDisabled = page >= pages;

  return (
    <div className="pager pager--arrows news-pager">
      <PagerBtn
        disabled={prevDisabled}
        label={t("common.admin.members.pagination.previous")}
        flip
        onClick={onPrev}
      />
      <div className="pager__count" aria-live="polite" aria-atomic="true">
        {page} / {pages}
      </div>
      <PagerBtn
        disabled={nextDisabled}
        label={t("common.admin.members.pagination.next")}
        onClick={onNext}
      />
    </div>
  );
}
