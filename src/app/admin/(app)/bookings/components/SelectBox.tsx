"use client";

import type { ReactNode } from "react";
import type { useDropdown } from "./useDropdown";

export default function SelectBox(props: {
  dd: ReturnType<typeof useDropdown>;
  label: string;
  disabled: boolean;
  ariaLabel: string;
  children: ReactNode;
}) {
  const cls =
    "ks-training-select" + (props.dd.open ? " ks-training-select--open" : "");

  return (
    <div className={cls}>
      <button
        type="button"
        ref={props.dd.triggerRef}
        className="ks-training-select__trigger"
        onClick={props.dd.toggle}
        disabled={props.disabled}
        aria-haspopup="listbox"
        aria-expanded={props.dd.open}
      >
        <span className="ks-training-select__label">{props.label}</span>
        <span className="ks-training-select__chevron" aria-hidden="true" />
      </button>

      {props.dd.open ? (
        <ul
          ref={props.dd.menuRef}
          className="ks-training-select__menu"
          role="listbox"
          aria-label={props.ariaLabel}
        >
          {props.children}
        </ul>
      ) : null}
    </div>
  );
}
