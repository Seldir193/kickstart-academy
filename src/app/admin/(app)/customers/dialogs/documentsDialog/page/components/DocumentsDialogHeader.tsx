import type { DocumentsDialogState } from "../types";

export function DocumentsDialogHeader({
  state,
}: {
  state: DocumentsDialogState;
}) {
  return (
    <div className="dialog-head documents-dialog__head">
      <div className="documents-dialog__head-main">
        <h3 id="documents-dialog-title" className="dialog-title">
          {state.t("admin.customers.documents.title")}
        </h3>
        <p className="dialog-subtitle">
          {state.t("admin.customers.documents.subtitle")}
        </p>
      </div>
      <DialogCloseButton state={state} />
    </div>
  );
}

function DialogCloseButton({ state }: { state: DocumentsDialogState }) {
  return (
    <div className="dialog-head__actions">
      <button
        type="button"
        className="dialog-close"
        aria-label={state.t("common.actions.close")}
        title={state.t("common.actions.close")}
        onClick={state.onClose}
      >
        <img
          src="/icons/close.svg"
          alt=""
          aria-hidden="true"
          className="icon-img"
        />
      </button>
    </div>
  );
}
