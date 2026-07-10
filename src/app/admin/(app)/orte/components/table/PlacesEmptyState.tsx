"use client";

import type { TFunction } from "i18next";

type Props = {
  busy: boolean;
  t: TFunction;
};

export default function PlacesEmptyState({ busy, t }: Props) {
  return (
    <section className="card">
      <div className="card__empty">{emptyText(busy, t)}</div>
    </section>
  );
}

function emptyText(busy: boolean, t: TFunction) {
  if (busy) return t("common.admin.places.list.loading", { defaultValue: "Loading..." });
  return t("common.admin.places.list.empty", { defaultValue: "No entries." });
}
