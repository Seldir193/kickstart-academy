"use client";

import React, { useMemo, useRef, useState } from "react";
import type { NewsletterFilter } from "../hooks/useCustomersList";
import { useOutsideClick } from "../hooks/useOutsideClick";

const options: { value: NewsletterFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

type Props = {
  value: NewsletterFilter;
  onChange: (v: NewsletterFilter) => void;
  onAnyChange: () => void;
};

export default function NewsletterSelect({
  value,
  onChange,
  onAnyChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const label = useMemo(() => {
    if (value === "true") return "Yes";
    if (value === "false") return "No";
    return "All";
  }, [value]);

  useOutsideClick(open, ref, () => setOpen(false));

  function pick(v: NewsletterFilter) {
    onAnyChange();
    onChange(v);
    setOpen(false);
  }

  return (
    <div>
      <label className="block text-sm text-gray-600">Newsletter</label>

      <div
        ref={ref}
        className={`ks-filter-select ${open ? "ks-filter-select--open" : ""}`}
      >
        <button
          type="button"
          className="ks-filter-select__trigger"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="ks-filter-select__label">{label}</span>
          <span className="ks-filter-select__chevron" aria-hidden="true" />
        </button>

        {open && (
          <ul className="ks-filter-select__menu">
            {options.map((opt) => (
              <li key={`${opt.value}-${opt.label}`}>
                <button
                  type="button"
                  className={
                    "ks-filter-select__option" +
                    (value === opt.value ? " is-selected" : "")
                  }
                  onClick={() => pick(opt.value)}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
