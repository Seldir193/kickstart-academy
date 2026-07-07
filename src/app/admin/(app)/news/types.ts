// src/app/admin/(app)/news/types.ts
//export type Category = "Allgemein" | "News" | "Partnerverein" | "Projekte";
export type Category = "General" | "News" | "Partner Club" | "Projects";
export type Status = "pending" | "approved" | "rejected";
export type SortKey = "newest" | "oldest" | "title_asc" | "title_desc";

export type MediaItem = {
  type: "image" | "video";
  url: string;
  alt?: string;
  title?: string;
  mimetype?: string;
};

export type NewsUploadPurpose = "news-cover" | "news-media";

export type ProviderInfo = {
  id: string;
  fullName: string;
  email: string;
};

export type NewsTranslation = {
  title: string;
  excerpt: string;
  content: string;
};

export type NewsI18n = {
  en: NewsTranslation;
  tr: NewsTranslation;
};

export type NewsDraft = Partial<{
  title: string;
  slug: string;
  category: Category;
  tags: string[];
  excerpt: string;
  content: string;
  i18n: NewsI18n;
  coverImage: string;
  coverCaption: string;
  media: MediaItem[];
}>;

export type News = {
  _id?: string;

  providerId?: string;
  provider?: ProviderInfo | null;

  date: string;
  title: string;
  slug: string;

  category: Category;
  tags: string[];

  excerpt: string;
  content: string;
  i18n?: NewsI18n;

  coverImage: string;
  coverCaption?: string;
  media: MediaItem[];

  status?: Status;
  published: boolean;

  everPublished?: boolean;

  approvedAt?: string | null;
  liveUpdatedAt?: string | null;
  submittedAt?: string | null;

  rejectionReason?: string;
  rejectedAt?: string | null;

  lastProviderEditAt?: string | null;
  lastSuperEditAt?: string | null;

  hasDraft?: boolean;
  draftUpdatedAt?: string | null;
  draft?: NewsDraft;

  createdAt?: string;
  updatedAt?: string;
};

export type PageBlock = {
  items: News[];
  total: number;
  page: number;
  pages: number;
};

export type ListResponse = {
  ok?: boolean;
  error?: string;

  items?: News[];
  total?: number;
  page?: number;
  pages?: number;

  combined?: boolean;
  mine?: PageBlock;
  providerPending?: PageBlock;
  providerApproved?: PageBlock;
  providerRejected?: PageBlock;
};
