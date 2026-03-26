//src\app\admin\(app)\invoices\components\InvoicesBottomBar.tsx
"use client";

import React, { useEffect, useState } from "react";

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

type DownloadButtonProps = {
  href: string;
  label: string;
};

type LimitOptionProps = {
  value: number;
  limit: number;
  setLimit: (n: number) => void;
  resetPage: () => void;
  closeMenu: () => void;
};

function setOverlayPosition(select: FixedSelect) {
  const node = select.menuRef.current;
  if (!node) return;
  node.style.setProperty("--ksLeft", `${select.pos.left}px`);
  node.style.setProperty("--ksTop", `${select.pos.top}px`);
  node.style.setProperty("--ksWidth", `${select.pos.width}px`);
}

function useOverlayPosition(select: FixedSelect) {
  useEffect(() => {
    if (!select.open) return;
    setOverlayPosition(select);
  }, [select.open, select.pos.left, select.pos.top, select.pos.width, select]);
}

function getDownloadIconSrc(isActive: boolean) {
  return isActive ? "/icons/download-light.svg" : "/icons/download-dark.svg";
}

function DownloadButton({ href, label }: DownloadButtonProps) {
  const [isActive, setIsActive] = useState(false);

  return (
    <a
      href={href}
      className="btn ks-invoices__downloadBtn"
      suppressHydrationWarning
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onFocus={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
    >
      <img
        src={getDownloadIconSrc(isActive)}
        alt=""
        aria-hidden="true"
        className="ks-invoices__downloadIcon"
      />
      <span>{label}</span>
    </a>
  );
}

function closePerPageMenu(select: FixedSelect) {
  select.setOpen(false);
}

function handlePerPageClick(
  value: number,
  setLimit: (n: number) => void,
  resetPage: () => void,
  closeMenu: () => void,
) {
  setLimit(value);
  resetPage();
  closeMenu();
}

function LimitOption({
  value,
  limit,
  setLimit,
  resetPage,
  closeMenu,
}: LimitOptionProps) {
  const isActive = limit === value;
  const className =
    "ks-selectbox__option ks-documents-option ks-invoices__cursorPointer" +
    (isActive ? " ks-selectbox__option--active" : "");

  return (
    <button
      type="button"
      role="option"
      aria-selected={isActive}
      className={className}
      onClick={() => handlePerPageClick(value, setLimit, resetPage, closeMenu)}
    >
      {value}
    </button>
  );
}

function renderLimitOptions(
  limit: number,
  setLimit: (n: number) => void,
  resetPage: () => void,
  closeMenu: () => void,
) {
  return [10, 20, 50, 100].map((value) => (
    <LimitOption
      key={value}
      value={value}
      limit={limit}
      setLimit={setLimit}
      resetPage={resetPage}
      closeMenu={closeMenu}
    />
  ));
}

function handleTriggerClick(select: FixedSelect) {
  return select.open ? select.setOpen(false) : select.openMenu();
}

function PerPageTrigger({
  limit,
  perPageSelect,
}: {
  limit: number;
  perPageSelect: FixedSelect;
}) {
  const className =
    "ks-selectbox" + (perPageSelect.open ? " ks-selectbox--open" : "");

  return (
    <div className={className}>
      <button
        ref={perPageSelect.triggerRef}
        type="button"
        className="ks-selectbox__trigger input ks-invoices__perPageTrigger"
        onClick={() => handleTriggerClick(perPageSelect)}
        aria-haspopup="listbox"
        aria-expanded={perPageSelect.open}
      >
        <span className="ks-selectbox__label">{String(limit)}</span>
        <span className="ks-selectbox__chevron" aria-hidden="true" />
      </button>
    </div>
  );
}

function PerPageOverlay({
  limit,
  setLimit,
  resetPage,
  perPageSelect,
}: {
  limit: number;
  setLimit: (n: number) => void;
  resetPage: () => void;
  perPageSelect: FixedSelect;
}) {
  if (!perPageSelect.open) return null;

  return (
    <div
      ref={perPageSelect.menuRef}
      role="listbox"
      className="ks-selectbox__panel ks-documents-overlay ks-documents-overlay--perpage ks-scroll-thin ks-invoices__overlay"
      onWheel={(e) => e.stopPropagation()}
      onScroll={(e) => e.stopPropagation()}
    >
      {renderLimitOptions(limit, setLimit, resetPage, () =>
        closePerPageMenu(perPageSelect),
      )}
    </div>
  );
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
  useOverlayPosition(perPageSelect);

  return (
    <>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DownloadButton href={csvHref} label="Download CSV" />
          <DownloadButton href={zipHref} label="Download ZIP" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-600">Per page</span>
          <PerPageTrigger limit={limit} perPageSelect={perPageSelect} />
          <PerPageOverlay
            limit={limit}
            setLimit={setLimit}
            resetPage={resetPage}
            perPageSelect={perPageSelect}
          />
        </div>
      </div>

      {err && <div className="mt-2 text-red-600">{err}</div>}
    </>
  );
}
