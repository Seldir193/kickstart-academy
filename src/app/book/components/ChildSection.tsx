import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
};

type KsOption = { value: string; label: string };

function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: () => void,
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
  value: string,
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
        <span className="ks-selectbox__chevron" aria-hidden="true">
          <img src="/icons/dialog/caret-down.svg" alt="" />
        </span>
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
  const { t } = useTranslation("book");

  return (
    <fieldset className="card">
      <legend>{t("child.legend")}</legend>

      <div className="field-row">
        <label className="radio">
          <input
            type="radio"
            name="childGender"
            value="weiblich"
            checked={form.childGender === "weiblich"}
            onChange={onChange}
          />
          {t("child.gender.female")}
        </label>
        <label className="radio">
          <input
            type="radio"
            name="childGender"
            value="männlich"
            checked={form.childGender === "männlich"}
            onChange={onChange}
          />
          {t("child.gender.male")}
        </label>
      </div>

      <div className="field-grid">
        <div className="field">
          <label>{t("child.birthdate.label")}</label>
          <div className="dob">
            <KsSelectbox
              name="birthDay"
              value={form.birthDay}
              placeholder={t("child.birthdate.day")}
              options={DAY_OPTS.map((d) => ({ value: d, label: d }))}
              onChange={onChange}
            />

            <KsSelectbox
              name="birthMonth"
              value={form.birthMonth}
              placeholder={t("child.birthdate.month")}
              options={MONTH_OPTS.map((m) => ({ value: m, label: m }))}
              onChange={onChange}
            />

            <KsSelectbox
              name="birthYear"
              value={form.birthYear}
              placeholder={t("child.birthdate.year")}
              options={YEAR_OPTS.map((y) => ({ value: y, label: y }))}
              onChange={onChange}
            />
          </div>

          {(errors.birthDay || errors.birthMonth || errors.birthYear) && (
            <span className="error">{t("child.birthdate.error")}</span>
          )}
        </div>

        <div className="field">
          <label>{t("child.firstName")}</label>
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
          <label>{t("child.lastName")}</label>
          <input name="childLast" value={form.childLast} onChange={onChange} />
          {errors.childLast && (
            <span className="error">{errors.childLast}</span>
          )}
        </div>
      </div>
    </fieldset>
  );
}
