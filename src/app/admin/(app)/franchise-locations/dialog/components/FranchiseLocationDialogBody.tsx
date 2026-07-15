import type { TFunction } from "i18next";
import { LOCATION_FIELDS } from "../lib/form";
import type { useFranchiseLocationDialogState } from "../hooks/useFranchiseLocationDialogState";
import type { LocationFieldKey, LocationForm } from "../types";
import LocationTextField from "./LocationTextField";

type Props = {
  model: ReturnType<typeof useFranchiseLocationDialogState>;
  t: TFunction;
};

export default function FranchiseLocationDialogBody({ model, t }: Props) {
  return (
    <div className="dialog-body fl-dialog__body">
      {model.err ? (
        <div className="error fl-dialog__error">{model.err}</div>
      ) : null}
      <FieldsGrid form={model.form} setForm={model.setForm} t={t} />
    </div>
  );
}

function FieldsGrid({ form, setForm, t }: FieldGridProps) {
  return (
    <div className="fl-dialog__grid">
      {LOCATION_FIELDS.map((field) => renderField(form, setForm, field, t))}
    </div>
  );
}

function renderField(
  form: LocationForm,
  setForm: FieldSetter,
  field: FieldGridField,
  t: TFunction,
) {
  return (
    <LocationTextField
      key={field.name}
      field={field}
      value={form[field.name]}
      onChange={updateField(form, setForm, field.name)}
      t={t}
    />
  );
}

function updateField(
  form: LocationForm,
  setForm: (form: LocationForm) => void,
  name: LocationFieldKey,
) {
  return (value: string) => setForm({ ...form, [name]: value });
}

type FieldGridProps = {
  form: LocationForm;
  setForm: FieldSetter;
  t: TFunction;
};

type FieldGridField = (typeof LOCATION_FIELDS)[number];

type FieldSetter = (form: LocationForm) => void;
