import type { ComponentProps, RefObject } from "react";
import type CoachTableList from "../CoachTableList";
import type { Coach } from "../../types";
import type { useCoachesPageMutations } from "../../hooks/useCoachesPageMutations";
import type { useCoachesPageState } from "../../hooks/useCoachesPageState";

export type CoachesState = ReturnType<typeof useCoachesPageState>;
export type CoachesMutations = ReturnType<typeof useCoachesPageMutations>;
export type CoachTableProps = ComponentProps<typeof CoachTableList>;

export type CoachRefs = {
  approvedProvidersToggleRef: RefObject<HTMLButtonElement | null>;
  rejectedProvidersToggleRef: RefObject<HTMLButtonElement | null>;
  myPendingToggleRef: RefObject<HTMLButtonElement | null>;
  myApprovedToggleRef: RefObject<HTMLButtonElement | null>;
  myRejectedToggleRef: RefObject<HTMLButtonElement | null>;
};

export type CoachDialogState = {
  createOpen: boolean;
  setCreateOpen: (open: boolean) => void;
  editItem: Coach | null;
  setEditItem: (coach: Coach | null) => void;
  deleteOpen: boolean;
  setDeleteOpen: (open: boolean) => void;
  deleteTarget: Coach | null;
  setDeleteTarget: (coach: Coach | null) => void;
  rejectOpen: boolean;
  setRejectOpen: (open: boolean) => void;
  rejectTarget: Coach | null;
  setRejectTarget: (coach: Coach | null) => void;
  rejectInfoOpen: boolean;
  setRejectInfoOpen: (open: boolean) => void;
  rejectInfoTarget: Coach | null;
  setRejectInfoTarget: (coach: Coach | null) => void;
  publishedInfoOpen: boolean;
  setPublishedInfoOpen: (open: boolean) => void;
  publishedInfoTarget: Coach | null;
  setPublishedInfoTarget: (coach: Coach | null) => void;
};

export type CoachBusyState = {
  pendingBusySlug: string | null;
  setPendingBusySlug: (slug: string | null) => void;
  publishedBusyId: string | null;
  setPublishedBusyId: (id: string | null) => void;
};

export type CoachPageModel = {
  state: CoachesState;
  muts: CoachesMutations;
  dialogs: CoachDialogState;
  busy: CoachBusyState;
  refs: CoachRefs;
  isSuper: boolean;
  loading: boolean;
  error: string | null;
  meLabel: string;
  pendingCount: number;
  openDelete: (coach: Coach) => void;
  togglePublished: (coach: Coach, next: boolean) => Promise<void>;
};
