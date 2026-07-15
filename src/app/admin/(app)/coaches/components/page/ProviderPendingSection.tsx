"use client";

import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import PendingCoachesList from "../PendingCoachesList";
import type { Coach } from "../../types";
import { cleanStr } from "../../pageHelpers";
import CoachesSection from "./CoachesSection";
import type { CoachPageModel } from "./types";

export default function ProviderPendingSection({
  model,
}: {
  model: CoachPageModel;
}) {
  const { t } = useTranslation();
  if (!model.isSuper) return null;
  return (
    <CoachesSection {...sectionProps(model, t)}>
      {model.loading && !model.state.split
        ? loadingCard(t)
        : pendingList(model)}
    </CoachesSection>
  );
}

function sectionProps(model: CoachPageModel, t: TFunction) {
  return {
    title: t("common.admin.coaches.page.providersPendingReview"),
    meta: pendingMeta(model, t),
    page: model.state.providersPending.page,
    pages: model.state.providersPending.pages,
    onPrev: () => prevPending(model),
    onNext: () => nextPending(model),
  };
}

function pendingMeta(model: CoachPageModel, t: TFunction) {
  return model.pendingCount
    ? t("common.admin.coaches.page.countNew", { count: model.pendingCount })
    : "";
}

function loadingCard(t: TFunction) {
  return (
    <section className="card">
      <div className="card__empty">
        {t("common.admin.coaches.page.loading")}
      </div>
    </section>
  );
}

function pendingList(model: CoachPageModel) {
  return (
    <PendingCoachesList
      items={model.state.providersPending.slice}
      onOpen={model.dialogs.setEditItem}
      onApprove={(coach) => approvePending(model, coach)}
      onReject={(coach) => rejectPending(model, coach)}
      busy={model.muts.mutating}
      busySlug={model.busy.pendingBusySlug}
    />
  );
}

async function approvePending(model: CoachPageModel, coach: Coach) {
  const slug = cleanStr(coach.slug);
  if (!slug || model.muts.mutating) return;
  model.busy.setPendingBusySlug(slug);
  try {
    await model.muts.handleApprove(slug);
  } finally {
    model.busy.setPendingBusySlug(null);
  }
}

function rejectPending(model: CoachPageModel, coach: Coach) {
  const slug = cleanStr(coach.slug);
  if (!slug || model.muts.mutating) return;
  model.busy.setPendingBusySlug(slug);
  model.dialogs.setRejectTarget(coach);
  model.dialogs.setRejectOpen(true);
}

function prevPending(model: CoachPageModel) {
  model.state.pages.setPagePendingProviders((page: number) =>
    Math.max(1, page - 1),
  );
}

function nextPending(model: CoachPageModel) {
  model.state.pages.setPagePendingProviders((page: number) =>
    Math.min(model.state.providersPending.pages, page + 1),
  );
}
