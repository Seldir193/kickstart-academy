"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import type { DocItem } from "../../utils/invoiceUi";
import { docNoFrom, iconForType, metaLine } from "../../utils/invoiceUi";
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
  items: DocItem[];
  fmtDate: (iso: string) => string;
  openPdf: (d: DocItem) => void;
  docsSelect: FixedSelect;
};

type Translate = ReturnType<typeof useTranslation>["t"];

type OptionProps = {
  item: DocItem;
  fmtDate: (iso: string) => string;
  openPdf: (d: DocItem) => void;
  close: () => void;
  t: Translate;
};

export default function DocsOverlay(props: Props) {
  const { t } = useTranslation();
  if (!props.docsSelect.open || !props.items.length) return null;

  return (
    <DocsPanel docsSelect={props.docsSelect}>
      {props.items.map((item) => (
        <DocsOption
          key={item.id}
          item={item}
          {...props}
          close={closeDocs(props)}
          t={t}
        />
      ))}
    </DocsPanel>
  );
}

function closeDocs(props: Props) {
  return () => props.docsSelect.setOpen(false);
}

function DocsPanel(props: {
  docsSelect: FixedSelect;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={props.docsSelect.menuRef}
      role="listbox"
      className="ks-selectbox__panel ks-documents-overlay ks-documents-overlay--docs ks-scroll-thin ks-invoices__overlay"
      style={cssVars(
        props.docsSelect.pos.left,
        props.docsSelect.pos.top,
        props.docsSelect.pos.width,
      )}
      onWheel={(e) => e.stopPropagation()}
      onScroll={(e) => e.stopPropagation()}
    >
      {props.children}
    </div>
  );
}

function DocsOption(props: OptionProps) {
  return (
    <button
      type="button"
      role="option"
      className="ks-selectbox__option ks-documents-option ks-doc-select__option ks-storno__option ks-invoices__cursorPointer"
      onClick={() => pickDoc(props)}
    >
      <DocsOptionContent {...props} />
    </button>
  );
}

function pickDoc(props: OptionProps) {
  props.close();
  props.openPdf(props.item);
}

function DocsOptionContent(props: OptionProps) {
  return (
    <div className="ks-doc-select__row">
      <div className="ks-doc-select__top ks-doc-select__top--single">
        <DocsTitle {...props} />
        <DocsBadge item={props.item} />
      </div>
    </div>
  );
}

function DocsTitle(props: OptionProps) {
  return (
    <div className="ks-doc-select__title" title={props.item.title}>
      <span className="ks-doc-select__typeIcon" aria-hidden="true">
        <img src={iconForType(props.item.type)} alt="" />
      </span>
      <DocsMeta {...props} />
    </div>
  );
}

function DocsMeta(props: OptionProps) {
  return (
    <div className="ks-invoices__docTextCol">
      <div className="ks-doc-select__bottom">
        {metaLine(props.item, props.fmtDate, props.t)}
      </div>
    </div>
  );
}

function DocsBadge({ item }: { item: DocItem }) {
  return (
    <div className="ks-doc-select__badgeCol" aria-hidden>
      <span className="ks-doc-select__badge">{docNoFrom(item) || ""}</span>
    </div>
  );
}
