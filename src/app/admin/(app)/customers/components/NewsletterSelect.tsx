"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { NewsletterFilter } from "../hooks/useCustomersList";
import { useOutsideClick } from "../hooks/useOutsideClick";

const options: { value: NewsletterFilter; labelKey: string }[] = [
  { value: "all", labelKey: "admin.customers.newsletterSelect.all" },
  { value: "true", labelKey: "admin.customers.newsletterSelect.yes" },
  { value: "false", labelKey: "admin.customers.newsletterSelect.no" },
];

type Props = {
  value: NewsletterFilter;
  onChange: (v: NewsletterFilter) => void;
  onAnyChange: () => void;
};

type SelectProps = Props & {
  open: boolean;
  setOpen: (v: boolean | ((current: boolean) => boolean)) => void;
  t: (key: string) => string;
};

export default function NewsletterSelect(props: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useOutsideClick(open, ref, () => setOpen(false));

  return (
    <div className="ks-customers-toolbar-select">
      <div ref={ref} className={selectClass(open)}>
        <NewsletterTrigger {...props} open={open} setOpen={setOpen} t={t} />
        <NewsletterMenu {...props} open={open} setOpen={setOpen} t={t} />
      </div>
    </div>
  );
}

function selectClass(open: boolean) {
  return `ks-filter-select ${open ? "ks-filter-select--open" : ""}`;
}

function NewsletterTrigger(props: SelectProps) {
  const label = useNewsletterLabel(props.value, props.t);
  return (
    <button
      type="button"
      className="ks-filter-select__trigger"
      onClick={() => props.setOpen((open) => !open)}
      aria-label={props.t("admin.customers.newsletterSelect.ariaLabel")}
      title={props.t("admin.customers.newsletterSelect.ariaLabel")}
    >
      <span className="ks-filter-select__label">{label}</span>
      <span className="ks-filter-select__chevron" aria-hidden="true" />
    </button>
  );
}

function useNewsletterLabel(value: NewsletterFilter, t: SelectProps["t"]) {
  return useMemo(() => {
    if (value === "true") return t("admin.customers.newsletterSelect.yes");
    if (value === "false") return t("admin.customers.newsletterSelect.no");
    return t("admin.customers.newsletterSelect.all");
  }, [t, value]);
}

function NewsletterMenu(props: SelectProps) {
  if (!props.open) return null;
  return (
    <ul className="ks-filter-select__menu">
      {options.map((option) => (
        <NewsletterOption key={option.value} option={option} {...props} />
      ))}
    </ul>
  );
}

function NewsletterOption(
  args: {
    option: (typeof options)[number];
  } & SelectProps,
) {
  return (
    <li>
      <button
        type="button"
        className={optionClass(args.value === args.option.value)}
        onClick={() => pick(args, args.option.value)}
      >
        {args.t(args.option.labelKey)}
      </button>
    </li>
  );
}

function optionClass(active: boolean) {
  return "ks-filter-select__option" + (active ? " is-selected" : "");
}

function pick(props: SelectProps, value: NewsletterFilter) {
  props.onAnyChange();
  props.onChange(value);
  props.setOpen(false);
}
