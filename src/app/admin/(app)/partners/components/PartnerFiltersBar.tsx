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
  const options: SelectOption<PartnerSortKey>[] = [
    { value: "newest", label: t("admin.partners.sort.newest") },
    { value: "oldest", label: t("admin.partners.sort.oldest") },
    { value: "aToZ", label: t("admin.partners.sort.aToZ") },
    { value: "zToA", label: t("admin.partners.sort.zToA") },
  ];

  return (
    <PartnerSelect
      className="partner-admin__select"
      value={props.value}
      options={options}
      onChange={props.onChange}
    />
  );
}

function PartnerStatusSelect(props: {
  value: PartnerStatusFilter;
  onChange: (value: PartnerStatusFilter) => void;
}) {
  const { t } = useTranslation();
  const options: SelectOption<PartnerStatusFilter>[] = [
    { value: "all", label: t("admin.partners.filter.all") },
    { value: "active", label: t("admin.partners.active") },
    { value: "inactive", label: t("admin.partners.inactive") },
  ];

  return (
    <PartnerSelect
      className="partner-admin__select"
      value={props.value}
      options={options}
      onChange={props.onChange}
    />
  );
}

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

  function pick(value: T) {
    props.onChange(value);
    setIsOpen(false);
  }

  return (
    <div
      ref={dropdownRef}
      className={`${props.className} ks-selectbox${
        isOpen ? " ks-selectbox--open" : ""
      }`}
    >
      <button
        type="button"
        className="ks-selectbox__trigger"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="ks-selectbox__label">{active?.label || ""}</span>
        <span className="ks-selectbox__chevron" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="ks-selectbox__panel">
          {props.options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={
                "ks-selectbox__option" +
                (props.value === option.value
                  ? " ks-selectbox__option--active"
                  : "")
              }
              onClick={() => pick(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
