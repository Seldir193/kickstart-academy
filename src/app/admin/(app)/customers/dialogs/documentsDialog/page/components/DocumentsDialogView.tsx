import type { DocumentsDialogState } from "../types";
import { DocumentsDialogHeader } from "./DocumentsDialogHeader";
import { DocumentsDialogBody } from "./DocumentsDialogBody";
import { DocumentsDialogFooter } from "./DocumentsDialogFooter";

export function DocumentsDialogView({
  state,
}: {
  state: DocumentsDialogState;
}) {
  return (
    <div
      className="dialog-backdrop documents-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="documents-dialog-title"
    >
      <button
        type="button"
        className="dialog-backdrop-hit"
        aria-label={state.t("common.actions.close")}
        onClick={state.onClose}
      />
      <div
        className="dialog documents-dialog__dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <DocumentsDialogHeader state={state} />
        <DocumentsDialogBody state={state} />
        <DocumentsDialogFooter state={state} />
      </div>
    </div>
  );
}
