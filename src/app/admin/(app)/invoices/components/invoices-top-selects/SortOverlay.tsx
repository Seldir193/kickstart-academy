"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import type { SortOrder } from "../../utils/invoiceUi";
import { sortLabel } from "../../utils/invoiceUi";
import { cssVars } from "./topSelectsUi";

type FixedSelect = {
  open: boolean;
  setOpen: (v: boolean) => void;
  openMenu: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
  pos: { left: number; top: number; width: number };
};

type Props = {
  sortSelect: FixedSelect;
  sortOrder: SortOrder;
  setSortOrder: (v: SortOrder) => void;
  resetPage: () => void;
};

export default function SortOverlay({
  sortSelect,
  sortOrder,
  setSortOrder,
  resetPage,
}: Props) {
  const { t } = useTranslation();
  if (!sortSelect.open) return null;

  return (
    <div
      ref={sortSelect.menuRef}
      role="listbox"
      className="ks-selectbox__panel ks-documents-overlay ks-documents-overlay--sort ks-scroll-thin ks-invoices__overlay"
      style={cssVars(
        sortSelect.pos.left,
        sortSelect.pos.top,
        sortSelect.pos.width,
      )}
      onWheel={(e) => e.stopPropagation()}
      onScroll={(e) => e.stopPropagation()}
    >
      {(["newest", "oldest"] as SortOrder[]).map((v) => (
        <button
          key={v}
          type="button"
          role="option"
          aria-selected={sortOrder === v}
          className={
            "ks-selectbox__option ks-documents-option ks-invoices__cursorPointer" +
            (sortOrder === v ? " ks-selectbox__option--active" : "")
          }
          onClick={() => {
            setSortOrder(v);
            resetPage();
            sortSelect.setOpen(false);
          }}
        >
          {sortLabel(v, t)}
        </button>
      ))}
    </div>
  );
}
