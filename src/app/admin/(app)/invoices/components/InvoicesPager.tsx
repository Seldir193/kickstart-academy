"use client";

import React from "react";

type Props = {
  page: number;
  totalPages: number;
  setPage: (fn: (p: number) => number) => void;
};

export default function InvoicesPager({ page, totalPages, setPage }: Props) {
  return (
    <div className="pager pager--arrows">
      <button
        type="button"
        className="btn"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
      >
        <img
          src="/icons/arrow_right_alt.svg"
          alt=""
          aria-hidden="true"
          className="icon-img icon-img--left"
        />
      </button>

      <div className="pager__count" aria-live="polite" aria-atomic="true">
        {page} / {totalPages}
      </div>

      <button
        type="button"
        className="btn"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
