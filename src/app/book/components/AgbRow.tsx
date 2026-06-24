import type React from "react";
import { useTranslation } from "react-i18next";
import type { FormState } from "../bookTypes";

type Props = {
  form: FormState;
  errors: Record<string, string>;
  isCampBooking: boolean;
  onChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
};

export function AgbRow({ form, errors, isCampBooking, onChange }: Props) {
  const { t } = useTranslation("book");

  return (
    <>
      {isCampBooking && <p className="camp-hint">{t("agb.campHint")}</p>}
      <div className="field-row agb-row">
        <label className="checkbox">
          <input
            type="checkbox"
            name="accept"
            checked={form.accept}
            onChange={onChange}
          />
          <span>{t("agb.accept")}</span>
        </label>
        {errors.accept && <span className="error">{errors.accept}</span>}
      </div>
    </>
  );
}
