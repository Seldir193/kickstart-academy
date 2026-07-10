"use client";

import type { MouseEvent } from "react";
import type { TFunction } from "i18next";
import type { Place } from "@/types/place";
import type { PlacesTableItem } from "./types";

type Props = {
  place: PlacesTableItem;
  onOpen: (place: Place) => void;
  t: TFunction;
};

export default function PlacesEditCell({ place, onOpen, t }: Props) {
  return (
    <div className="news-list__cell news-list__cell--action" onClick={(event) => openPlace(event, place, onOpen)} onMouseDown={stopPropagation}>
      <span className="edit-trigger" role="button" tabIndex={0} aria-label={t("common.admin.places.row.editAria", { defaultValue: "Edit" })}>
        <img src="/icons/edit.svg" alt="" aria-hidden="true" className="icon-img" />
      </span>
    </div>
  );
}

function openPlace(
  event: MouseEvent<HTMLDivElement>,
  place: PlacesTableItem,
  onOpen: (place: Place) => void,
) {
  event.stopPropagation();
  onOpen(place);
}

function stopPropagation(event: MouseEvent<HTMLDivElement>) {
  event.stopPropagation();
}
