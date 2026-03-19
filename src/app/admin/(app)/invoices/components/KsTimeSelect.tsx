//src\app\admin\(app)\invoices\components\KsTimeSelect.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  stepMinutes?: number;
  disabled?: boolean;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function buildTimes(stepMinutes: number) {
  const step = Math.max(1, Math.min(60, Math.floor(stepMinutes)));
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += step) out.push(`${pad2(h)}:${pad2(m)}`);
  }
  return out;
}

export default function KsTimeSelect({
  value,
  onChange,
  placeholder = "—",
  stepMinutes = 15,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const options = useMemo(() => buildTimes(stepMinutes), [stepMinutes]);
  const label = value?.trim() ? value : placeholder;

  return (
    <div
      ref={rootRef}
      className={"ks-selectbox" + (open ? " ks-selectbox--open" : "")}
    >
      <button
        type="button"
        className="ks-selectbox__trigger input"
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        <span className="ks-selectbox__label">{label}</span>
        <span className="ks-selectbox__chevron" aria-hidden="true" />
      </button>

      {open && (
        <div
          className="ks-selectbox__panel ks-scroll-thin"
          style={{ maxHeight: 240, overflow: "auto", scrollbarWidth: "thin" }}
          role="listbox"
        >
          <button
            type="button"
            className={
              "ks-selectbox__option" +
              (!value ? " ks-selectbox__option--active" : "")
            }
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            —
          </button>

          {options.map((t) => (
            <button
              key={t}
              type="button"
              className={
                "ks-selectbox__option" +
                (value === t ? " ks-selectbox__option--active" : "")
              }
              onClick={() => {
                onChange(t);
                setOpen(false);
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
