//src\app\admin\(app)\invoices\components\InvoicesBottomBar.tsx
"use client";

import React from "react";

type FixedSelect = {
  open: boolean;
  setOpen: (v: boolean) => void;
  openMenu: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
  pos: { left: number; top: number; width: number };
};

type Props = {
  csvHref: string;
  zipHref: string;
  limit: number;
  setLimit: (n: number) => void;
  resetPage: () => void;
  perPageSelect: FixedSelect;
  err: string | null;
};

function cssVars(left: number, top: number, width: number) {
  return {
    ["--ksLeft" as any]: `${left}px`,
    ["--ksTop" as any]: `${top}px`,
    ["--ksWidth" as any]: `${width}px`,
  };
}

export default function InvoicesBottomBar({
  csvHref,
  zipHref,
  limit,
  setLimit,
  resetPage,
  perPageSelect,
  err,
}: Props) {
  return (
    <>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <a href={csvHref} className="btn" suppressHydrationWarning>
            Download CSV
          </a>
          <a href={zipHref} className="btn" suppressHydrationWarning>
            Download ZIP
          </a>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-600">Per page</span>

          <div
            className={
              "ks-selectbox" + (perPageSelect.open ? " ks-selectbox--open" : "")
            }
          >
            <button
              ref={perPageSelect.triggerRef}
              type="button"
              className="ks-selectbox__trigger input ks-invoices__perPageTrigger"
              onClick={() =>
                perPageSelect.open
                  ? perPageSelect.setOpen(false)
                  : perPageSelect.openMenu()
              }
              aria-haspopup="listbox"
              aria-expanded={perPageSelect.open}
            >
              <span className="ks-selectbox__label">{String(limit)}</span>
              <span className="ks-selectbox__chevron" aria-hidden="true" />
            </button>
          </div>

          {perPageSelect.open && (
            <div
              ref={perPageSelect.menuRef}
              role="listbox"
              className="ks-selectbox__panel ks-documents-overlay ks-documents-overlay--perpage ks-scroll-thin ks-invoices__overlay"
              style={cssVars(
                perPageSelect.pos.left,
                perPageSelect.pos.top,
                perPageSelect.pos.width,
              )}
              onWheel={(e) => e.stopPropagation()}
              onScroll={(e) => e.stopPropagation()}
            >
              {[10, 20, 50, 100].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="option"
                  aria-selected={limit === n}
                  className={
                    "ks-selectbox__option ks-documents-option ks-invoices__cursorPointer" +
                    (limit === n ? " ks-selectbox__option--active" : "")
                  }
                  onClick={() => {
                    setLimit(n);
                    resetPage();
                    perPageSelect.setOpen(false);
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {err && <div className="mt-2 text-red-600">{err}</div>}
    </>
  );
}
