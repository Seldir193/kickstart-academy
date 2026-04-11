// src/app/admin/(app)/coaches/components/BulkActions.tsx
"use client";

import type { RefObject } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  toggleRef: RefObject<HTMLButtonElement | null>;
  cancelRef: RefObject<HTMLButtonElement | null>;
  clearRef: RefObject<HTMLButtonElement | null>;
  selectMode: boolean;
  onToggleSelectMode: () => void;
  count: number;
  isAllSelected?: boolean;
  disabled: boolean;
  onToggleAll: () => void;
  onClear: () => void;
  showClear: boolean;
  onDelete: () => void;
};

export default function BulkActions({
  toggleRef,
  cancelRef,
  clearRef,
  selectMode,
  onToggleSelectMode,
  count,
  isAllSelected,
  disabled,
  onToggleAll,
  onClear,
  showClear,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  useEffect(() => {
    if (!selectMode) return;

    const cancelEl = cancelRef.current;
    if (!cancelEl) return;

    const active = document.activeElement;

    if (count === 0) {
      requestAnimationFrame(() => cancelEl.focus());
      return;
    }

    if (active === cancelEl) requestAnimationFrame(() => cancelEl.blur());
  }, [selectMode, count, cancelRef]);

  if (!selectMode) {
    return (
      <div className="actions coach-admin__actions">
        <button
          ref={toggleRef}
          type="button"
          className="btn btn--select-toggle"
          onClick={onToggleSelectMode}
          disabled={disabled}
        >
          {t("common.admin.coaches.bulk.select")}
        </button>
      </div>
    );
  }

  return (
    <div className="bulkbar">
      <div className="bulkbar__left">
        <strong>{count}</strong>&nbsp;{t("common.admin.coaches.bulk.selected")}
      </div>

      <div className="bulkbar__right">
        {showClear ? (
          <button
            ref={clearRef}
            type="button"
            className="btn btn--select-toggle is-active"
            onClick={onClear}
            disabled={disabled}
          >
            {t("common.admin.coaches.bulk.clearSelection")}
          </button>
        ) : (
          <button
            type="button"
            className={`btn btn--select-toggle ${isAllSelected ? "is-active" : ""}`}
            onClick={onToggleAll}
            disabled={disabled}
          >
            {isAllSelected
              ? t("common.admin.coaches.bulk.clearSelection")
              : t("common.admin.coaches.bulk.selectAll")}
          </button>
        )}

        <button
          type="button"
          className="btn btn--danger"
          onClick={onDelete}
          disabled={disabled || count === 0}
        >
          {t("common.admin.coaches.bulk.delete")} ({count})
        </button>

        <button
          ref={cancelRef}
          type="button"
          className="btn btn--focus-black"
          onClick={onToggleSelectMode}
          disabled={disabled}
        >
          {t("common.admin.coaches.bulk.cancel")}
        </button>
      </div>
    </div>
  );
}
