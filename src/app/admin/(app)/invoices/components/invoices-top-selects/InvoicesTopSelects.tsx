// src/app/admin/(app)/invoices/components/invoices-top-selects/InvoicesTopSelects.tsx
"use client";

import React from "react";
import type { DocItem, SortOrder } from "../../utils/invoiceUi";
import DocsOverlay from "./DocsOverlay";
import { docsLabel, toggleOpen } from "./topSelectsUi";

type FixedSelect = {
  open: boolean;
  setOpen: (v: boolean) => void;
  openMenu: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
  pos: { left: number; top: number; width: number };
};

type Props = {
  loading: boolean;
  items: DocItem[];
  docsSelect: FixedSelect;
  sortSelect: FixedSelect;
  sortOrder: SortOrder;
  setSortOrder: (v: SortOrder) => void;
  resetPage: () => void;
  openPdf: (d: DocItem) => void;
  fmtDate: (iso: string) => string;
};

export default function InvoicesTopSelects(props: Props) {
  return (
    <>
      <div
        className={
          "ks-selectbox ks-invoices__docsSelect" +
          (props.docsSelect.open ? " ks-selectbox--open" : "")
        }
      >
        <button
          ref={props.docsSelect.triggerRef}
          type="button"
          className="ks-selectbox__trigger input ks-invoices__selectTrigger"
          onClick={() =>
            toggleOpen(
              props.docsSelect.open,
              props.docsSelect.setOpen,
              props.docsSelect.openMenu,
            )
          }
          disabled={props.loading || !props.items.length}
          aria-haspopup="listbox"
          aria-expanded={props.docsSelect.open}
        >
          <span className="ks-selectbox__label">
            {docsLabel(props.loading, props.items.length)}
          </span>
          <span className="ks-selectbox__chevron" aria-hidden="true" />
        </button>
      </div>

      <DocsOverlay
        items={props.items}
        fmtDate={props.fmtDate}
        openPdf={props.openPdf}
        docsSelect={props.docsSelect}
      />
    </>
  );
}
