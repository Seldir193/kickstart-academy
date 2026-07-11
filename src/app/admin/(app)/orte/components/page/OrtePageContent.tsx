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
      <PlacesMain model={model} t={t} />
      <PlacesDialogMount model={model} />
    </div>
  );
}

type MainProps = {
  model: ReturnType<typeof useOrtePageState>;
  t: ReturnType<typeof useTranslation>["t"];
};

function PlacesMain({ model, t }: MainProps) {
  return (
    <main className="container">
      <PlacesToolbar model={model} t={t} />
      <PlacesError error={model.list.error} />
      <PlacesSection model={model} t={t} />
    </main>
  );
}
