"use client";

import type { KeyboardEvent } from "react";
import type { TFunction } from "i18next";
import { displayPlaceId, safeText } from "@/app/admin/(app)/orte/utils";
import { idOf, rowAriaLabel, rowClassName, toggleOrOpen } from "./lib/placeTable";
import type { PlacesSelection, PlacesTableItem, PlacesTableProps } from "./types";
import PlacesEditCell from "./PlacesEditCell";
import PlacesHiddenActionCell from "./PlacesHiddenActionCell";

type Props = {
  place: PlacesTableItem;
  props: PlacesTableProps;
  selection: PlacesSelection;
  t: TFunction;
};

export default function PlacesTableRow(input: Props) {
  const id = idOf(input.place);
  const checked = input.selection.selected.has(id);

  return (
    <li className={rowClassName(checked, input.props.selectMode)} onClick={() => openRow(input)} onKeyDown={(event) => handleKey(event, input)} tabIndex={0} role="button" aria-pressed={input.props.selectMode ? checked : undefined} aria-label={rowAriaLabel(input.place, input.props.selectMode, input.t)}>
      <PlaceCells place={input.place} />
      {input.props.selectMode || checked ? <PlacesHiddenActionCell /> : <PlacesEditCell place={input.place} onOpen={input.props.onOpen} t={input.t} />}
    </li>
  );
}

function PlaceCells({ place }: { place: PlacesTableItem }) {
  return (
    <>
      <div className="news-list__cell places-mono">{displayPlaceId(place)}</div>
      <PlaceNameCell place={place} />
      <div className="news-list__cell news-list__cell--addr">{safeText(place.address) || "—"}</div>
      <div className="news-list__cell places-mono">{safeText(place.zip) || "—"}</div>
      <div className="news-list__cell news-list__cell--city">{safeText(place.city) || "—"}</div>
    </>
  );
}

function PlaceNameCell({ place }: { place: PlacesTableItem }) {
  return (
    <div className="news-list__cell">
      <div className="news-list__title">{safeText(place.name) || "—"}</div>
      <div className="news-list__excerpt is-empty">—</div>
    </div>
  );
}

function openRow({ place, props, selection }: Props) {
  toggleOrOpen(place, props.selectMode, selection.toggleOne, props.onOpen);
}

function handleKey(event: KeyboardEvent<HTMLLIElement>, input: Props) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  openRow(input);
}
