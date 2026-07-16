"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import type { PartnerSortKey, PartnerStatusFilter } from "../helpers";

type Props = {
  query: string;
  status: PartnerStatusFilter;
  sort: PartnerSortKey;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: PartnerStatusFilter) => void;
  onSortChange: (value: PartnerSortKey) => void;
};

type SelectOption<T extends string> = {
  value: T;
  label: string;
};

type Translate = ReturnType<typeof useTranslation>["t"];

function useCloseOnOutsideClick(
  ref: RefObject<HTMLDivElement | null>,
  close: () => void,
) {
  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!ref.current?.contains(event.target as Node)) close();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [ref, close]);
}

export default function PartnerFiltersBar(props: Props) {
  return (
    <div className="partner-admin__filters">
      <PartnerSearchInput {...props} />
      <PartnerSortSelect value={props.sort} onChange={props.onSortChange} />
      <PartnerStatusSelect
        value={props.status}
        onChange={props.onStatusChange}
      />
    </div>
  );
}

function PartnerSearchInput(props: Props) {
  const { t } = useTranslation();

  return (
    <input
      className="input partner-admin__search"
      value={props.query}
      placeholder={t("admin.partners.searchPlaceholder")}
      onChange={(event) => props.onQueryChange(event.target.value)}
    />
  );
}

function PartnerSortSelect(props: {
  value: PartnerSortKey;
  onChange: (value: PartnerSortKey) => void;
}) {
  const { t } = useTranslation();

  return (
    <PartnerSelect
      className="partner-admin__select"
      value={props.value}
      options={sortOptions(t)}
      onChange={props.onChange}
    />
  );
}

function sortOptions(t: Translate): SelectOption<PartnerSortKey>[] {
  return [
    { value: "newest", label: t("admin.partners.sort.newest") },
    { value: "oldest", label: t("admin.partners.sort.oldest") },
    { value: "aToZ", label: t("admin.partners.sort.aToZ") },
    { value: "zToA", label: t("admin.partners.sort.zToA") },
  ];
}

function PartnerStatusSelect(props: {
  value: PartnerStatusFilter;
  onChange: (value: PartnerStatusFilter) => void;
}) {
  const { t } = useTranslation();

  return (
    <PartnerSelect
      className="partner-admin__select"
      value={props.value}
      options={statusOptions(t)}
      onChange={props.onChange}
    />
  );
}

function statusOptions(t: Translate): SelectOption<PartnerStatusFilter>[] {
  return [
    { value: "all", label: t("admin.partners.filter.all") },
    { value: "active", label: t("admin.partners.active") },
    { value: "inactive", label: t("admin.partners.inactive") },
  ];
}

type SelectView<T extends string> = {
  className: string;
  value: T;
  options: SelectOption<T>[];
  isOpen: boolean;
  dropdownRef: RefObject<HTMLDivElement | null>;
  label: string;
  toggle: () => void;
  pick: (value: T) => void;
};

function PartnerSelect<T extends string>(props: {
  className: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const active = props.options.find((option) => option.value === props.value);
  useCloseOnOutsideClick(dropdownRef, () => setIsOpen(false));
  const view: SelectView<T> = {
    ...props,
    isOpen,
    dropdownRef,
    label: active?.label || "",
    toggle: () => setIsOpen((open) => !open),
    pick: (value) => pickOption(props.onChange, setIsOpen, value),
  };
  return <SelectBox {...view} />;
}

function SelectBox<T extends string>(view: SelectView<T>) {
  return (
    <div
      ref={view.dropdownRef}
      className={selectClass(view.className, view.isOpen)}
    >
      <SelectTrigger label={view.label} toggle={view.toggle} />

      {view.isOpen ? <SelectPanel {...view} /> : null}
    </div>
  );
}

function SelectTrigger(props: { label: string; toggle: () => void }) {
  return (
    <button
      type="button"
      className="ks-selectbox__trigger"
      onClick={props.toggle}
    >
      <span className="ks-selectbox__label">{props.label}</span>
      <span className="ks-selectbox__chevron" aria-hidden="true" />
    </button>
  );
}

function SelectPanel<T extends string>({
  options,
  value,
  pick,
}: SelectView<T>) {
  return (
    <div className="ks-selectbox__panel">
      {options.map((option) => (
        <SelectOptionButton
          key={option.value}
          option={option}
          active={value === option.value}
          onPick={pick}
        />
      ))}
    </div>
  );
}

function SelectOptionButton<T extends string>(props: {
  option: SelectOption<T>;
  active: boolean;
  onPick: (value: T) => void;
}) {
  return (
    <button
      type="button"
      className={
        "ks-selectbox__option" +
        (props.active ? " ks-selectbox__option--active" : "")
      }
      onClick={() => props.onPick(props.option.value)}
    >
      {props.option.label}
    </button>
  );
}

function selectClass(className: string, isOpen: boolean) {
  return `${className} ks-selectbox${isOpen ? " ks-selectbox--open" : ""}`;
}

function pickOption<T extends string>(
  onChange: (value: T) => void,
  setIsOpen: (open: boolean) => void,
  value: T,
) {
  onChange(value);
  setIsOpen(false);
}
