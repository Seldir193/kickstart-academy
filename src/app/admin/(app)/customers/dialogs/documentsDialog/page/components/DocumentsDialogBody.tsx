import type { DocumentsDialogState } from "../types";
import { DocumentsFiltersSection } from "./DocumentsFiltersSection";
import { DocumentsScopeSection } from "./DocumentsScopeSection";

export function DocumentsDialogBody({ state }: { state: DocumentsDialogState }) {
  return (
    <div className="dialog-body documents-dialog__body">
      <DocumentsScopeSection state={state} />
      <DocumentsFiltersSection state={state} />
    </div>
  );
}
