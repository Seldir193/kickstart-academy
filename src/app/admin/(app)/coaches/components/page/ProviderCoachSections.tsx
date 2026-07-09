"use client";

import { useTranslation } from "react-i18next";
import type { Coach } from "../../types";
import CoachTableSection from "./CoachTableSection";
import type { CoachPageModel } from "./types";

export default function ProviderCoachSections({ model }: { model: CoachPageModel }) {
  const { t } = useTranslation();
  if (!model.isSuper) return null;
  return (
    <>
      <ApprovedProvidersSection model={model} title={t("common.admin.coaches.page.providersApproved")} />
      <RejectedProvidersSection model={model} title={t("common.admin.coaches.page.providersRejected")} />
    </>
  );
}

function ApprovedProvidersSection({ model, title }: SectionProps) {
  return <CoachTableSection title={title} count={model.state.providersApprovedAll.length} page={model.state.providersApproved.page} pages={model.state.providersApproved.pages} onPrev={() => prevApproved(model)} onNext={() => nextApproved(model)} tableProps={approvedProps(model)} />;
}

function RejectedProvidersSection({ model, title }: SectionProps) {
  return <CoachTableSection title={title} count={model.state.providersRejectedAll.length} page={model.state.providersRejected.page} pages={model.state.providersRejected.pages} onPrev={() => prevRejected(model)} onNext={() => nextRejected(model)} tableProps={rejectedProps(model)} />;
}

type SectionProps = { model: CoachPageModel; title: string };

function approvedProps(model: CoachPageModel) {
  return { items: model.state.providersApproved.slice, selectMode: model.state.selects.selectApprovedProviders, onToggleSelectMode: () => model.state.selects.setSelectApprovedProviders((selected: boolean) => !selected), busy: model.muts.mutating, onOpen: model.dialogs.setEditItem, onDeleteMany: model.muts.deleteMany, toggleBtnRef: model.refs.approvedProvidersToggleRef, onInfo: (coach: Coach) => openPublishedInfo(model, coach), onUnapprove: model.openDelete, onReject: (coach: Coach) => openReject(model, coach), meLabel: model.meLabel, onTogglePublished: model.togglePublished, publishedBusyId: model.busy.publishedBusyId };
}

function rejectedProps(model: CoachPageModel) {
  return { items: model.state.providersRejected.slice, selectMode: model.state.selects.selectRejectedProviders, onToggleSelectMode: () => model.state.selects.setSelectRejectedProviders((selected: boolean) => !selected), busy: model.muts.mutating, onOpen: model.dialogs.setEditItem, onDeleteMany: model.muts.deleteMany, toggleBtnRef: model.refs.rejectedProvidersToggleRef, onInfo: (coach: Coach) => openRejectInfo(model, coach), onUnapprove: model.openDelete, meLabel: model.meLabel };
}

function openPublishedInfo(model: CoachPageModel, coach: Coach) {
  model.dialogs.setPublishedInfoTarget(coach);
  model.dialogs.setPublishedInfoOpen(true);
}

function openRejectInfo(model: CoachPageModel, coach: Coach) {
  model.dialogs.setRejectInfoTarget(coach);
  model.dialogs.setRejectInfoOpen(true);
}

function openReject(model: CoachPageModel, coach: Coach) {
  model.dialogs.setRejectTarget(coach);
  model.dialogs.setRejectOpen(true);
}

function prevApproved(model: CoachPageModel) {
  model.state.pages.setPageApprovedProviders((page: number) => Math.max(1, page - 1));
}

function nextApproved(model: CoachPageModel) {
  model.state.pages.setPageApprovedProviders((page: number) => Math.min(model.state.providersApproved.pages, page + 1));
}

function prevRejected(model: CoachPageModel) {
  model.state.pages.setPageRejectedProviders((page: number) => Math.max(1, page - 1));
}

function nextRejected(model: CoachPageModel) {
  model.state.pages.setPageRejectedProviders((page: number) => Math.min(model.state.providersRejected.pages, page + 1));
}
