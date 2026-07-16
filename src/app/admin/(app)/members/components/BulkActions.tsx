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

type ViewProps = Props & { t: ReturnType<typeof useTranslation>["t"] };

export default function BulkActions({ canDelete = true, ...rest }: Props) {
  const { t } = useTranslation();
  const view: ViewProps = { ...rest, canDelete, t };
  if (!rest.selectMode) return <SelectModeBar {...view} />;
  return <BulkBar {...view} />;
}

function SelectModeBar({
  toggleRef,
  isEmpty,
  busy,
  onToggleSelectMode,
  t,
}: ViewProps) {
  return (
    <div className="actions news-admin__actions">
      <button
        ref={toggleRef}
        type="button"
        className="btn btn--select-toggle"
        onClick={() => guard(busy, onToggleSelectMode)}
        disabled={isEmpty}
      >
        {t("common.admin.members.bulk.select")}
      </button>
    </div>
  );
}

function BulkBar(props: ViewProps) {
  return (
    <div className="bulkbar">
      <BulkBarLeft {...props} />

      <div className="bulkbar__right">
        <SelectionButton {...props} />

        {props.canDelete ? <DeleteButton {...props} /> : null}

        <CancelButton {...props} />
      </div>
    </div>
  );
}

function BulkBarLeft({ count, t }: ViewProps) {
  return (
    <div className="bulkbar__left">
      <strong>{count}</strong>&nbsp;{t("common.admin.members.bulk.selected")}
    </div>
  );
}

function SelectionButton(props: ViewProps) {
  return props.showClear ? (
    <ClearButton {...props} />
  ) : (
    <ToggleAllButton {...props} />
  );
}

function ClearButton({ clearRef, busy, isEmpty, onClear, t }: ViewProps) {
  return (
    <button
      ref={clearRef}
      type="button"
      className="btn btn--select-toggle is-active"
      onClick={() => guard(busy, onClear)}
      disabled={busy || isEmpty}
    >
      {t("common.admin.members.bulk.clearAll")}
    </button>
  );
}

function ToggleAllButton({
  isAllSelected,
  busy,
  isEmpty,
  onToggleAll,
  t,
}: ViewProps) {
  return (
    <button
      type="button"
      className={`btn btn--select-toggle ${isAllSelected ? "is-active" : ""}`}
      onClick={() => guard(busy, onToggleAll)}
      disabled={busy || isEmpty}
    >
      {isAllSelected
        ? t("common.admin.members.bulk.clearAll")
        : t("common.admin.members.bulk.selectAll")}
    </button>
  );
}

function DeleteButton({ count, busy, canDelete, onDelete, t }: ViewProps) {
  return (
    <button
      type="button"
      className="btn btn--danger"
      onClick={() => guard(busy, onDelete)}
      disabled={busy || count === 0 || !canDelete}
    >
      {t("common.admin.members.bulk.delete")} ({count})
    </button>
  );
}

function CancelButton({ cancelRef, busy, onToggleSelectMode, t }: ViewProps) {
  return (
    <button
      ref={cancelRef}
      type="button"
      className="btn"
      onClick={() => guard(busy, onToggleSelectMode)}
    >
      {t("common.admin.members.bulk.cancel")}
    </button>
  );
}

function guard(busy: boolean, cb: () => void) {
  if (busy) return;
  cb();
}
