import { useTranslation } from "react-i18next";
import type { FranchiseLocation } from "../../types";
import { useFranchiseLocationsPage } from "../../hooks/useFranchiseLocationsPage";
import FranchiseLocationsDialogs from "./FranchiseLocationsDialogs";
import FranchiseLocationsNotice from "./FranchiseLocationsNotice";
import FranchiseLocationsSections from "./FranchiseLocationsSections";
import FranchiseLocationsStatusCards from "./FranchiseLocationsStatusCards";
import FranchiseLocationsToolbar from "./FranchiseLocationsToolbar";
import { useLocationDeleteState } from "./useLocationDeleteState";

export default function FranchiseLocationsPageContent() {
  const p = useFranchiseLocationsPage();
  const { t } = useTranslation();
  const deleteState = useLocationDeleteState(p);
  return (
    <div className="franchise-locations fl-admin ks">
      <main className="container">
        <FranchiseLocationsNotice p={p} />
        <FranchiseLocationsToolbar p={p} t={t} />
        <FranchiseLocationsStatusCards p={p} t={t} />
        <FranchiseLocationsSections
          p={p}
          t={t}
          handlers={deleteHandlers(deleteState.openDelete)}
        />
      </main>
      <FranchiseLocationsDialogs p={p} t={t} deleteState={deleteState} />
    </div>
  );
}

function deleteHandlers(
  openDelete: (item: FranchiseLocation, mode: "mine" | "admin") => void,
) {
  return {
    openDeleteMine: (item: FranchiseLocation) => openDelete(item, "mine"),
    openDeleteAdmin: (item: FranchiseLocation) => openDelete(item, "admin"),
  };
}
