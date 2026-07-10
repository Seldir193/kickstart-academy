"use client";

import type { TFunction } from "i18next";
import type { PlacesSelection, PlacesTableProps } from "./types";
import PlacesTableHead from "./PlacesTableHead";
import PlacesTableRows from "./PlacesTableRows";

type Props = {
  props: PlacesTableProps;
  selection: PlacesSelection;
  t: TFunction;
};

export default function PlacesTable({ props, selection, t }: Props) {
  return (
    <div className="news-table__scroll">
      <section className="card news-list">
        <div className="news-list__table">
          <PlacesTableHead t={t} />
          <PlacesTableRows props={props} selection={selection} t={t} />
        </div>
      </section>
    </div>
  );
}
