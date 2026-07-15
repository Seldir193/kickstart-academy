import type { RefObject } from "react";
import type { Coach } from "../../types";

export type CoachTableListProps = {
  items: Coach[];
  selectMode: boolean;
  onToggleSelectMode: () => void;
  busy: boolean;
  authorDash?: boolean;
  meLabel?: string;
  onOpen: (c: Coach) => void;
  onDeleteMany: (slugs: string[]) => Promise<void>;
  toggleBtnRef?: RefObject<HTMLButtonElement | null>;
  onInfo?: (c: Coach) => void;
  onUnapprove?: (c: Coach) => void;
  onReject?: (c: Coach) => void;
  onResubmit?: (c: Coach) => void;
  canResubmit?: (c: Coach) => boolean;
  onDelete?: (c: Coach) => void;
  onTogglePublished?: (
    c: Coach,
    nextPublished: boolean,
  ) => void | Promise<void>;
  publishedBusyId?: string | null;
};

export type CoachRowActionProps = Pick<
  CoachTableListProps,
  | "busy"
  | "onOpen"
  | "onInfo"
  | "onUnapprove"
  | "onReject"
  | "onResubmit"
  | "onDelete"
>;

export type CoachRowMeta = {
  raw: Coach;
  displayCoach: Coach;
  slug: string;
  checked: boolean;
  hideActions: boolean;
  approved: boolean;
  rejected: boolean;
  published: boolean;
  isSwitchBusy: boolean;
  showSubmit: boolean;
  submitDisabled: boolean;
  statusClass: string;
};

export type CoachTableHandlers = {
  rowClick: (coach: Coach) => void;
  toggleAll: () => void;
  clearSelection: () => void;
  deleteSelected: () => Promise<void>;
  toggleMode: () => void;
};
