"use client";

import type { TFunction } from "i18next";
import type { useOrtePageState } from "./useOrtePageState";
import PlacesSearch from "./PlacesSearch";
import PlacesSortSelect from "./PlacesSortSelect";
import PlacesCreateButton from "./PlacesCreateButton";

type Props = {
  model: ReturnType<typeof useOrtePageState>;
  t: TFunction;
};

export default function PlacesToolbar({ model, t }: Props) {
  return (
    <div className="ks-places-toolbar ks-places-toolbar--compact">
      <PlacesSearch value={model.q} onChange={model.changeQuery} onClear={model.clearQuery} t={t} />
      <div className="ks-places-toolbar__sort">
        <PlacesSortSelect
          sort={model.sort}
          open={model.sortOpen}
          busy={model.busy}
          t={t}
          triggerRef={model.sortTriggerRef}
          menuRef={model.sortMenuRef}
          setOpen={model.setSortOpen}
          onSortChange={model.changeSort}
        />
      </div>
      <PlacesCreateButton busy={model.busy} onCreate={model.dialog.create} t={t} />
    </div>
  );
}
