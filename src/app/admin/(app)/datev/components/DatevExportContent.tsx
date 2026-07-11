import type { TFunction } from "i18next";
import type { DatevExportModel } from "../datev.types";
import DatevDateRangeFields from "./DatevDateRangeFields";
import DatevDescription from "./DatevDescription";
import DatevDownloadButton from "./DatevDownloadButton";

type Props = { model: DatevExportModel; t: TFunction };

export default function DatevExportContent({ model, t }: Props) {
  return (
    <div className="p-4 max-w-2xl datev-export-page">
      <h1 className="text-2xl font-bold m-0">{t("common.admin.datev.title", { defaultValue: "DATEV export (OPOS variant)" })}</h1>
      <DatevDateRangeFields {...model} t={t} />
      <DatevDescription t={t} />
      {model.err && <div className="mb-3 text-red-600">{model.err}</div>}
      <DatevDownloadButton model={model} t={t} />
    </div>
  );
}
