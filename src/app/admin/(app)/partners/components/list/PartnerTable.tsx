import { useTranslation } from "react-i18next";
import PartnerCard from "../PartnerCard";
import { getPartnerId } from "../../helpers";
import PartnerBulkToolbar from "./PartnerBulkToolbar";
import type { PartnerTableProps } from "./partnerList.types";

export default function PartnerTable({ props, selection }: PartnerTableProps) {
  return (
    <div className="news-admin__box news-admin__box--scroll3">
      <div className="news-table">
        <div className="news-admin__top-actions">
          <PartnerBulkToolbar props={props} selection={selection} />
        </div>
        {renderScrollSection({ props, selection })}
      </div>
    </div>
  );
}

function renderScrollSection({ props, selection }: PartnerTableProps) {
  return (
    <div className="news-table__scroll">
      <section className="card news-list">
        <div className="news-list__table">
          <PartnerTableHead />
          <PartnerRows props={props} selection={selection} />
        </div>
      </section>
    </div>
  );
}

function PartnerRows({ props, selection }: PartnerTableProps) {
  return (
    <ul className="list list--bleed partner-admin__list">
      {props.items.map((item) => renderPartnerCard(item, props, selection))}
    </ul>
  );
}

function renderPartnerCard(
  item: PartnerTableProps["props"]["items"][number],
  props: PartnerTableProps["props"],
  selection: PartnerTableProps["selection"],
) {
  const id = getPartnerId(item);
  return (
    <PartnerCard
      key={id}
      item={item}
      busyItemId={props.busyItemId}
      selectMode={selection.selectMode}
      selected={selection.selectedIds.has(id)}
      onEdit={props.onEdit}
      onDelete={props.onDelete}
      onToggle={props.onToggle}
      onSelect={selection.toggleOne}
    />
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
