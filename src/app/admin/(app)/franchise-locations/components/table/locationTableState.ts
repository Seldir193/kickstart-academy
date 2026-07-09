import type { FranchiseLocation } from "../../types";
import { canTogglePublished } from "../../franchise_locations.utils";
import type { RowMode } from "../LocationsTableList.helpers";

export function canShowSwitch(rowMode: RowMode) {
  return rowMode === "mine_approved" || rowMode === "provider_approved";
}

export function isMineRow(rowMode: RowMode) {
  return rowMode.startsWith("mine_");
}

export function isSwitchBusy(publishedBusyId: string | null | undefined, id: string) {
  return Boolean(publishedBusyId && publishedBusyId === id);
}

export function getPublished(it: FranchiseLocation) {
  return Boolean((it as any)?.published);
}

export function getCanToggle(it: FranchiseLocation, mineRow: boolean) {
  return mineRow ? canTogglePublished(it) : true;
}
