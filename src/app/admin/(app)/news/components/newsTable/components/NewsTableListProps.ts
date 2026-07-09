import type { RefObject } from "react";
import type { News } from "../../../types";
import type { NewsWithProvider, RowMode } from "../types";

export type Props = {
  items: NewsWithProvider[];
  rowMode: RowMode;
  selectMode: boolean;
  onToggleSelectMode: () => void;
  busy: boolean;
  onOpen: (n: News) => void;
  onInfo: (n: News) => void;
  onResubmit?: (n: News) => void;
  onSubmitForReview?: (n: News) => void;
  onAskReject?: (n: News) => void;
  onDeleteOne?: (n: News) => void;
  onDeleteMany?: (ids: string[]) => Promise<void>;
  publishedBusyId?: string | null;
  onTogglePublished?: (n: News, next: boolean) => void | Promise<void>;
  toggleBtnRef?: RefObject<HTMLButtonElement | null>;
};
