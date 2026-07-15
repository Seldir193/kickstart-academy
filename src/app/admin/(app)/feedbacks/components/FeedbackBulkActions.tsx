"use client";

import type { RefObject } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  toggleRef: RefObject<HTMLButtonElement | null>;
  cancelRef: RefObject<HTMLButtonElement | null>;
  clearRef: RefObject<HTMLButtonElement | null>;
  selectMode: boolean;
  count: number;
  isAllSelected?: boolean;
  disabled: boolean;
  showClear: boolean;
  onToggleSelectMode: () => void;
  onToggleAll: () => void;
  onClear: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
};

export default function FeedbackBulkActions(props: Props) {
  if (!props.selectMode) return <SelectModeButton {...props} />;
  return <FeedbackBulkBar {...props} />;
}

function SelectModeButton(props: Props) {
  const { t } = useTranslation();

  return (
    <div className="actions news-admin__actions">
      <button
        ref={props.toggleRef}
        type="button"
        className="btn"
        onClick={props.onToggleSelectMode}
        disabled={props.disabled}
      >
        {t("admin.feedbacks.bulk.select")}
      </button>
    </div>
  );
}

function FeedbackBulkBar(props: Props) {
  const { t } = useTranslation();

  return (
    <div className="bulkbar">
      <div className="bulkbar__left">
        <strong>{props.count}</strong>&nbsp;
        {t("admin.feedbacks.bulk.selected")}
      </div>

      <div className="bulkbar__right">
        <ClearOrSelectAllButton {...props} />
        <DeactivateButton {...props} />
        <DeleteButton {...props} />
        <CancelButton {...props} />
      </div>
    </div>
  );
}

function ClearOrSelectAllButton(props: Props) {
  if (props.showClear) return <ClearButton {...props} />;
  return <SelectAllButton {...props} />;
}

function ClearButton(props: Props) {
  const { t } = useTranslation();

  return (
    <button
      ref={props.clearRef}
      type="button"
      className="btn"
      onClick={props.onClear}
      disabled={props.disabled}
    >
      {t("admin.feedbacks.bulk.clearSelection")}
    </button>
  );
}

function SelectAllButton(props: Props) {
  const { t } = useTranslation();

  return (
    <button
      ref={props.toggleRef}
      type="button"
      className="btn"
      onClick={props.onToggleAll}
      disabled={props.disabled}
    >
      {getSelectAllLabel(props, t)}
    </button>
  );
}

function DeactivateButton(props: Props) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className="btn"
      onClick={props.onDeactivate}
      disabled={props.disabled || props.count === 0}
    >
      {t("admin.feedbacks.bulk.deactivate")} ({props.count})
    </button>
  );
}

function DeleteButton(props: Props) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className="btn btn--danger"
      onClick={props.onDelete}
      disabled={props.disabled || props.count === 0}
    >
      {t("admin.feedbacks.bulk.delete")} ({props.count})
    </button>
  );
}

function CancelButton(props: Props) {
  const { t } = useTranslation();

  return (
    <button
      ref={props.cancelRef}
      type="button"
      className="btn"
      onClick={props.onToggleSelectMode}
      disabled={props.disabled}
    >
      {t("admin.feedbacks.bulk.cancel")}
    </button>
  );
}

function getSelectAllLabel(props: Props, t: (key: string) => string) {
  if (props.isAllSelected) return t("admin.feedbacks.bulk.clearSelection");
  return t("admin.feedbacks.bulk.selectAll");
}
