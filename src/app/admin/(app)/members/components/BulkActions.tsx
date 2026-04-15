//src\app\admin\(app)\members\components\BulkActions.tsx
"use client";

import type { RefObject } from "react";
import { useTranslation } from "react-i18next";

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
}: Props) {
  const { t } = useTranslation();
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
          {t("common.admin.members.bulk.select")}
        </button>
      </div>
    );
  }

  const deleteDisabled = busy || count === 0 || !canDelete;
  const allDisabled = busy || isEmpty;

  return (
    <div className="bulkbar">
      <div className="bulkbar__left">
        <strong>{count}</strong>&nbsp;{t("common.admin.members.bulk.selected")}
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
            {t("common.admin.members.bulk.clearAll")}
          </button>
        ) : (
          <button
            type="button"
            className={`btn btn--select-toggle ${isAllSelected ? "is-active" : ""}`}
            onClick={() => guard(onToggleAll)}
            disabled={allDisabled}
          >
            {isAllSelected
              ? t("common.admin.members.bulk.clearAll")
              : t("common.admin.members.bulk.selectAll")}
          </button>
        )}

        {canDelete ? (
          <button
            type="button"
            className="btn btn--danger"
            onClick={() => guard(onDelete)}
            disabled={deleteDisabled}
          >
            {t("common.admin.members.bulk.delete")} ({count})
          </button>
        ) : null}

        <button
          ref={cancelRef}
          type="button"
          className="btn"
          onClick={() => guard(onToggleSelectMode)}
        >
          {t("common.admin.members.bulk.cancel")}
        </button>
      </div>
    </div>
  );
}
