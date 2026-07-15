import type { TFunction } from "i18next";
import BulkModeToggle from "./BulkModeToggle";
import type { BulkActionsProps } from "./types";

type Props = BulkActionsProps & { t: TFunction };

export default function BulkActionsActive(props: Props) {
  return (
    <div className="bulkbar">
      <BulkCount {...props} />
      <BulkButtons {...props} />
    </div>
  );
}

function BulkCount({ count, t }: Props) {
  return (
    <div className="bulkbar__left">
      <strong>{count}</strong>&nbsp;{t("common.admin.coaches.bulk.selected")}
    </div>
  );
}

function BulkButtons(props: Props) {
  return (
    <div className="bulkbar__right">
      <BulkModeToggle {...props} />
      <DeleteButton {...props} />
      <CancelButton {...props} />
    </div>
  );
}

function DeleteButton({ count, disabled, onDelete, t }: Props) {
  return (
    <button
      type="button"
      className="btn btn--danger"
      onClick={onDelete}
      disabled={disabled || count === 0}
    >
      {t("common.admin.coaches.bulk.delete")} ({count})
    </button>
  );
}

function CancelButton({ cancelRef, disabled, onToggleSelectMode, t }: Props) {
  return (
    <button
      ref={cancelRef}
      type="button"
      className="btn"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onToggleSelectMode}
      disabled={disabled}
    >
      {t("common.admin.coaches.bulk.cancel")}
    </button>
  );
}
