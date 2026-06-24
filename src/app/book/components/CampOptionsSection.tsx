import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FormState } from "../bookTypes";
import { TSHIRT_OPTIONS } from "../bookTypes";

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
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  handleCaretClick: (e: React.MouseEvent<HTMLElement>) => void;
  handleCaretBlur: (e: React.FocusEvent<HTMLElement>) => void;
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

export function CampOptionsSection({
  form,
  errors,
  DAY_OPTS,
  MONTH_OPTS,
  YEAR_OPTS,
  onChange,
  setForm,
  handleCaretClick,
  handleCaretBlur,
}: Props) {
  const { t } = useTranslation("book");

  return (
    <fieldset className="card camp-options">
      <legend>{t("camp.legend")}</legend>

      <div className="field">
        <label>{t("camp.tshirtMain")}</label>

        <KsSelectbox
          name="tshirtSize"
          value={form.tshirtSize}
          placeholder={t("camp.selectPlaceholder")}
          // options={TSHIRT_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
          options={TSHIRT_OPTIONS.map((opt) => ({
            value: opt.value,
            label: t(opt.labelKey),
          }))}
          onChange={onChange}
        />

        {errors.tshirtSize && (
          <span className="error">{errors.tshirtSize}</span>
        )}
      </div>

      <div className="field">
        <label>{t("camp.goalkeeperMain")}</label>
        <div className="camp-toggle-row">
          <button
            type="button"
            className={`camp-toggle-btn ${
              form.goalkeeper === "no" ? "is-active" : ""
            }`}
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                goalkeeper: "no",
              }))
            }
          >
            {t("common.no")}
          </button>
          <button
            type="button"
            className={`camp-toggle-btn ${
              form.goalkeeper === "yes" ? "is-active" : ""
            }`}
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                goalkeeper: "yes",
              }))
            }
          >
            {t("common.yes")}
          </button>
        </div>
      </div>

      <hr className="camp-divider" />

      <div className="sibling-header">
        <h3>{t("camp.sibling.title")}</h3>
        <label className="checkbox">
          <input
            type="checkbox"
            name="siblingEnabled"
            checked={form.siblingEnabled}
            onChange={onChange}
          />
          <span>{t("camp.sibling.discount")}</span>
        </label>
      </div>

      {form.siblingEnabled && (
        <div className="sibling-fields">
          <div className="field-row">
            <label className="radio">
              <input
                type="radio"
                name="siblingGender"
                value="weiblich"
                checked={form.siblingGender === "weiblich"}
                onChange={onChange}
              />
              {t("child.gender.female")}
            </label>
            <label className="radio">
              <input
                type="radio"
                name="siblingGender"
                value="männlich"
                checked={form.siblingGender === "männlich"}
                onChange={onChange}
              />
              {t("child.gender.male")}
            </label>
          </div>

          <div className="field">
            <label>{t("child.birthdate.label")}</label>
            <div className="dob">
              <KsSelectbox
                name="siblingBirthDay"
                value={form.siblingBirthDay}
                placeholder={t("child.birthdate.day")}
                options={DAY_OPTS.map((d) => ({ value: d, label: d }))}
                onChange={onChange}
              />

              <KsSelectbox
                name="siblingBirthMonth"
                value={form.siblingBirthMonth}
                placeholder={t("child.birthdate.month")}
                options={MONTH_OPTS.map((m) => ({ value: m, label: m }))}
                onChange={onChange}
              />

              <KsSelectbox
                name="siblingBirthYear"
                value={form.siblingBirthYear}
                placeholder={t("child.birthdate.year")}
                options={YEAR_OPTS.map((y) => ({ value: y, label: y }))}
                onChange={onChange}
              />
            </div>
          </div>

          <div className="field-grid">
            <div className="field">
              <label>{t("child.firstName")}</label>
              <input
                name="siblingFirst"
                value={form.siblingFirst}
                onChange={onChange}
              />
              {errors.siblingFirst && (
                <span className="error">{errors.siblingFirst}</span>
              )}
            </div>
            <div className="field">
              <label>{t("child.lastName")}</label>
              <input
                name="siblingLast"
                value={form.siblingLast}
                onChange={onChange}
              />
              {errors.siblingLast && (
                <span className="error">{errors.siblingLast}</span>
              )}
            </div>
          </div>

          <div className="field">
            <label>{t("camp.sibling.tshirt")}</label>

            <KsSelectbox
              name="siblingTshirtSize"
              value={form.siblingTshirtSize}
              placeholder={t("camp.selectPlaceholder")}
              // options={TSHIRT_OPTIONS.map((opt) => ({
              //   value: opt,
              //   label: opt,
              // }))}
              options={TSHIRT_OPTIONS.map((opt) => ({
                value: opt.value,
                label: t(opt.labelKey),
              }))}
              onChange={onChange}
            />

            {errors.siblingTshirtSize && (
              <span className="error">{errors.siblingTshirtSize}</span>
            )}
          </div>

          <div className="field">
            <label>{t("camp.sibling.goalkeeper")}</label>
            <div className="camp-toggle-row">
              <button
                type="button"
                className={`camp-toggle-btn ${
                  form.siblingGoalkeeper === "no" ? "is-active" : ""
                }`}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    siblingGoalkeeper: "no",
                  }))
                }
              >
                {t("common.no")}
              </button>
              <button
                type="button"
                className={`camp-toggle-btn ${
                  form.siblingGoalkeeper === "yes" ? "is-active" : ""
                }`}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    siblingGoalkeeper: "yes",
                  }))
                }
              >
                {t("common.yes")}
              </button>
            </div>
          </div>
        </div>
      )}
    </fieldset>
  );
}
