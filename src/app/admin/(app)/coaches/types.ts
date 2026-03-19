// src/app/admin/(app)/coaches/types.ts
export type Me = {
  id: string;
  isSuperAdmin: boolean;
  fullName?: string;
  role?: "super" | "provider";
};

export type SortKey = "newest" | "oldest" | "name_asc" | "name_desc";

export type ProviderInfo = {
  id?: string;
  fullName?: string;
  email?: string;
} | null;

export type CoachStatus = "pending" | "approved" | "rejected";

export type Paged<T> = {
  items: T[];
  total: number;
  pages: number;
  page: number;
  limit: number;
};

export type ListResp =
  | ({
      ok: true;
      combined?: false;
    } & Paged<Coach>)
  | ({
      ok: true;
      combined: true;
      mine: Paged<Coach>;
      providerPending: Paged<Coach>;
      providerRejected: Paged<Coach>;
      providerApproved: Paged<Coach>;
    } & Partial<Paged<Coach>>)
  | {
      ok?: false;
      error?: string;
      items?: Coach[];
      total?: number;
      pages?: number;
      page?: number;
      limit?: number;
      combined?: boolean;
    };

export type Coach = {
  _id?: string;
  slug: string;

  firstName?: string;
  lastName?: string;
  name?: string;

  position?: string;
  degree?: string;
  since?: string;
  dfbLicense?: string;
  mfsLicense?: string;
  favClub?: string;
  favCoach?: string;
  favTrick?: string;
  photoUrl?: string;

  providerId?: string;

  published?: boolean;

  status?: CoachStatus;
  rejectionReason?: string;

  submittedAt?: string | null;

  approvedAt?: string | null;
  liveUpdatedAt?: string | null;
  draftUpdatedAt?: string | null;
  rejectedAt?: string | null;

  hasDraft?: boolean;
  draft?: any;

  lastProviderEditAt?: string | null;
  lastSuperEditAt?: string | null;

  lastChangeSummary?: string;
  lastChangeAt?: string | null;

  provider?: ProviderInfo;

  createdAt?: string;
  updatedAt?: string;
};

// // // src/app/admin/(app)/coaches/types.ts

// export type Me = { id: string; isSuperAdmin: boolean };

// export type SortKey = "newest" | "oldest" | "name_asc" | "name_desc";

// export type ListResp = {
//   ok?: boolean;
//   items?: Coach[];
//   total?: number;
//   pages?: number;
//   page?: number;
//   limit?: number;
//   error?: string;
// };

// export type ProviderInfo = {
//   id?: string;
//   fullName?: string;
//   email?: string;
// } | null;

// export type CoachStatus = "pending" | "approved" | "rejected";

// export type Coach = {
//   _id?: string;
//   slug: string;
//   firstName?: string;
//   lastName?: string;
//   name?: string;
//   position?: string;
//   degree?: string;
//   since?: string;
//   dfbLicense?: string;
//   mfsLicense?: string;
//   favClub?: string;
//   favCoach?: string;
//   favTrick?: string;
//   photoUrl?: string;
//   providerId?: string;

//   published?: boolean;

//   status?: CoachStatus;
//   rejectionReason?: string;

//   approvedAt?: string | null;
//   liveUpdatedAt?: string | null;
//   draftUpdatedAt?: string | null;
//   rejectedAt?: string | null;

//   changeTitle?: string;
//   changeUpdatedAt?: string | null;

//   provider?: ProviderInfo;
//   createdAt?: string;
//   updatedAt?: string;
// };
