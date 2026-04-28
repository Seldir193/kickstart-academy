"use client";

import { useTranslation } from "react-i18next";
import type { Partner } from "../types";
import PartnerCard from "./PartnerCard";
import PartnerPagination from "./PartnerPagination";
import { getPartnerId } from "../helpers";

type Props = {
  items: Partner[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  busyItemId: string;
  onPrev: () => void;
  onNext: () => void;
  onEdit: (item: Partner) => void;
  onDelete: (item: Partner) => void;
  onToggle: (item: Partner) => void;
};

export default function PartnerList(props: Props) {
  const { t } = useTranslation();
  const hasItems = props.items.length > 0;

  if (props.loading && !hasItems) {
    return <div className="card">{t("admin.partners.loading")}</div>;
  }

  if (!props.loading && !hasItems) {
    return <div className="card">{t("admin.partners.empty")}</div>;
  }

  return (
    <section className="news-admin__section">
      <PartnerCounter total={props.total} />
      <PartnerTable {...props} />
      <PartnerPagination
        page={props.page}
        totalPages={props.totalPages}
        onPrev={props.onPrev}
        onNext={props.onNext}
      />
    </section>
  );
}

function PartnerCounter({ total }: { total: number }) {
  return (
    <div className="news-admin__section-head-number">
      <span className="news-admin__section-meta">
        {total ? `(${total})` : ""}
      </span>
    </div>
  );
}

function PartnerTable(props: Props) {
  return (
    <div className="news-admin__box news-admin__box--scroll3">
      <div className="news-table">
        <div className="news-table__scroll">
          <section className="card news-list">
            <div className="news-list__table">
              <PartnerTableHead />
              <PartnerRows {...props} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function PartnerRows(props: Props) {
  return (
    <ul className="list list--bleed partner-admin__list">
      {props.items.map((item) => (
        <PartnerCard
          key={getPartnerId(item)}
          item={item}
          busyItemId={props.busyItemId}
          onEdit={props.onEdit}
          onDelete={props.onDelete}
          onToggle={props.onToggle}
        />
      ))}
    </ul>
  );
}

function PartnerTableHead() {
  const { t } = useTranslation();

  return (
    <div className="news-list__head partner-admin__head-row" aria-hidden="true">
      <div className="news-list__h">{t("admin.partners.table.logo")}</div>
      <div className="news-list__h">{t("admin.partners.table.name")}</div>
      <div className="news-list__h">{t("admin.partners.table.url")}</div>
      <div className="news-list__h">{t("admin.partners.table.order")}</div>
      <div className="news-list__h">{t("admin.partners.table.status")}</div>
      <div className="news-list__h">{t("admin.partners.table.updated")}</div>
      <div className="news-list__h news-list__h--right">
        {t("admin.partners.table.actions")}
      </div>
    </div>
  );
}
