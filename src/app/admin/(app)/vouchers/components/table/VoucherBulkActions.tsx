"use client";

import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import BulkActions from "@/app/admin/(app)/news/components/BulkActions";
import type { Voucher } from "../../types";
import {
  getActiveVoucherIds,
  getInactiveVoucherIds,
} from "./vouchersTable.helpers";

export type VoucherBulkActionsProps = {
  items: Voucher[];
  selectMode: boolean;
  busy: boolean;
  count: number;
  selected: Set<string>;
  isAllSelected: boolean;
  toggleBtnRef?: RefObject<HTMLButtonElement | null>;
  cancelBtnRef: RefObject<HTMLButtonElement | null>;
  clearBtnRef: RefObject<HTMLButtonElement | null>;
  onToggleMode: () => void;
  onToggleAll: () => void;
  onClear: () => void;
  onDelete: () => Promise<void>;
  onActivate: () => Promise<void>;
  onDeactivate: () => Promise<void>;
};

type Translate = ReturnType<typeof useTranslation>["t"];

type StatusButtonsProps = {
  busy: boolean;
  selectMode: boolean;
  activateCount: number;
  deactivateCount: number;
  onActivate: () => Promise<void>;
  onDeactivate: () => Promise<void>;
};

export default function VoucherBulkActions(props: VoucherBulkActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="news-admin__top-actions">
      <BulkActions {...bulkProps(props, t)} />
      <VoucherStatusButtons {...statusProps(props)} />
    </div>
  );
}

function VoucherStatusButtons(props: StatusButtonsProps) {
  const { t } = useTranslation();

  return (
    <>
      <ActivateButton {...props} t={t} />
      <DeactivateButton {...props} t={t} />
    </>
  );
}

function ActivateButton({
  t,
  ...props
}: StatusButtonsProps & { t: Translate }) {
  if (!props.selectMode || !props.activateCount) return null;
  return (
    <StatusButton
      busy={props.busy}
      label={t("common.admin.vouchers.bulk.activate")}
      count={props.activateCount}
      onClick={props.onActivate}
    />
  );
}

function DeactivateButton({
  t,
  ...props
}: StatusButtonsProps & { t: Translate }) {
  if (!props.selectMode || !props.deactivateCount) return null;
  return (
    <StatusButton
      busy={props.busy}
      label={t("common.admin.vouchers.bulk.deactivate")}
      count={props.deactivateCount}
      onClick={props.onDeactivate}
    />
  );
}

function StatusButton(props: {
  busy: boolean;
  label: string;
  count: number;
  onClick: () => Promise<void>;
}) {
  return (
    <button
      type="button"
      className="btn"
      disabled={props.busy}
      onClick={props.onClick}
    >
      {props.label} ({props.count})
    </button>
  );
}

function bulkProps(props: VoucherBulkActionsProps, t: Translate) {
  return {
    ...bulkRefs(props),
    ...bulkState(props),
    ...bulkLabels(t),
  };
}

function bulkRefs(props: VoucherBulkActionsProps) {
  return {
    toggleRef: props.toggleBtnRef as RefObject<HTMLButtonElement | null>,
    cancelRef: props.cancelBtnRef,
    clearRef: props.clearBtnRef,
  };
}

function bulkState(props: VoucherBulkActionsProps) {
  return {
    selectMode: props.selectMode,
    onToggleSelectMode: props.onToggleMode,
    count: props.count,
    isAllSelected: props.isAllSelected,
    busy: props.busy,
    isEmpty: props.items.length === 0,
    onToggleAll: props.onToggleAll,
    onClear: props.onClear,
    showClear: props.selectMode && props.count >= 2,
    onDelete: props.onDelete,
  };
}

function bulkLabels(t: Translate) {
  return {
    toggleLabel: t("common.admin.vouchers.bulk.toggle"),
    selectedLabel: t("common.admin.vouchers.bulk.selected"),
    selectAllLabel: t("common.admin.vouchers.bulk.selectAll"),
    clearAllLabel: t("common.admin.vouchers.bulk.clearAll"),
    deleteLabel: t("common.admin.vouchers.bulk.delete"),
    cancelLabel: t("common.admin.vouchers.bulk.cancel"),
  };
}

function statusProps(props: VoucherBulkActionsProps) {
  return {
    busy: props.busy,
    selectMode: props.selectMode,
    activateCount: getInactiveVoucherIds(props.items, props.selected).length,
    deactivateCount: getActiveVoucherIds(props.items, props.selected).length,
    onActivate: props.onActivate,
    onDeactivate: props.onDeactivate,
  };
}
