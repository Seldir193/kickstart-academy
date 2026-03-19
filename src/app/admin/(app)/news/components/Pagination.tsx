//src\app\admin\(app)\news\components\Pagination.tsx
"use client";

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
  const prevDisabled = page <= 1;
  const nextDisabled = page >= pages;

  return (
    <div className="pager pager--arrows news-pager">
      <PagerBtn
        disabled={prevDisabled}
        label="Previous page"
        flip
        onClick={onPrev}
      />

      <div className="pager__count" aria-live="polite" aria-atomic="true">
        {page} / {pages}
      </div>

      <PagerBtn disabled={nextDisabled} label="Next page" onClick={onNext} />
    </div>
  );
}
