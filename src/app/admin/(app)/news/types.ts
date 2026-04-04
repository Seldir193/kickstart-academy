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

export type ProviderInfo = {
  id: string;
  fullName: string;
  email: string;
};

export type NewsDraft = Partial<{
  title: string;
  slug: string;
  category: Category;
  tags: string[];
  excerpt: string;
  content: string;
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

// // src/app/admin/news/types.ts
// export type Category = "Allgemein" | "News" | "Partnerverein" | "Projekte";

// export type MediaItem = {
//   type: "image" | "video";
//   url: string;
//   alt?: string;
//   title?: string;
//   mimetype?: string;
// };

// export type NewsDraft = Partial<{
//   title: string;
//   slug: string;
//   category: Category;
//   tags: string[];
//   excerpt: string;
//   content: string;
//   coverImage: string;
//   coverCaption: string;
//   media: MediaItem[];
// }>;

// export type News = {
//   _id?: string;
//   providerId?: any;

//   date: string;
//   title: string;
//   slug: string;

//   category: Category;
//   tags: string[];

//   excerpt: string;
//   content: string;

//   coverImage: string;
//   coverCaption?: string;

//   media: MediaItem[];

//   published: boolean;

//   everPublished?: boolean;

//   approvedAt?: string | null;
//   liveUpdatedAt?: string | null;
//   submittedAt?: string | null;

//   rejectionReason?: string;
//   rejectedAt?: string;

//   hasDraft?: boolean;
//   draftUpdatedAt?: string;
//   draft?: NewsDraft;

//   createdAt?: string;
//   updatedAt?: string;
// };

// export type ListResponse = {
//   ok?: boolean;

//   items?: News[];
//   total?: number;
//   page?: number;
//   pages?: number;

//   combined?: boolean;
//   mine?: { items: News[]; total: number; page: number; pages: number };
//   providerPending?: {
//     items: News[];
//     total: number;
//     page: number;
//     pages: number;
//   };
//   providerApproved?: {
//     items: News[];
//     total: number;
//     page: number;
//     pages: number;
//   };
//   providerRejected?: {
//     items: News[];
//     total: number;
//     page: number;
//     pages: number;
//   };

//   minePending?: { items: News[]; total: number; page: number; pages: number };
//   mineApproved?: { items: News[]; total: number; page: number; pages: number };
//   mineRejected?: { items: News[]; total: number; page: number; pages: number };

//   error?: string;
// };
