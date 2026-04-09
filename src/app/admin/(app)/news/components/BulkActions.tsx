"use client";

import { useTranslation } from "react-i18next";
import type { RefObject } from "react";

type Props = {
  toggleRef: RefObject<HTMLButtonElement | null>;
  cancelRef: RefObject<HTMLButtonElement | null>;
  clearRef: RefObject<HTMLButtonElement | null>;
  selectMode: boolean;
  onToggleSelectMode: () => void;
  count: number;
  isAllSelected?: boolean;
  busy: boolean;
  isEmpty: boolean;
  onToggleAll: () => void;
  onClear: () => void;
  showClear: boolean;
  onDelete: () => void;
  canDelete?: boolean;
  toggleLabel?: string;
  selectedLabel?: string;
  selectAllLabel?: string;
  clearAllLabel?: string;
  deleteLabel?: string;
  cancelLabel?: string;
};

export default function BulkActions({
  toggleRef,
  cancelRef,
  clearRef,
  selectMode,
  onToggleSelectMode,
  count,
  isAllSelected,
  busy,
  isEmpty,
  onToggleAll,
  onClear,
  showClear,
  onDelete,
  canDelete = true,
  toggleLabel,
  selectedLabel,
  selectAllLabel,
  clearAllLabel,
  deleteLabel,
  cancelLabel,
}: Props) {
  const { t } = useTranslation();

  const resolvedToggleLabel = toggleLabel || t("common.bulkActions.select");
  const resolvedSelectedLabel =
    selectedLabel || t("common.bulkActions.selected");
  const resolvedSelectAllLabel =
    selectAllLabel || t("common.bulkActions.selectAll");
  const resolvedClearAllLabel =
    clearAllLabel || t("common.bulkActions.clearAll");
  const resolvedDeleteLabel = deleteLabel || t("common.delete");
  const resolvedCancelLabel = cancelLabel || t("common.cancel");

  function guard(cb: () => void) {
    if (busy) return;
    cb();
  }

  if (!selectMode) {
    return (
      <div className="actions news-admin__actions">
        <button
          ref={toggleRef}
          type="button"
          className="btn btn--select-toggle"
          onClick={() => guard(onToggleSelectMode)}
          disabled={isEmpty}
        >
          {resolvedToggleLabel}
        </button>
      </div>
    );
  }

  const deleteDisabled = busy || count === 0 || !canDelete;
  const allDisabled = busy || isEmpty;

  return (
    <div className="bulkbar">
      <div className="bulkbar__left">
        <strong>{count}</strong>&nbsp;{resolvedSelectedLabel}
      </div>

      <div className="bulkbar__right">
        {showClear ? (
          <button
            ref={clearRef}
            type="button"
            className="btn btn--select-toggle is-active"
            onClick={() => guard(onClear)}
            disabled={allDisabled}
          >
            {resolvedClearAllLabel}
          </button>
        ) : (
          <button
            type="button"
            className={`btn btn--select-toggle ${isAllSelected ? "is-active" : ""}`}
            onClick={() => guard(onToggleAll)}
            disabled={allDisabled}
          >
            {isAllSelected ? resolvedClearAllLabel : resolvedSelectAllLabel}
          </button>
        )}

        {canDelete ? (
          <button
            type="button"
            className="btn btn--danger"
            onClick={() => guard(onDelete)}
            disabled={deleteDisabled}
          >
            {resolvedDeleteLabel} ({count})
          </button>
        ) : null}

        <button
          ref={cancelRef}
          type="button"
          className="btn"
          onClick={() => guard(onToggleSelectMode)}
        >
          {resolvedCancelLabel}
        </button>
      </div>
    </div>
  );
}
