// app/book/components/ChildSection.tsx
import type React from 'react';
import type { FormState } from '../bookTypes';

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
            checked={form.childGender === 'weiblich'}
            onChange={onChange}
          />
          weiblich
        </label>
        <label className="radio">
          <input
            type="radio"
            name="childGender"
            value="männlich"
            checked={form.childGender === 'männlich'}
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
            <div className="book-select book-select--chevron">
              <select
                name="birthDay"
                value={form.birthDay}
                onChange={onChange}
                className="book-select__native"
              >
                <option value="">TT</option>
                {DAY_OPTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <span className="book-select__icon" aria-hidden="true">
                <img src="/icons/chevron-down.svg" alt="" />
              </span>
            </div>

            {/* MM */}
            <div className="book-select book-select--chevron">
              <select
                name="birthMonth"
                value={form.birthMonth}
                onChange={onChange}
                className="book-select__native"
              >
                <option value="">MM</option>
                {MONTH_OPTS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <span className="book-select__icon" aria-hidden="true">
                <img src="/icons/chevron-down.svg" alt="" />
              </span>
            </div>

            {/* JJJJ */}
            <div className="book-select book-select--chevron">
              <select
                name="birthYear"
                value={form.birthYear}
                onChange={onChange}
                className="book-select__native"
              >
                <option value="">JJJJ</option>
                {YEAR_OPTS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <span className="book-select__icon" aria-hidden="true">
                <img src="/icons/chevron-down.svg" alt="" />
              </span>
            </div>
          </div>
          {(errors.birthDay || errors.birthMonth || errors.birthYear) && (
            <span className="error">Bitte gültiges Geburtsdatum wählen</span>
          )}
        </div>

        <div className="field">
          <label>Vorname (Kind)*</label>
          <input name="childFirst" value={form.childFirst} onChange={onChange} />
          {errors.childFirst && <span className="error">{errors.childFirst}</span>}
        </div>

        <div className="field">
          <label>Nachname (Kind)*</label>
          <input name="childLast" value={form.childLast} onChange={onChange} />
          {errors.childLast && <span className="error">{errors.childLast}</span>}
        </div>
      </div>
    </fieldset>
  );
}
