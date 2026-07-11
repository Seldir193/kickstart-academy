"use client";

import { useTranslation } from "react-i18next";
import type { Voucher } from "../../types";
import { formatDateOnly } from "../../utils/dateFormat";
import { formatVoucherAmount } from "./vouchersTable.helpers";

export default function VoucherTableRow(props: {
  item: Voucher;
  selectMode: boolean;
  checked: boolean;
  onOpen: (item: Voucher) => void;
  onRowClick: (item: Voucher) => void;
}) {
  const { t, i18n } = useTranslation();
  const { item, selectMode, checked } = props;
  const hideEdit = selectMode || checked;

  return (
    <li
      className={rowClassName(checked, selectMode)}
      onClick={() => props.onRowClick(item)}
      onKeyDown={(event) => handleRowKeyDown(event, () => props.onRowClick(item))}
      tabIndex={0}
      role="button"
      aria-pressed={selectMode ? checked : undefined}
      aria-label={rowLabel(t, item, selectMode)}
    >
      <VoucherCodeCell item={item} />
      <div className="news-list__cell bookings-mono">{formatVoucherAmount(item.amount)}</div>
      <div className="news-list__cell">{statusText(t, item.active)}</div>
      <div className="news-list__cell">{formatDateOnly(item.createdAt, i18n.language)}</div>
      <VoucherActionCell hidden={hideEdit} item={item} onOpen={props.onOpen} />
    </li>
  );
}

function VoucherCodeCell({ item }: { item: Voucher }) {
  return (
    <div className="news-list__cell">
      <div className="news-list__title">{item.code}</div>
      <div className="news-list__excerpt is-empty">—</div>
    </div>
  );
}

function VoucherActionCell(props: {
  hidden: boolean;
  item: Voucher;
  onOpen: (item: Voucher) => void;
}) {
  const { t } = useTranslation();
  if (props.hidden) return <HiddenActionCell />;

  return (
    <div
      className="news-list__cell news-list__cell--action"
      onClick={(event) => openFromAction(event, props)}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <span className="edit-trigger" role="button" tabIndex={0} aria-label={t("common.admin.vouchers.row.edit")}>
        <img src="/icons/edit.svg" alt="" aria-hidden="true" className="icon-img" />
      </span>
    </div>
  );
}

function HiddenActionCell() {
  return (
    <div
      className="news-list__cell news-list__cell--action news-list__actions--hidden"
      aria-hidden="true"
    />
  );
}

function openFromAction(
  event: React.MouseEvent<HTMLDivElement>,
  props: { item: Voucher; onOpen: (item: Voucher) => void },
) {
  event.stopPropagation();
  props.onOpen(props.item);
}

function handleRowKeyDown(event: React.KeyboardEvent, action: () => void) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  action();
}

function rowClassName(checked: boolean, selectMode: boolean) {
  return `list__item chip news-list__row is-fullhover is-interactive ${
    checked ? "is-selected" : ""
  } ${selectMode ? "is-selectmode" : ""}`;
}

function rowLabel(
  t: (key: string) => string,
  item: Voucher,
  selectMode: boolean,
) {
  const key = selectMode ? "common.admin.vouchers.row.select" : "common.admin.vouchers.row.open";
  return `${t(key)}: ${item.code}`;
}

function statusText(t: (key: string) => string, active: boolean) {
  return active
    ? t("common.admin.vouchers.status.active")
    : t("common.admin.vouchers.status.inactive");
}
