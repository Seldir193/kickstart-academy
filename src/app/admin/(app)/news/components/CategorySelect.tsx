"use client";

import type { Category } from "../types";
import { CATEGORIES } from "../constants";

type Props = {
  value: Category | undefined;
  open: boolean;
  onToggle: () => void;
  onPick: (c: Category) => void;
};

export default function CategorySelect({
  value,
  open,
  onToggle,
  onPick,
}: Props) {
  const current = value || "News";
  return (
    <div className={"ks-selectbox" + (open ? " ks-selectbox--open" : "")}>
      <button
        type="button"
        className="ks-selectbox__trigger"
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="ks-selectbox__label">{current}</span>
        <span className="ks-selectbox__chevron" aria-hidden="true" />
      </button>

      {open ? (
        <div className="ks-selectbox__panel" role="listbox">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={
                "ks-selectbox__option" +
                (current === c ? " ks-selectbox__option--active" : "")
              }
              onClick={() => onPick(c)}
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
