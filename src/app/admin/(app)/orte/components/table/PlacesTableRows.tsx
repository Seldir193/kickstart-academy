"use client";

import type { TFunction } from "i18next";
import { idOf } from "./lib/placeTable";
import type { PlacesSelection, PlacesTableProps } from "./types";
import PlacesTableRow from "./PlacesTableRow";

type Props = {
  props: PlacesTableProps;
  selection: PlacesSelection;
  t: TFunction;
};

export default function PlacesTableRows({ props, selection, t }: Props) {
  return (
    <ul className="list list--bleed">
      {props.items.map((place) => (
        <PlacesTableRow
          key={idOf(place)}
          place={place}
          props={props}
          selection={selection}
          t={t}
        />
      ))}
    </ul>
  );
}
