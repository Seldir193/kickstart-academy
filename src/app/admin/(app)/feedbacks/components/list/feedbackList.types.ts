import type { Feedback } from "../../types";

export type FeedbackListProps = {
  items: Feedback[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  busyItemId: string;
  onPrev: () => void;
  onNext: () => void;
  onEdit: (item: Feedback) => void;
  onDelete: (item: Feedback) => void;
  onToggle: (item: Feedback) => void;
  onBulkDelete: (items: Feedback[]) => Promise<void>;
  onBulkDeactivate: (items: Feedback[]) => Promise<void>;
};
