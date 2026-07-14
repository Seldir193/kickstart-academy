"use client";

type Props = {
  page: number;
  pages: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function Pager(props: Props) {
  return (
    <div className="pager pager--arrows mt-3">
      <button
        type="button"
        className="btn"
        aria-label="Previous page"
        disabled={props.page <= 1}
        onClick={props.onPrev}
      >
        <img
          src="/icons/arrow_right_alt.svg"
          alt=""
          aria-hidden="true"
          className="icon-img icon-img--left"
        />
      </button>

      <div className="pager__count" aria-live="polite" aria-atomic="true">
        {props.page} / {props.pages}
      </div>

      <button
        type="button"
        className="btn"
        aria-label="Next page"
        disabled={props.page >= props.pages}
        onClick={props.onNext}
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
