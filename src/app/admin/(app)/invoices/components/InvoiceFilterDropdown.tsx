"use client";

import React, { useRef, useState } from "react";
import { useDropdownClose } from "../hooks/useDropdownClose";

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (next: T) => void;
  disabled?: boolean;
  className?: string;
};

export default function InvoiceFilterDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
  className = "",
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);

  useDropdownClose({
    open,
    triggerRef,
    menuRef,
    onClose: () => setOpen(false),
  });

  const selected = options.find((it) => it.value === value);

  function toggleOpen() {
    if (disabled) return;
    setOpen((prev) => !prev);
  }

  function selectValue(next: T) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div className={`ks-invoices-filter ${className}`.trim()}>
      <div
        className={`ks-training-select${open ? " ks-training-select--open" : ""}`}
      >
        <button
          type="button"
          ref={triggerRef}
          className="ks-training-select__trigger"
          onClick={toggleOpen}
          disabled={disabled}
        >
          <span className="ks-training-select__label">
            {selected?.label || ""}
          </span>
          <span className="ks-training-select__chevron" aria-hidden="true" />
        </button>

        {open ? (
          <ul
            ref={menuRef}
            className="ks-training-select__menu"
            role="listbox"
            aria-label={label}
          >
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  className={
                    "ks-training-select__option" +
                    (value === opt.value ? " is-selected" : "")
                  }
                  onClick={() => selectValue(opt.value)}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
