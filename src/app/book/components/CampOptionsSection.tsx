// app/book/components/CampOptionsSection.tsx
import type React from 'react';
import type { FormState } from '../bookTypes';
import { TSHIRT_OPTIONS } from '../bookTypes';

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
  return (
    <fieldset className="card camp-options">
      <legend>Camp-Optionen</legend>

      {/* T-Shirt-Größe Hauptkind */}
      <div className="field">
        <label>T-Shirt-Größe*</label>
        <div className="book-select book-select--caret">
          <select
            name="tshirtSize"
            value={form.tshirtSize}
            onChange={onChange}
            className="book-select__native"
            onClick={handleCaretClick}
            onBlur={handleCaretBlur}
          >
            <option value="">Bitte einen Eintrag auswählen</option>
            {TSHIRT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span className="book-select__icon" aria-hidden="true">
            <img src="/icons/select-caret.svg" alt="" />
          </span>
        </div>
        {errors.tshirtSize && (
          <span className="error">{errors.tshirtSize}</span>
        )}
      </div>

      {/* Torwartschule Hauptkind */}
      <div className="field">
        <label>Torwartschule? (+40€)*</label>
        <div className="camp-toggle-row">
          <button
            type="button"
            className={`camp-toggle-btn ${
              form.goalkeeper === 'no' ? 'is-active' : ''
            }`}
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                goalkeeper: 'no',
              }))
            }
          >
            Nein
          </button>
          <button
            type="button"
            className={`camp-toggle-btn ${
              form.goalkeeper === 'yes' ? 'is-active' : ''
            }`}
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                goalkeeper: 'yes',
              }))
            }
          >
            Ja
          </button>
        </div>
      </div>

      <hr className="camp-divider" />

      {/* Geschwisterkind */}
      <div className="sibling-header">
        <h3>Geschwister dazu buchen</h3>
        <label className="checkbox">
          <input
            type="checkbox"
            name="siblingEnabled"
            checked={form.siblingEnabled}
            onChange={onChange}
          />
          <span>Ja (14 Euro Rabatt erhalten)</span>
        </label>
      </div>

      {form.siblingEnabled && (
        <div className="sibling-fields">
          {/* Geschlecht + Geburtstag Geschwister */}
          <div className="field-row">
            <label className="radio">
              <input
                type="radio"
                name="siblingGender"
                value="weiblich"
                checked={form.siblingGender === 'weiblich'}
                onChange={onChange}
              />
              weiblich
            </label>
            <label className="radio">
              <input
                type="radio"
                name="siblingGender"
                value="männlich"
                checked={form.siblingGender === 'männlich'}
                onChange={onChange}
              />
              männlich
            </label>
          </div>

          <div className="field">
            <label>Geburtstag</label>
            <div className="dob">
              {/* TT Geschwister */}
              <div className="book-select book-select--chevron">
                <select
                  name="siblingBirthDay"
                  value={form.siblingBirthDay}
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

              {/* MM Geschwister */}
              <div className="book-select book-select--chevron">
                <select
                  name="siblingBirthMonth"
                  value={form.siblingBirthMonth}
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

              {/* JJJJ Geschwister */}
              <div className="book-select book-select--chevron">
                <select
                  name="siblingBirthYear"
                  value={form.siblingBirthYear}
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
          </div>

          {/* Name Geschwister */}
          <div className="field-grid">
            <div className="field">
              <label>Vorname (Kind)*</label>
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
              <label>Nachname (Kind)*</label>
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

          {/* T-Shirt + Torwartschule Geschwister */}
          <div className="field">
            <label>T-Shirt-Größe (Geschwister)*</label>
            <div className="book-select book-select--caret">
              <select
                name="siblingTshirtSize"
                value={form.siblingTshirtSize}
                onChange={onChange}
                className="book-select__native"
                onClick={handleCaretClick}
                onBlur={handleCaretBlur}
              >
                <option value="">Bitte einen Eintrag auswählen</option>
                {TSHIRT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className="book-select__icon" aria-hidden="true">
                <img src="/icons/select-caret.svg" alt="" />
              </span>
            </div>
            {errors.siblingTshirtSize && (
              <span className="error">{errors.siblingTshirtSize}</span>
            )}
          </div>

          <div className="field">
            <label>Torwartschule (Geschwister)? (+40€)</label>
            <div className="camp-toggle-row">
              <button
                type="button"
                className={`camp-toggle-btn ${
                  form.siblingGoalkeeper === 'no' ? 'is-active' : ''
                }`}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    siblingGoalkeeper: 'no',
                  }))
                }
              >
                Nein
              </button>
              <button
                type="button"
                className={`camp-toggle-btn ${
                  form.siblingGoalkeeper === 'yes' ? 'is-active' : ''
                }`}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    siblingGoalkeeper: 'yes',
                  }))
                }
              >
                Ja
              </button>
            </div>
          </div>
        </div>
      )}
    </fieldset>
  );
}
