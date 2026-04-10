// src/app/admin/franchise-locations/components/SortSelect.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { SortKey } from "../franchise_locations.utils";

type Props = {
  value: SortKey;
  onChange: (v: SortKey) => void;
};

const options: SortKey[] = [
  "newest",
  "oldest",
  "name_az",
  "name_za",
  "city_az",
  "city_za",
];

export default function SortSelect({ value, onChange }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(ev: PointerEvent) {
      const t = ev.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t))
        return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const label = useMemo(() => {
    const key = options.find((o) => o === value) || "newest";
    return t(`common.admin.franchiseLocations.sort.${key}`);
  }, [t, value]);

  return (
    <div
      className={
        "ks-training-select" + (open ? " ks-training-select--open" : "")
      }
    >
      <button
        ref={triggerRef}
        type="button"
        className="ks-training-select__trigger"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="ks-training-select__label">{label}</span>
        <span className="ks-training-select__chevron" aria-hidden="true" />
      </button>

      {open ? (
        <ul
          ref={menuRef}
          className="ks-training-select__menu"
          role="listbox"
          aria-label={t("common.admin.franchiseLocations.sort.aria")}
        >
          {options.map((o) => (
            <li key={o}>
              <button
                type="button"
                className={
                  "ks-training-select__option" +
                  (o === value ? " is-selected" : "")
                }
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
              >
                {t(`common.admin.franchiseLocations.sort.${o}`)}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
