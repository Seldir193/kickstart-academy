"use client";

import { useTranslation } from "react-i18next";
import type { Voucher } from "../../types";
import VoucherTableRow from "./VoucherTableRow";
import { voucherId } from "./vouchersTable.helpers";

export default function VouchersTable(props: {
  items: Voucher[];
  selectMode: boolean;
  selected: Set<string>;
  onOpen: (item: Voucher) => void;
  onRowClick: (item: Voucher) => void;
}) {
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
  const keys = ["code", "amount", "status", "created", "action"];

  return (
    <div className="news-list__head" aria-hidden="true">
      {keys.map((key, index) => (
        <div key={key} className={`news-list__h${index === 4 ? " news-list__h--right" : ""}`}>
          {t(`common.admin.vouchers.table.${key}`)}
        </div>
      ))}
    </div>
  );
}

function VoucherRows(props: {
  items: Voucher[];
  selectMode: boolean;
  selected: Set<string>;
  onOpen: (item: Voucher) => void;
  onRowClick: (item: Voucher) => void;
}) {
  return (
    <ul className="list list--bleed">
      {props.items.map((item) => {
        const id = voucherId(item);
        return (
          <VoucherTableRow
            key={id}
            item={item}
            selectMode={props.selectMode}
            checked={props.selected.has(id)}
            onOpen={props.onOpen}
            onRowClick={props.onRowClick}
          />
        );
      })}
    </ul>
  );
}
