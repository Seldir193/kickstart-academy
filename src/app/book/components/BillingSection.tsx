// app/book/components/BillingSection.tsx
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { FormState } from "../bookTypes";

type Props = {
  form: FormState;
  errors: Record<string, string>;
  onChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleCaretClick: (e: React.MouseEvent<HTMLElement>) => void;
  handleCaretBlur: (e: React.FocusEvent<HTMLElement>) => void;
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
  direction = "down",
}: {
  name: string;
  value: string;
  placeholder: string;
  options: KsOption[];
  onChange: Props["onChange"];
  direction?: "down" | "up";
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
      className={`ks-selectbox ${open ? "ks-selectbox--open" : ""} ${
        direction === "up" ? "ks-selectbox--up" : ""
      }`}
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

export function BillingSection({
  form,
  errors,
  onChange,
  handleCaretClick,
  handleCaretBlur,
}: Props) {
  return (
    <fieldset className="card card--muted">
      <legend>2. Rechnung &amp; Kontakt</legend>

      <div className="field-row">
        <label className="radio">
          <input
            type="radio"
            name="salutation"
            value="Frau"
            checked={form.salutation === "Frau"}
            onChange={onChange}
          />
          Frau
        </label>
        <label className="radio">
          <input
            type="radio"
            name="salutation"
            value="Herr"
            checked={form.salutation === "Herr"}
            onChange={onChange}
          />
          Herr
        </label>
      </div>

      <div className="field-grid">
        <div className="field">
          <label>Ihr Vorname</label>
          <input
            name="parentFirst"
            value={form.parentFirst}
            onChange={onChange}
          />
        </div>
        <div className="field">
          <label>Ihr Nachname</label>
          <input
            name="parentLast"
            value={form.parentLast}
            onChange={onChange}
          />
        </div>
        <div className="field">
          <label>Straße</label>
          <input name="street" value={form.street} onChange={onChange} />
        </div>
        <div className="field">
          <label>Hausnr.</label>
          <input name="houseNo" value={form.houseNo} onChange={onChange} />
        </div>
        <div className="field">
          <label>PLZ</label>
          <input name="zip" value={form.zip} onChange={onChange} />
        </div>
        <div className="field">
          <label>Ort</label>
          <input name="city" value={form.city} onChange={onChange} />
        </div>
        <div className="field">
          <label>Telefon</label>
          <input name="phone" value={form.phone} onChange={onChange} />
        </div>
        <div className="field">
          <label>Telefon 2</label>
          <input name="phone2" value={form.phone2} onChange={onChange} />
        </div>
        <div className="field">
          <label>E-Mail*</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>
      </div>

      <div className="field-grid">
        <div className="field">
          <label>Gutschein / Firmencode</label>
          <input name="voucher" value={form.voucher} onChange={onChange} />
        </div>

        <div className="field">
          <label>Wie sind Sie auf uns aufmerksam geworden?</label>

          <KsSelectbox
            name="source"
            value={form.source}
            placeholder="Bitte wählen"
            direction="up"
            options={[
              { value: "Google", label: "Google" },
              { value: "Social Media", label: "Social Media" },
              { value: "Freunde / Familie", label: "Freunde / Familie" },
              { value: "Plakat / Flyer", label: "Plakat / Flyer" },
              { value: "Sonstiges", label: "Sonstiges" },
            ]}
            onChange={onChange}
          />
        </div>
      </div>
    </fieldset>
  );
}
