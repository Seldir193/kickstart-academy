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

export default function VoucherBulkActions(props: VoucherBulkActionsProps) {
  const { t } = useTranslation();
  const activateCount = getInactiveVoucherIds(
    props.items,
    props.selected,
  ).length;
  const deactivateCount = getActiveVoucherIds(
    props.items,
    props.selected,
  ).length;

  return (
    <div className="news-admin__top-actions">
      <BulkActions
        toggleRef={props.toggleBtnRef as RefObject<HTMLButtonElement | null>}
        cancelRef={props.cancelBtnRef}
        clearRef={props.clearBtnRef}
        selectMode={props.selectMode}
        onToggleSelectMode={props.onToggleMode}
        count={props.count}
        isAllSelected={props.isAllSelected}
        busy={props.busy}
        isEmpty={props.items.length === 0}
        onToggleAll={props.onToggleAll}
        onClear={props.onClear}
        showClear={props.selectMode && props.count >= 2}
        onDelete={props.onDelete}
        toggleLabel={t("common.admin.vouchers.bulk.toggle")}
        selectedLabel={t("common.admin.vouchers.bulk.selected")}
        selectAllLabel={t("common.admin.vouchers.bulk.selectAll")}
        clearAllLabel={t("common.admin.vouchers.bulk.clearAll")}
        deleteLabel={t("common.admin.vouchers.bulk.delete")}
        cancelLabel={t("common.admin.vouchers.bulk.cancel")}
      />
      <VoucherStatusButtons
        busy={props.busy}
        selectMode={props.selectMode}
        activateCount={activateCount}
        deactivateCount={deactivateCount}
        onActivate={props.onActivate}
        onDeactivate={props.onDeactivate}
      />
    </div>
  );
}

function VoucherStatusButtons(props: {
  busy: boolean;
  selectMode: boolean;
  activateCount: number;
  deactivateCount: number;
  onActivate: () => Promise<void>;
  onDeactivate: () => Promise<void>;
}) {
  const { t } = useTranslation();

  return (
    <>
      {props.selectMode && props.activateCount ? (
        <button
          type="button"
          className="btn"
          disabled={props.busy}
          onClick={props.onActivate}
        >
          {t("common.admin.vouchers.bulk.activate")} ({props.activateCount})
        </button>
      ) : null}
      {props.selectMode && props.deactivateCount ? (
        <button
          type="button"
          className="btn"
          disabled={props.busy}
          onClick={props.onDeactivate}
        >
          {t("common.admin.vouchers.bulk.deactivate")} ({props.deactivateCount})
        </button>
      ) : null}
    </>
  );
}
