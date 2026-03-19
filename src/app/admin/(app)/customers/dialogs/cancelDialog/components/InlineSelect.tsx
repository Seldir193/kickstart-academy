"use client";

import React from "react";

type Item = { value: string; label: string };

type Props = {
  label: string;
  valueLabel: string;
  open: boolean;
  setOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  rootRef: React.RefObject<HTMLDivElement>;
  items: Item[];
  activeValue: string;
  onSelect: (v: string) => void;
};

export function InlineSelect({
  label,
  valueLabel,
  open,
  setOpen,
  rootRef,
  items,
  activeValue,
  onSelect,
}: Props) {
  return (
    <div>
      <label className="lbl">{label}</label>
      <div
        className={"ks-selectbox" + (open ? " ks-selectbox--open" : "")}
        ref={rootRef}
      >
        <button
          type="button"
          className="ks-selectbox__trigger"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="ks-selectbox__label">{valueLabel}</span>
          <span className="ks-selectbox__chevron" aria-hidden="true" />
        </button>

        {open && (
          <div className="ks-selectbox__panel" role="listbox">
            {items.map((o) => (
              <button
                key={o.value}
                type="button"
                className={
                  "ks-selectbox__option" +
                  (activeValue === o.value
                    ? " ks-selectbox__option--active"
                    : "")
                }
                onClick={() => {
                  onSelect(o.value);
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
