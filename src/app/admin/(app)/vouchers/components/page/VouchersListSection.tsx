"use client";

import type { RefObject } from "react";
import { toastText } from "@/lib/toast-messages";
import Pagination from "../../../members/components/Pagination";
import VouchersTableList from "../VouchersTableList";
import type { Voucher } from "../../types";
import type { Translate } from "./voucherOptions";

type VouchersListSectionProps = {
  t: Translate;
  items: Voucher[];
  total: number;
  pages: number;
  pageSafe: number;
  busy: boolean;
  loading: boolean;
  selectMode: boolean;
  toggleBtnRef: RefObject<HTMLButtonElement | null>;
  setPage: (updater: (page: number) => number) => void;
  setSelectMode: (updater: (selectMode: boolean) => boolean) => void;
  onOpen: (item: Voucher) => void;
  onDeleteMany: (ids: string[]) => Promise<void>;
  onActivateMany: (ids: string[]) => Promise<void>;
  onDeactivateMany: (ids: string[]) => Promise<void>;
};

export default function VouchersListSection(props: VouchersListSectionProps) {
  return (
    <section className="news-admin__section">
      <ListCount t={props.t} total={props.total} />
      <TableBox {...props} />
      <Pager {...props} />
    </section>
  );
}

function ListCount({ t, total }: { t: Translate; total: number }) {
  const text = total
    ? `(${total} ${toastText(t, "common.admin.vouchers.count.items", "items")})`
    : "";
  return (
    <div className="news-admin__section-head-number">
      <span className="news-admin__section-meta">{text}</span>
    </div>
  );
}

function TableBox(props: VouchersListSectionProps) {
  return (
    <div className="news-admin__box news-admin__box--scroll3">
      <VouchersTableList
        items={props.items}
        selectMode={props.selectMode}
        busy={props.busy || props.loading}
        onToggleSelectMode={() => props.setSelectMode((prev) => !prev)}
        onOpen={props.onOpen}
        onDeleteMany={props.onDeleteMany}
        onActivateMany={props.onActivateMany}
        onDeactivateMany={props.onDeactivateMany}
        toggleBtnRef={props.toggleBtnRef}
      />
    </div>
  );
}

function Pager(props: VouchersListSectionProps) {
  if (props.pages <= 1) return null;
  return (
    <div className="mt-3">
      <Pagination
        page={props.pageSafe}
        pages={props.pages}
        onPrev={() => props.setPage((page) => Math.max(1, page - 1))}
        onNext={() => props.setPage((page) => Math.min(props.pages, page + 1))}
      />
    </div>
  );
}
