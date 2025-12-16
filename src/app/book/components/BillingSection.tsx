// app/book/components/BillingSection.tsx
import type React from 'react';
import type { FormState } from '../bookTypes';

type Props = {
  form: FormState;
  errors: Record<string, string>;
  onChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  handleCaretClick: (e: React.MouseEvent<HTMLElement>) => void;
  handleCaretBlur: (e: React.FocusEvent<HTMLElement>) => void;
};

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
            checked={form.salutation === 'Frau'}
            onChange={onChange}
          />
          Frau
        </label>
        <label className="radio">
          <input
            type="radio"
            name="salutation"
            value="Herr"
            checked={form.salutation === 'Herr'}
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
          <div className="book-select book-select--caret">
            <select
              name="source"
              value={form.source}
              onChange={onChange}
              className="book-select__native"
              onClick={handleCaretClick}
              onBlur={handleCaretBlur}
            >
              <option value="">Bitte wählen</option>
              <option>Google</option>
              <option>Social Media</option>
              <option>Freunde / Familie</option>
              <option>Plakat / Flyer</option>
              <option>Sonstiges</option>
            </select>
            <span className="book-select__icon" aria-hidden="true">
              <img src="/icons/select-caret.svg" alt="" />
            </span>
          </div>
        </div>
      </div>
    </fieldset>
  );
}
