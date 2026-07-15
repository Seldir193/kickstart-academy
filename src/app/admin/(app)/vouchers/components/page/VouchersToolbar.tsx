"use client";

import type { ReactNode, RefObject } from "react";
import { toastText } from "@/lib/toast-messages";
import type { VoucherStatus } from "../../types";
import {
  sortLabel,
  statusLabel,
  type SortKey,
  type Translate,
} from "./voucherOptions";

type MenuState<T extends HTMLElement> = {
  open: boolean;
  setOpen: (updater: (open: boolean) => boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  menuRef: RefObject<T | null>;
};

type VouchersToolbarProps = {
  t: Translate;
  q: string;
  status: VoucherStatus;
  sort: SortKey;
  busy: boolean;
  total: number;
  statusMenu: MenuState<HTMLUListElement>;
  sortMenu: MenuState<HTMLUListElement>;
  setQ: (value: string) => void;
  setStatus: (value: VoucherStatus) => void;
  setSort: (value: SortKey) => void;
  openCreateDialog: () => void;
};

export default function VouchersToolbar(props: VouchersToolbarProps) {
  return (
    <div className="ks-vouchers-toolbar">
      <SearchFilter {...props} />
      <StatusFilter {...props} />
      <SortFilter {...props} />
      <CreateAction {...props} />
    </div>
  );
}

function SearchFilter(props: VouchersToolbarProps) {
  return (
    <div className="news-admin__filter ks-vouchers-toolbar__search">
      <div className="input-with-icon">
        <SearchIcon />
        <SearchInput {...props} />
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <img
      src="/icons/search.svg"
      alt=""
      aria-hidden="true"
      className="input-with-icon__icon"
    />
  );
}

function SearchInput({ q, t, setQ }: VouchersToolbarProps) {
  const placeholder = toastText(
    t,
    "common.admin.vouchers.searchPlaceholder",
    "Code...",
  );
  return (
    <input
      className="input input-with-icon__input"
      placeholder={placeholder}
      value={q}
      onChange={(e) => setQ(e.target.value)}
      onKeyDown={(e) => onSearchKeyDown(e.key, setQ)}
    />
  );
}

function StatusFilter(props: VouchersToolbarProps) {
  const label = statusLabel(props.t, props.status, props.total);
  const ariaLabel = toastText(
    props.t,
    "common.admin.vouchers.aria.status",
    "Status",
  );
  return (
    <FilterShell kind="select">
      <TrainingSelect
        label={label}
        menu={props.statusMenu}
        ariaLabel={ariaLabel}
        disabled={props.busy}
      >
        <StatusMenu {...props} />
      </TrainingSelect>
    </FilterShell>
  );
}

function SortFilter(props: VouchersToolbarProps) {
  const ariaLabel = toastText(
    props.t,
    "common.admin.vouchers.aria.sorting",
    "Sorting",
  );
  return (
    <FilterShell kind="sort">
      <TrainingSelect
        label={sortLabel(props.t, props.sort)}
        menu={props.sortMenu}
        ariaLabel={ariaLabel}
        disabled={props.busy}
      >
        <SortMenu {...props} />
      </TrainingSelect>
    </FilterShell>
  );
}

function FilterShell({
  kind,
  children,
}: {
  kind: "select" | "sort";
  children?: ReactNode;
}) {
  return (
    <div className={`news-admin__filter ks-vouchers-toolbar__${kind}`}>
      {children}
    </div>
  );
}

function TrainingSelect({
  label,
  menu,
  ariaLabel,
  disabled,
  children,
}: {
  label: string;
  menu: MenuState<HTMLUListElement>;
  ariaLabel: string;
  disabled: boolean;
  children?: ReactNode;
}) {
  const className =
    "ks-training-select" + (menu.open ? " ks-training-select--open" : "");
  return (
    <div className={className}>
      <button
        type="button"
        ref={menu.triggerRef}
        className="ks-training-select__trigger"
        onClick={() => menu.setOpen((open) => !open)}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        <span className="ks-training-select__label">{label}</span>
        <span className="ks-training-select__chevron" />
      </button>
      {children}
    </div>
  );
}

function StatusMenu(props: VouchersToolbarProps) {
  const ariaLabel = toastText(
    props.t,
    "common.admin.vouchers.aria.status",
    "Status",
  );
  if (!props.statusMenu.open) return null;
  return (
    <ul
      ref={props.statusMenu.menuRef}
      className="ks-training-select__menu"
      role="listbox"
      aria-label={ariaLabel}
    >
      <StatusOption value="all" {...props} />
      <StatusOption value="active" {...props} />
      <StatusOption value="inactive" {...props} />
    </ul>
  );
}

function StatusOption(props: VouchersToolbarProps & { value: VoucherStatus }) {
  return (
    <li>
      <OptionButton
        selected={props.status === props.value}
        onClick={() => applyStatus(props.value, props)}
      >
        {statusOptionLabel(props)}
      </OptionButton>
    </li>
  );
}

function SortMenu(props: VouchersToolbarProps) {
  const ariaLabel = toastText(
    props.t,
    "common.admin.vouchers.aria.sorting",
    "Sorting",
  );
  if (!props.sortMenu.open) return null;
  return (
    <ul
      ref={props.sortMenu.menuRef}
      className="ks-training-select__menu"
      role="listbox"
      aria-label={ariaLabel}
    >
      <SortOption value="newest" {...props} />
      <SortOption value="oldest" {...props} />
      <SortOption value="code_asc" {...props} />
      <SortOption value="code_desc" {...props} />
    </ul>
  );
}

function SortOption(props: VouchersToolbarProps & { value: SortKey }) {
  return (
    <li>
      <OptionButton
        selected={props.sort === props.value}
        onClick={() => applySort(props.value, props)}
      >
        {sortLabel(props.t, props.value)}
      </OptionButton>
    </li>
  );
}

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children?: ReactNode;
}) {
  const className =
    "ks-training-select__option" + (selected ? " is-selected" : "");
  return (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  );
}

function CreateAction({ busy, openCreateDialog, t }: VouchersToolbarProps) {
  return (
    <div className="ks-vouchers-toolbar__action">
      <button
        type="button"
        className="btn"
        onClick={openCreateDialog}
        disabled={busy}
      >
        <img
          src="/icons/plus.svg"
          alt=""
          aria-hidden="true"
          className="btn__icon"
        />
        {toastText(t, "common.admin.vouchers.newVoucher", "New voucher")}
      </button>
    </div>
  );
}

function statusOptionLabel(
  props: VouchersToolbarProps & { value: VoucherStatus },
) {
  return toastText(
    props.t,
    `common.admin.vouchers.status.${props.value}`,
    props.value === "all" ? "All" : props.value,
  );
}

function onSearchKeyDown(key: string, setQ: (value: string) => void) {
  if (key === "Escape") setQ("");
}

function applyStatus(next: VoucherStatus, props: VouchersToolbarProps) {
  props.setStatus(next);
  props.statusMenu.setOpen(() => false);
}

function applySort(next: SortKey, props: VouchersToolbarProps) {
  props.setSort(next);
  props.sortMenu.setOpen(() => false);
}
