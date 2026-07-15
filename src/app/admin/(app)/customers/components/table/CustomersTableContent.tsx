"use client";

import { useTranslation } from "react-i18next";
import CustomersTableBody from "./CustomersTableBody";
import CustomersTableHead from "./CustomersTableHead";
import type { CustomersTableProps } from "./types";

function cardClass(showListLoading: boolean): string {
  return (
    "card admin-card p-0 ks-customers-card ks-customers-list" +
    (showListLoading ? " is-loading" : "")
  );
}

export default function CustomersTableContent(props: CustomersTableProps) {
  const { t } = useTranslation();
  return (
    <div className="ks-customers-table-scroll">
      <section className={cardClass(props.showListLoading)}>
        <div className="ks-customers-list__table">
          <CustomersTableHead t={t} />
          <CustomersTableBody {...props} t={t} />
        </div>
      </section>
    </div>
  );
}
