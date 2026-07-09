import type { RefObject } from "react";
import type { FranchiseLocation } from "../../types";
import type { RowMode } from "../LocationsTableList.helpers";
import type { useSelection } from "../../hooks/useSelection";

export type LocationsTableListProps = {
  items: FranchiseLocation[];
  rowMode: RowMode;
  selectMode: boolean;
  onToggleSelectMode: () => void;
  busy: boolean;
  onOpen: (it: FranchiseLocation) => void;
  onInfo?: (it: FranchiseLocation) => void;
  onResubmit?: (it: FranchiseLocation) => void;
  onSubmitForReview?: (it: FranchiseLocation) => void;
  onAskReject?: (it: FranchiseLocation) => void;
  onDeleteOne?: (it: FranchiseLocation) => void;
  onDeleteMany?: (ids: string[]) => Promise<void>;
  publishedBusyId?: string | null;
  onTogglePublished?: LocationToggleHandler;
  toggleBtnRef?: RefObject<HTMLButtonElement | null>;
};

export type LocationToggleHandler = (
  it: FranchiseLocation,
  next: boolean,
) => void | Promise<void>;

export type SelectionState = ReturnType<typeof useSelection>;

export type RowCallbacks = Pick<
  LocationsTableListProps,
  | "onOpen"
  | "onInfo"
  | "onResubmit"
  | "onSubmitForReview"
  | "onAskReject"
  | "onDeleteOne"
  | "onTogglePublished"
>;
