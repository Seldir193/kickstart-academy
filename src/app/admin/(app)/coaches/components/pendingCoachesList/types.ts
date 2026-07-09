import type { TFunction } from "i18next";
import type { Coach } from "../../types";

export type Translate = TFunction;

export type PendingCoachesListProps = {
  items: Coach[];
  onOpen: (c: Coach) => void;
  onApprove: (c: Coach) => void;
  onReject: (c: Coach) => void;
  busy: boolean;
  busySlug?: string | null;
};

export type PendingCoachActionProps = {
  c: Coach;
  disabled: boolean;
  onOpen: (c: Coach) => void;
  onApprove: (c: Coach) => void;
  onReject: (c: Coach) => void;
  t: Translate;
};
