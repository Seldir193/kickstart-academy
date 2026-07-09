import { useTranslation } from "react-i18next";
import { canShowSwitch } from "./locationTableState";
import LocationsBulkActionsBar from "./LocationsBulkActionsBar";
import LocationsTableCard from "./LocationsTableCard";
import LocationsTableEmptyState from "./LocationsTableEmptyState";
import useLocationsTableSelection from "./useLocationsTableSelection";
import type { LocationsTableListProps } from "./types";

export default function LocationsTableListContent(p: LocationsTableListProps) {
  const { t, i18n } = useTranslation();
  const state = useLocationsTableSelection(p);
  if (!p.items.length) return <LocationsTableEmptyState t={t} />;
  return (
    <>
      <LocationsBulkActionsBar {...p} {...state} cancelRef={state.refs.cancelBtnRef} clearRef={state.refs.clearBtnRef} onDelete={() => void state.deleteSelected()} />
      <LocationsTableCard {...p} selection={state.selection} showSwitch={canShowSwitch(p.rowMode)} t={t} lang={i18n.language} />
    </>
  );
}
