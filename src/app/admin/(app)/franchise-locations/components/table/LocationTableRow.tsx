import type { KeyboardEvent, PointerEvent } from "react";
import type { FranchiseLocation } from "../../types";
import type { RowMode } from "../LocationsTableList.helpers";
import {
  buildLocationRowState,
  activateRow,
  handleRowKey,
} from "./locationRowState";
import LocationActionsCell from "./LocationActionsCell";
import LocationStatusCell from "./LocationStatusCell";
import LocationTitleCell from "./LocationTitleCell";
import {
  LocationCityCell,
  LocationCountryCell,
  LocationUpdatedCell,
} from "./LocationValueCells";
import type { RowCallbacks, SelectionState } from "./types";

export type LocationTableRowProps = RowCallbacks & {
  item: FranchiseLocation;
  rowMode: RowMode;
  busy: boolean;
  selectMode: boolean;
  selected: boolean;
  showHint: boolean;
  showSwitch: boolean;
  publishedBusyId?: string | null;
  selection: SelectionState;
  t: (key: string) => string;
  lang?: string;
};

export default function LocationTableRow(p: LocationTableRowProps) {
  const s = buildLocationRowState(p);
  return (
    <li {...rowProps(p, s.id)}>
      <LocationTitleCell
        item={p.item}
        showHint={p.showHint}
        hint={s.status.hint}
      />
      <LocationCountryCell item={p.item} />
      <LocationCityCell item={p.item} />
      <LocationStatusCell
        item={p.item}
        status={s.status}
        showSwitch={p.showSwitch}
        published={s.published}
        switchBusy={s.switchBusy}
        switchDisabled={s.switchDisabled}
        onTogglePublished={p.onTogglePublished}
      />
      <LocationUpdatedCell item={p.item} lang={p.lang} />
      <LocationActionsCell hideActions={s.hideActions} actions={s.actions} />
    </li>
  );
}

function rowProps(p: LocationTableRowProps, id: string) {
  const run = () => activateRow({ ...p, selection: p.selection }, id);
  return {
    className: `list__item chip news-list__row is-fullhover is-interactive ${p.selected ? "is-selected" : ""}`,
    onPointerDown: (e: PointerEvent) => preventSelectDrag(e, p.selectMode),
    onClick: run,
    onKeyDown: (e: KeyboardEvent) => handleRowKey(e, run),
    tabIndex: 0,
    role: "button",
    "aria-pressed": p.selectMode ? p.selected : undefined,
  } as const;
}

function preventSelectDrag(e: PointerEvent, selectMode: boolean) {
  if (selectMode) e.preventDefault();
}
