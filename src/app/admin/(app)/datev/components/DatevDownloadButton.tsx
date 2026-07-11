import type { TFunction } from "i18next";
import { getDownloadIconSrc } from "../datev.helpers";
import type { DatevExportModel } from "../datev.types";

type Props = { model: DatevExportModel; t: TFunction };

function DownloadLabel({ loading, t }: Pick<DatevExportModel, "loading"> & { t: TFunction }) {
  const key = loading ? "common.admin.datev.exportRunning" : "common.admin.datev.downloadZip";
  const defaultValue = loading ? "Export running…" : "Download ZIP";
  return <span>{t(key, { defaultValue })}</span>;
}

export default function DatevDownloadButton({ model, t }: Props) {
  return (
    <button className="btn ks-invoices__downloadBtn" onClick={model.runExport} disabled={model.loading} onMouseEnter={model.activateDownload} onMouseLeave={model.deactivateDownload} onFocus={model.activateDownload} onBlur={model.deactivateDownload}>
      <img src={getDownloadIconSrc(model.isDownloadActive)} alt="" aria-hidden="true" className="ks-invoices__downloadIcon" />
      <DownloadLabel loading={model.loading} t={t} />
    </button>
  );
}
