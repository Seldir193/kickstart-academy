import type { TFunction } from "i18next";
import { fieldClassName } from "../lib/form";
import type { LocationFieldConfig } from "../types";

type Props = {
  field: LocationFieldConfig;
  value: string;
  onChange: (value: string) => void;
  t: TFunction;
};

export default function LocationTextField({
  field,
  value,
  onChange,
  t,
}: Props) {
  return (
    <div className={fieldClassName(field.full)}>
      <label className="dialog-label">{fieldLabel(field.labelKey, t)}</label>
      <input
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function fieldLabel(labelKey: string, t: TFunction) {
  return t(`common.admin.franchiseLocations.formDialog.fields.${labelKey}`);
}
