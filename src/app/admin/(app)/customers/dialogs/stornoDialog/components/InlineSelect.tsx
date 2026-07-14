"use client";

import React from "react";

type Option = { value: string; label: string };

type Props = {
  label: string;
  value: string;
  displayLabel: string;
  options: Option[];
  rootRef: React.RefObject<HTMLDivElement | null>;
  open: boolean;
  setOpen: (v: boolean) => void;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function InlineSelect({
  label,
  value,
  displayLabel,
  options,
  rootRef,
  open,
  setOpen,
  onChange,
  disabled,
}: Props) {
  return (
    <div className="grid gap-1">
      <label className="lbl">{label}</label>

      <div
        className={"ks-selectbox" + (open ? " ks-selectbox--open" : "")}
        ref={rootRef}
      >
        <button
          type="button"
          className="ks-selectbox__trigger"
          onClick={() => setOpen(!open)}
          disabled={Boolean(disabled)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="ks-selectbox__label">{displayLabel}</span>
          <span className="ks-selectbox__chevron" aria-hidden="true" />
        </button>

        {open && (
          <div className="ks-selectbox__panel" role="listbox">
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                className={
                  "ks-selectbox__option" +
                  (value === o.value ? " ks-selectbox__option--active" : "")
                }
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
