import type { News } from "../../types";

export type PendingNews = News;

export type PendingNewsListProps = {
  items: PendingNews[];
  loading?: boolean;
  onApprove: (news: News) => void;
  onReject: (news: News, reason: string) => void;
  onOpen: (news: News) => void;
  onAskReject: (news: News) => void;
};
