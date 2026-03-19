// customers/dialogs/components/KsBirthDateSelect.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  value?: string | null; // z.B. "2004-03-12"
  onChange: (nextIso: string | null) => void;
  fromYear?: number;
  toYear?: number;
};

type OpenKey = "d" | "mo" | "y" | null;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toParts(v?: string | null) {
  const raw = (v || "").slice(0, 10);
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return { y: "", mo: "", d: "" };
  return { y: m[1], mo: m[2], d: m[3] };
}

function daysInMonth(year: number, month1to12: number) {
  return new Date(year, month1to12, 0).getDate();
}

function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: () => void
) {
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      const el = ref.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) handler();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [ref, handler]);
}

function CaretIcon() {
  return <span className="ks-selectbox__chevron" aria-hidden="true"></span>;
}

function KsMiniSelectbox({
  open,
  setOpen,
  value,
  placeholder,
  options,
  onPick,
}: {
  open: boolean;
  setOpen: (next: boolean) => void;
  value: string;
  placeholder: string;
  options: string[];
  onPick: (v: string) => void;
}) {
  const label = value ? value : placeholder;

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <div className={`ks-selectbox ${open ? "ks-selectbox--open" : ""}`}>
      <button
        type="button"
        className="ks-selectbox__trigger input"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="ks-selectbox__label">{label}</span>
        <CaretIcon />
      </button>

      {open && (
        <div className="ks-selectbox__panel" role="listbox">
          <button
            type="button"
            className={`ks-selectbox__option ${
              !value ? "ks-selectbox__option--active" : ""
            }`}
            onClick={() => {
              onPick("");
              setOpen(false);
            }}
          >
            {placeholder}
          </button>

          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`ks-selectbox__option ${
                value === opt ? "ks-selectbox__option--active" : ""
              }`}
              onClick={() => {
                onPick(opt);
                setOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function KsBirthDateSelect({
  value,
  onChange,
  fromYear = 1980,
  toYear = new Date().getFullYear(),
}: Props) {
  const [draft, setDraft] = useState(() => toParts(value));
  const [openKey, setOpenKey] = useState<OpenKey>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(rootRef, () => setOpenKey(null));

  // Wenn von außen ein Wert kommt (Edit-Modus / Customer wechseln) → UI syncen
  useEffect(() => {
    setDraft(toParts(value));
  }, [value]);

  const years = useMemo(() => {
    const arr: string[] = [];
    for (let y = toYear; y >= fromYear; y--) arr.push(String(y));
    return arr;
  }, [fromYear, toYear]);

  const months = useMemo(
    () => Array.from({ length: 12 }, (_, i) => pad2(i + 1)),
    []
  );

  const days = useMemo(() => {
    const yNum = Number(draft.y);
    const mNum = Number(draft.mo);
    const max =
      draft.y && draft.mo && Number.isFinite(yNum) && Number.isFinite(mNum)
        ? daysInMonth(yNum, mNum)
        : 31;
    return Array.from({ length: max }, (_, i) => pad2(i + 1));
  }, [draft.y, draft.mo]);

  function normalizeAndCommit(next: typeof draft) {
    // Wenn etwas geleert wird → ISO löschen (damit es nicht zurückspringt)
    if (!next.y || !next.mo || !next.d) {
      onChange(null);
      return next;
    }

    const yNum = Number(next.y);
    const mNum = Number(next.mo);
    const dNum = Number(next.d);

    const max = daysInMonth(yNum, mNum);
    const safeD = Math.min(Math.max(dNum, 1), max);
    const safeDraft = { ...next, d: pad2(safeD) };

    onChange(`${safeDraft.y}-${safeDraft.mo}-${safeDraft.d}`);
    return safeDraft;
  }

  return (
    <div className="ks-dob" ref={rootRef}>
      <KsMiniSelectbox
        open={openKey === "d"}
        setOpen={(n) => setOpenKey(n ? "d" : null)}
        value={draft.d}
        placeholder="TT"
        options={days}
        onPick={(v) => {
          const next = { ...draft, d: v };
          const finalDraft = normalizeAndCommit(next);
          setDraft(finalDraft);
        }}
      />

      <KsMiniSelectbox
        open={openKey === "mo"}
        setOpen={(n) => setOpenKey(n ? "mo" : null)}
        value={draft.mo}
        placeholder="MM"
        options={months}
        onPick={(v) => {
          const next = { ...draft, mo: v };
          const finalDraft = normalizeAndCommit(next);
          setDraft(finalDraft);
        }}
      />

      <KsMiniSelectbox
        open={openKey === "y"}
        setOpen={(n) => setOpenKey(n ? "y" : null)}
        value={draft.y}
        placeholder="JJJJ"
        options={years}
        onPick={(v) => {
          const next = { ...draft, y: v };
          const finalDraft = normalizeAndCommit(next);
          setDraft(finalDraft);
        }}
      />
    </div>
  );
}
