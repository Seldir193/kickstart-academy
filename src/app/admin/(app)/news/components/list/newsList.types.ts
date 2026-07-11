import type { News } from "../../types";

export type ProviderInfo = {
  id: string;
  fullName: string;
  email: string;
} | null;

export type NewsWithProvider = News & {
  provider?: ProviderInfo;
  providerId?: string;
};

export type NewsListProps = {
  items: NewsWithProvider[];
  selected: Set<string>;
  isSelectMode: boolean;
  onOpen: (news: News) => void;
  onToggle: (id: string) => void;
};
