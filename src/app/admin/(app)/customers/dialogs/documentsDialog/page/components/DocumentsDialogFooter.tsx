import { DownloadButton } from "./DownloadButton";
import type { DocumentsDialogState } from "../types";

export function DocumentsDialogFooter({
  state,
}: {
  state: DocumentsDialogState;
}) {
  return (
    <div className="dialog-footer documents-dialog__footer">
      <div className="documents-dialog__footerActions">
        <DownloadButton
          href={state.list.csvHref}
          label={state.t("admin.customers.documents.download.csv")}
        />
        <DownloadButton
          href={state.list.zipHref}
          label={state.t("admin.customers.documents.download.zip")}
        />
      </div>
    </div>
  );
}
