// src/app/admin/(app)/franchise-locations/components/BulkActions.tsx
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
  if (!selectMode) {
    return (
      <div className="actions news-admin__actions">
        <button
          ref={toggleRef}
          type="button"
          className="btn btn--select-toggle"
          onClick={onToggleSelectMode}
          disabled={disabled}
        >
          {t("common.admin.franchiseLocations.bulk.select")}
        </button>
      </div>
    );
  }

  return (
    <div className="bulkbar">
      <div className="bulkbar__left">
        <strong>{count}</strong>&nbsp;
        {t("common.admin.franchiseLocations.bulk.selected")}
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
            {t("common.admin.franchiseLocations.bulk.clearSelection")}
          </button>
        ) : (
          <button
            ref={toggleRef}
            type="button"
            className={`btn btn--select-toggle ${isAllSelected ? "is-active" : ""}`}
            onClick={onToggleAll}
            disabled={disabled}
          >
            {isAllSelected
              ? t("common.admin.franchiseLocations.bulk.clearSelection")
              : t("common.admin.franchiseLocations.bulk.selectAll")}
          </button>
        )}

        <button
          type="button"
          className="btn btn--danger"
          onClick={onDelete}
          disabled={disabled || count === 0}
        >
          {t("common.admin.franchiseLocations.bulk.delete")} ({count})
        </button>

        <button
          ref={cancelRef}
          type="button"
          className="btn btn--focus-black"
          onClick={onToggleSelectMode}
          disabled={disabled}
        >
          {t("common.admin.franchiseLocations.bulk.cancel")}
        </button>
      </div>
    </div>
  );
}
