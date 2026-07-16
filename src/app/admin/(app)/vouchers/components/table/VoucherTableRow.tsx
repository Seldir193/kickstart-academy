"use client";

import { useTranslation } from "react-i18next";
import type { Voucher } from "../../types";
import { formatDateOnly } from "../../utils/dateFormat";
import { formatVoucherAmount } from "./vouchersTable.helpers";

type Translate = ReturnType<typeof useTranslation>["t"];

type VoucherRowProps = {
  item: Voucher;
  selectMode: boolean;
  checked: boolean;
  onOpen: (item: Voucher) => void;
  onRowClick: (item: Voucher) => void;
};

type RowCellsView = VoucherRowProps & { t: Translate; language: string };

export default function VoucherTableRow(props: VoucherRowProps) {
  const { t, i18n } = useTranslation();

  return (
    <li {...rowAttrs(props, t)}>
      <RowCells {...props} t={t} language={i18n.language} />
    </li>
  );
}

function RowCells(view: RowCellsView) {
  return (
    <>
      <VoucherCodeCell item={view.item} />
      <AmountCell item={view.item} />
      <StatusCell item={view.item} t={view.t} />
      <CreatedCell item={view.item} language={view.language} />
      <VoucherActionCell {...actionProps(view)} />
    </>
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

function AmountCell({ item }: { item: Voucher }) {
  return (
    <div className="news-list__cell bookings-mono">
      {formatVoucherAmount(item.amount)}
    </div>
  );
}

function StatusCell({ item, t }: { item: Voucher; t: Translate }) {
  return <div className="news-list__cell">{statusText(t, item.active)}</div>;
}

function CreatedCell({ item, language }: { item: Voucher; language: string }) {
  return (
    <div className="news-list__cell">
      {formatDateOnly(item.createdAt, language)}
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
      <EditTrigger t={t} />
    </div>
  );
}

function EditTrigger({ t }: { t: Translate }) {
  return (
    <span
      className="edit-trigger"
      role="button"
      tabIndex={0}
      aria-label={t("common.admin.vouchers.row.edit")}
    >
      <EditIcon />
    </span>
  );
}

function EditIcon() {
  return (
    <img src="/icons/edit.svg" alt="" aria-hidden="true" className="icon-img" />
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

function rowAttrs(
  props: VoucherRowProps,
  t: Translate,
): React.LiHTMLAttributes<HTMLLIElement> {
  const { item, selectMode, checked } = props;
  return {
    className: rowClassName(checked, selectMode),
    onClick: () => props.onRowClick(item),
    onKeyDown: (event) => handleRowKeyDown(event, () => props.onRowClick(item)),
    tabIndex: 0,
    role: "button",
    "aria-pressed": selectMode ? checked : undefined,
    "aria-label": rowLabel(t, item, selectMode),
  };
}

function actionProps(view: RowCellsView) {
  return {
    hidden: view.selectMode || view.checked,
    item: view.item,
    onOpen: view.onOpen,
  };
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
  const key = selectMode
    ? "common.admin.vouchers.row.select"
    : "common.admin.vouchers.row.open";
  return `${t(key)}: ${item.code}`;
}

function statusText(t: (key: string) => string, active: boolean) {
  return active
    ? t("common.admin.vouchers.status.active")
    : t("common.admin.vouchers.status.inactive");
}
