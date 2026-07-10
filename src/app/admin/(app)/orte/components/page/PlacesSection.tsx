"use client";

import type { TFunction } from "i18next";
import PlacesTableList from "@/app/admin/(app)/orte/components/PlacesTableList";
import type { useOrtePageState } from "./useOrtePageState";
import PlacesPager from "./PlacesPager";

type Props = {
  model: ReturnType<typeof useOrtePageState>;
  t: TFunction;
};

export default function PlacesSection({ model, t }: Props) {
  return (
    <section className="news-admin__section">
      <PlacesSectionCount total={model.list.total} />
      <PlacesTableBox model={model} />
      <PlacesPager model={model} t={t} />
    </section>
  );
}

function PlacesSectionCount({ total }: { total: number }) {
  return (
    <div className="news-admin__section-head-number">
      <span className="news-admin__section-meta">{total ? `(${total})` : ""}</span>
    </div>
  );
}

function PlacesTableBox({ model }: { model: ReturnType<typeof useOrtePageState> }) {
  return (
    <div className={tableBoxClassName(model.busy, model.list.items.length)}>
      <PlacesTableList
        items={model.sortedItems}
        selectMode={model.selection.selectMode}
        onToggleSelectMode={model.selection.toggle}
        busy={model.busy}
        onOpen={model.dialog.edit}
        onDeleteMany={model.handleDeleteMany}
        toggleBtnRef={model.selection.toggleBtnRef}
      />
    </div>
  );
}

function tableBoxClassName(busy: boolean, itemCount: number) {
  return "news-admin__box news-admin__box--scroll3" + (!busy && !itemCount ? " is-empty" : "");
}
