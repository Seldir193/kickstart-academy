"use client";

import CoachesDialogMount from "./CoachesDialogMount";
import CoachesFeedbackCards from "./CoachesFeedbackCards";
import OwnCoachSections from "./OwnCoachSections";
import ProviderCoachSections from "./ProviderCoachSections";
import ProviderPendingSection from "./ProviderPendingSection";
import CoachesToolbar from "./CoachesToolbar";
import { useCoachesAdminPage } from "./useCoachesAdminPage";
import type { CoachPageModel } from "./types";

export default function CoachesAdminPageContent() {
  const model = useCoachesAdminPage();
  return <CoachesPageFrame model={model} />;
}

function CoachesPageFrame({ model }: { model: CoachPageModel }) {
  return (
    <div className="coaches coaches-admin ks">
      <CoachesMain model={model} />
      <CoachesDialogMount model={model} />
    </div>
  );
}

function CoachesMain({ model }: { model: CoachPageModel }) {
  return (
    <main className="container">
      <CoachesToolbar model={model} />
      <CoachesFeedbackCards error={model.error} notice={model.muts.notice} />
      <ProviderPendingSection model={model} />
      <ProviderCoachSections model={model} />
      <OwnCoachSections model={model} />
    </main>
  );
}
