"use client";

import { useTranslation } from "react-i18next";
import PartnerPagination from "../PartnerPagination";
import PartnerTable from "./PartnerTable";
import type { PartnerListProps } from "./partnerList.types";
import { usePartnerSelection } from "./usePartnerSelection";

export default function PartnerListContent(props: PartnerListProps) {
  const { t } = useTranslation();
  const selection = usePartnerSelection(props.items);
  const hasItems = props.items.length > 0;

  if (props.loading && !hasItems) return <Message text={t("admin.partners.loading")} />;
  if (!props.loading && !hasItems) return <Message text={t("admin.partners.empty")} />;

  return (
    <section className="news-admin__section">
      <PartnerCounter total={props.total} />
      <PartnerTable props={props} selection={selection} />
      <PartnerPagination
        page={props.page}
        totalPages={props.totalPages}
        onPrev={props.onPrev}
        onNext={props.onNext}
      />
    </section>
  );
}

function Message({ text }: { text: string }) {
  return <div className="card">{text}</div>;
}

function PartnerCounter({ total }: { total: number }) {
  return (
    <div className="news-admin__section-head-number">
      <span className="news-admin__section-meta">{total ? `(${total})` : ""}</span>
    </div>
  );
}
