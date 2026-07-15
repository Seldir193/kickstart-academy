"use client";

import { useTranslation } from "react-i18next";
import type { Coach } from "../../types";
import { canSubmitUpdate } from "../../utils";
import { cleanStr } from "../../pageHelpers";
import CoachTableSection from "./CoachTableSection";
import type { CoachPageModel } from "./types";

export default function OwnCoachSections({ model }: { model: CoachPageModel }) {
  const { t } = useTranslation();
  if (model.isSuper) return <SuperOwnApprovedSection model={model} />;
  return (
    <>
      <PendingOwnSection
        model={model}
        title={t("common.admin.coaches.page.coachesPendingReview")}
      />
      <ApprovedOwnSection
        model={model}
        title={t("common.admin.coaches.page.coachesApproved")}
      />
      <RejectedOwnSection
        model={model}
        title={t("common.admin.coaches.page.coachesRejected")}
      />
    </>
  );
}

function PendingOwnSection({ model, title }: SectionProps) {
  return (
    <CoachTableSection
      title={title}
      count={model.state.myLists.pending.length}
      page={model.state.myPending.page}
      pages={model.state.myPending.pages}
      onPrev={() => prevMyPending(model)}
      onNext={() => nextMyPending(model)}
      tableProps={pendingProps(model)}
    />
  );
}

function ApprovedOwnSection({ model, title }: SectionProps) {
  return (
    <CoachTableSection
      title={title}
      count={model.state.myLists.approved.length}
      page={model.state.myApproved.page}
      pages={model.state.myApproved.pages}
      onPrev={() => prevMyApproved(model)}
      onNext={() => nextMyApproved(model)}
      tableProps={approvedProps(model, true)}
    />
  );
}

function RejectedOwnSection({ model, title }: SectionProps) {
  return (
    <CoachTableSection
      title={title}
      count={model.state.myLists.rejected.length}
      page={model.state.myRejected.page}
      pages={model.state.myRejected.pages}
      onPrev={() => prevMyRejected(model)}
      onNext={() => nextMyRejected(model)}
      tableProps={rejectedProps(model)}
    />
  );
}

function SuperOwnApprovedSection({ model }: { model: CoachPageModel }) {
  const { t } = useTranslation();
  return (
    <CoachTableSection
      title={t("common.admin.coaches.page.myCoachesApproved")}
      count={model.state.myLists.approved.length}
      page={model.state.myApproved.page}
      pages={model.state.myApproved.pages}
      onPrev={() => prevMyApproved(model)}
      onNext={() => nextMyApproved(model)}
      tableProps={approvedProps(model, false)}
    />
  );
}

type SectionProps = { model: CoachPageModel; title: string };

function pendingProps(model: CoachPageModel) {
  return {
    items: model.state.myPending.slice,
    selectMode: model.state.selects.selectMyPending,
    onToggleSelectMode: () =>
      model.state.selects.setSelectMyPending((selected: boolean) => !selected),
    busy: model.muts.mutating,
    onOpen: model.dialogs.setEditItem,
    onDeleteMany: model.muts.deleteMany,
    toggleBtnRef: model.refs.myPendingToggleRef,
    authorDash: true,
    meLabel: model.meLabel,
    onDelete: model.openDelete,
  };
}

function approvedProps(model: CoachPageModel, authorDash: boolean) {
  return {
    items: model.state.myApproved.slice,
    selectMode: model.state.selects.selectMyApproved,
    onToggleSelectMode: () =>
      model.state.selects.setSelectMyApproved((selected: boolean) => !selected),
    busy: model.muts.mutating,
    onOpen: model.dialogs.setEditItem,
    onDeleteMany: model.muts.deleteMany,
    toggleBtnRef: model.refs.myApprovedToggleRef,
    authorDash,
    meLabel: model.meLabel,
    onUnapprove: model.isSuper ? model.openDelete : undefined,
    onInfo: (coach: Coach) => openPublishedInfo(model, coach),
    onResubmit: resubmitHandler(model, authorDash),
    canResubmit: authorDash ? canSubmitUpdate : undefined,
    onTogglePublished: model.togglePublished,
    publishedBusyId: model.busy.publishedBusyId,
    onDelete: model.isSuper ? undefined : model.openDelete,
  };
}

function rejectedProps(model: CoachPageModel) {
  return {
    items: model.state.myRejected.slice,
    selectMode: model.state.selects.selectMyRejected,
    onToggleSelectMode: () =>
      model.state.selects.setSelectMyRejected((selected: boolean) => !selected),
    busy: model.muts.mutating,
    onOpen: model.dialogs.setEditItem,
    onDeleteMany: model.muts.deleteMany,
    toggleBtnRef: model.refs.myRejectedToggleRef,
    authorDash: true,
    meLabel: model.meLabel,
    onDelete: model.openDelete,
    onInfo: (coach: Coach) => openRejectInfo(model, coach),
    onResubmit: (coach: Coach) => submitCoach(model, coach),
    canResubmit: canSubmitUpdate,
  };
}

function openPublishedInfo(model: CoachPageModel, coach: Coach) {
  model.dialogs.setPublishedInfoTarget(coach);
  model.dialogs.setPublishedInfoOpen(true);
}

function openRejectInfo(model: CoachPageModel, coach: Coach) {
  model.dialogs.setRejectInfoTarget(coach);
  model.dialogs.setRejectInfoOpen(true);
}

function resubmitHandler(model: CoachPageModel, enabled: boolean) {
  if (!enabled) return undefined;
  return (coach: Coach) => submitCoach(model, coach);
}

function submitCoach(model: CoachPageModel, coach: Coach) {
  model.muts.handleSubmit(cleanStr(coach.slug));
}

function prevMyPending(model: CoachPageModel) {
  model.state.pages.setPageMyPending((page: number) => Math.max(1, page - 1));
}

function nextMyPending(model: CoachPageModel) {
  model.state.pages.setPageMyPending((page: number) =>
    Math.min(model.state.myPending.pages, page + 1),
  );
}

function prevMyApproved(model: CoachPageModel) {
  model.state.pages.setPageMyApproved((page: number) => Math.max(1, page - 1));
}

function nextMyApproved(model: CoachPageModel) {
  model.state.pages.setPageMyApproved((page: number) =>
    Math.min(model.state.myApproved.pages, page + 1),
  );
}

function prevMyRejected(model: CoachPageModel) {
  model.state.pages.setPageMyRejected((page: number) => Math.max(1, page - 1));
}

function nextMyRejected(model: CoachPageModel) {
  model.state.pages.setPageMyRejected((page: number) =>
    Math.min(model.state.myRejected.pages, page + 1),
  );
}
