import type { TFunction } from "i18next";

type Props = { t: TFunction };

function ExportedDocumentTypes({ t }: Props) {
  return (
    <>
      {t("common.admin.datev.description.prefix", { defaultValue: "Exports " })}
      <b>
        {t("common.admin.datev.description.invoices", {
          defaultValue: "invoices",
        })}
      </b>{" "}
      &{" "}
      <b>
        {t("common.admin.datev.description.creditNotes", {
          defaultValue: "credit notes",
        })}
      </b>{" "}
      {t("common.admin.datev.description.middle", {
        defaultValue: "as well as ",
      })}
      <b>
        {t("common.admin.datev.description.fees", {
          defaultValue: "dunning/payment reminder fees",
        })}
      </b>{" "}
      {t("common.admin.datev.description.suffix", {
        defaultValue: "as a ZIP with",
      })}
    </>
  );
}

function ExportFileNames({ t }: Props) {
  return (
    <>
      <code className="mx-1">buchungen_extf.csv</code>
      {t("common.admin.datev.description.and", { defaultValue: "and" })}
      <code className="mx-1">buchungen_readable.csv</code>.
    </>
  );
}

function ExportNote({ t }: Props) {
  return (
    <span className="block mt-1">
      {t("common.admin.datev.note", {
        defaultValue:
          "Note: Dunning fees are exported as separate booking lines (RLS/MAHN/BEARB) if the amount is greater than 0.",
      })}
    </span>
  );
}

export default function DatevDescription({ t }: Props) {
  return (
    <div className="text-sm text-gray-600 mb-4">
      <ExportedDocumentTypes t={t} />
      <ExportFileNames t={t} />
      <ExportNote t={t} />
    </div>
  );
}
