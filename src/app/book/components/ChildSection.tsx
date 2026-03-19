// app/book/components/ChildSection.tsx
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { FormState } from "../bookTypes";

type Props = {
  form: FormState;
  errors: Record<string, string>;
  DAY_OPTS: string[];
  MONTH_OPTS: string[];
  YEAR_OPTS: string[];
  onChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
};

type KsOption = { value: string; label: string };

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

function emitSelectChange(
  onChange: Props["onChange"],
  name: string,
  value: string
) {
  onChange({
    target: { name, value, type: "select-one" },
  } as any);
}

function KsSelectbox({
  name,
  value,
  placeholder,
  options,
  onChange,
}: {
  name: string;
  value: string;
  placeholder: string;
  options: KsOption[];
  onChange: Props["onChange"];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(ref, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const label = value ? value : placeholder;

  return (
    <div
      ref={ref}
      className={`ks-selectbox ${open ? "ks-selectbox--open" : ""}`}
    >
      <button
        type="button"
        className="ks-selectbox__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="ks-selectbox__label">{label}</span>
        <span className="ks-selectbox__chevron" aria-hidden="true" />
      </button>

      {open && (
        <div className="ks-selectbox__panel" role="listbox">
          <button
            type="button"
            className={`ks-selectbox__option ${
              !value ? "ks-selectbox__option--active" : ""
            }`}
            onClick={() => {
              emitSelectChange(onChange, name, "");
              setOpen(false);
            }}
          >
            {placeholder}
          </button>

          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`ks-selectbox__option ${
                value === opt.value ? "ks-selectbox__option--active" : ""
              }`}
              onClick={() => {
                emitSelectChange(onChange, name, opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ChildSection({
  form,
  errors,
  DAY_OPTS,
  MONTH_OPTS,
  YEAR_OPTS,
  onChange,
}: Props) {
  return (
    <fieldset className="card">
      <legend>1. Angaben zum Kind</legend>

      <div className="field-row">
        <label className="radio">
          <input
            type="radio"
            name="childGender"
            value="weiblich"
            checked={form.childGender === "weiblich"}
            onChange={onChange}
          />
          weiblich
        </label>
        <label className="radio">
          <input
            type="radio"
            name="childGender"
            value="männlich"
            checked={form.childGender === "männlich"}
            onChange={onChange}
          />
          männlich
        </label>
      </div>

      <div className="field-grid">
        <div className="field">
          <label>Geburtstag</label>
          <div className="dob">
            {/* TT */}
            <KsSelectbox
              name="birthDay"
              value={form.birthDay}
              placeholder="TT"
              options={DAY_OPTS.map((d) => ({ value: d, label: d }))}
              onChange={onChange}
            />

            {/* MM */}
            <KsSelectbox
              name="birthMonth"
              value={form.birthMonth}
              placeholder="MM"
              options={MONTH_OPTS.map((m) => ({ value: m, label: m }))}
              onChange={onChange}
            />

            {/* JJJJ */}
            <KsSelectbox
              name="birthYear"
              value={form.birthYear}
              placeholder="JJJJ"
              options={YEAR_OPTS.map((y) => ({ value: y, label: y }))}
              onChange={onChange}
            />
          </div>

          {(errors.birthDay || errors.birthMonth || errors.birthYear) && (
            <span className="error">Bitte gültiges Geburtsdatum wählen</span>
          )}
        </div>

        <div className="field">
          <label>Vorname (Kind)*</label>
          <input
            name="childFirst"
            value={form.childFirst}
            onChange={onChange}
          />
          {errors.childFirst && (
            <span className="error">{errors.childFirst}</span>
          )}
        </div>

        <div className="field">
          <label>Nachname (Kind)*</label>
          <input name="childLast" value={form.childLast} onChange={onChange} />
          {errors.childLast && (
            <span className="error">{errors.childLast}</span>
          )}
        </div>
      </div>
    </fieldset>
  );
}
