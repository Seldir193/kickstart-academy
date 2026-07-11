import type { News } from "../../types";

export type NewsInfoDialogProps = {
  open: boolean;
  item: News | null;
  onClose: () => void;
};

export type NewsInfoDialogData = {
  title: string;
  status: string;
  category: string;
  slug: string;
  tags: string[];
  approvedAt: string;
  liveUpdatedAt: string;
  submittedAt: string;
  lastProviderEditAt: string;
  lastSuperEditAt: string;
};
