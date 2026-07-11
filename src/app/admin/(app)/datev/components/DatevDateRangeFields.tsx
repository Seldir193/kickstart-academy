import type { TFunction } from "i18next";
import KsDatePicker from "@/app/admin/(app)/invoices/components/KsDatePicker";
import type { DatevExportModel } from "../datev.types";

type DateFieldProps = {
  label: string;
  value: string;
  onChange: DatevExportModel["setFrom"];
  placeholder: string;
};

function DateField({ label, value, onChange, placeholder }: DateFieldProps) {
  return (
    <label className="block">
      <span className="text-sm text-gray-700">{label}</span>
      <KsDatePicker value={value} onChange={onChange} placeholder={placeholder} disabled={false} />
    </label>
  );
}

type Props = Pick<DatevExportModel, "from" | "to" | "setFrom" | "setTo"> & {
  t: TFunction;
};

export default function DatevDateRangeFields({ from, to, setFrom, setTo, t }: Props) {
  const placeholder = t("common.admin.datev.datePlaceholder", {
    defaultValue: "dd.mm.yyyy",
  });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
      <DateField label={t("common.admin.datev.fromLabel", { defaultValue: "From (incl.)" })} value={from} onChange={setFrom} placeholder={placeholder} />
      <DateField label={t("common.admin.datev.toLabel", { defaultValue: "To (incl.)" })} value={to} onChange={setTo} placeholder={placeholder} />
    </div>
  );
}
