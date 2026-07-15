"use client";

import { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSelection } from "@/app/admin/(app)/news/hooks/useSelection";
import { idOf } from "./lib/placeTable";
import { usePlacesSelectionFocus } from "./usePlacesSelectionFocus";
import PlacesEmptyState from "./PlacesEmptyState";
import PlacesBulkActions from "./PlacesBulkActions";
import PlacesTable from "./PlacesTable";
import type { PlacesTableProps } from "./types";

export default function PlacesTableListContent(props: PlacesTableProps) {
  const model = usePlacesTableContent(props);
  if (!props.items.length)
    return <PlacesEmptyState busy={props.busy} t={model.t} />;

  return (
    <div className="news-table">
      <PlacesBulkActions
        props={props}
        selection={model.selection}
        count={model.count}
        cancelRef={model.cancelRef}
        clearRef={model.clearRef}
        t={model.t}
      />
      <PlacesTable props={props} selection={model.selection} t={model.t} />
    </div>
  );
}

function usePlacesTableContent(props: PlacesTableProps) {
  const { t } = useTranslation();
  const idsOnPage = useMemo(
    () => props.items.map(idOf).filter(Boolean),
    [props.items],
  );
  const selection = useSelection(idsOnPage);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const clearRef = useRef<HTMLButtonElement | null>(null);
  const count = selection.selected.size;

  usePlacesSelectionFocus(props.selectMode, count, clearRef, cancelRef);
  return { t, selection, cancelRef, clearRef, count };
}
