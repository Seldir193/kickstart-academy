"use client";

import { useTranslation } from "react-i18next";
import type { Voucher } from "../../types";
import VoucherTableRow from "./VoucherTableRow";
import { voucherId } from "./vouchersTable.helpers";

type VouchersTableProps = {
  items: Voucher[];
  selectMode: boolean;
  selected: Set<string>;
  onOpen: (item: Voucher) => void;
  onRowClick: (item: Voucher) => void;
};

const HEAD_KEYS = ["code", "amount", "status", "created", "action"];

export default function VouchersTable(props: VouchersTableProps) {
  return (
    <div className="news-table__scroll">
      <section className="card news-list">
        <div className="news-list__table">
          <VoucherTableHead />
          <VoucherRows {...props} />
        </div>
      </section>
    </div>
  );
}

function VoucherTableHead() {
  const { t } = useTranslation();

  return (
    <div className="news-list__head" aria-hidden="true">
      {HEAD_KEYS.map((key, index) => (
        <HeadCell
          key={key}
          label={t(`common.admin.vouchers.table.${key}`)}
          right={index === 4}
        />
      ))}
    </div>
  );
}

function HeadCell({ label, right }: { label: string; right: boolean }) {
  return (
    <div className={`news-list__h${right ? " news-list__h--right" : ""}`}>
      {label}
    </div>
  );
}

function VoucherRows(props: VouchersTableProps) {
  return (
    <ul className="list list--bleed">
      {props.items.map((item) => (
        <VoucherRow key={voucherId(item)} item={item} {...props} />
      ))}
    </ul>
  );
}

function VoucherRow({
  item,
  ...props
}: VouchersTableProps & { item: Voucher }) {
  const id = voucherId(item);
  return (
    <VoucherTableRow
      item={item}
      selectMode={props.selectMode}
      checked={props.selected.has(id)}
      onOpen={props.onOpen}
      onRowClick={props.onRowClick}
    />
  );
}
