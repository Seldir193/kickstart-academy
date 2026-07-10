"use client";

import { useTranslation } from "react-i18next";
import { useOrtePageState } from "./useOrtePageState";
import PlacesToolbar from "./PlacesToolbar";
import PlacesError from "./PlacesError";
import PlacesSection from "./PlacesSection";
import PlacesDialogMount from "./PlacesDialogMount";

export default function OrtePageContent() {
  const { t } = useTranslation();
  const model = useOrtePageState();

  return (
    <div className="news-admin ks places-admin">
      <main className="container">
        <PlacesToolbar model={model} t={t} />
        <PlacesError error={model.list.error} />
        <PlacesSection model={model} t={t} />
      </main>
      <PlacesDialogMount model={model} />
    </div>
  );
}
