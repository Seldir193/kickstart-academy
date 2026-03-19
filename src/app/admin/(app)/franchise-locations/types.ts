// src/app/admin/franchise-locations/types.ts
export type LocationStatus = "pending" | "approved" | "rejected";

export type OwnerUser = {
  id: string;
  fullName: string;
  email: string;
  firstName: string;
  lastName: string;
} | null;

export type FranchiseLocationDraft = Partial<{
  licenseeFirstName: string;
  licenseeLastName: string;
  country: string;
  city: string;
  state: string;
  address: string;
  zip: string;
  website: string;
  emailPublic: string;
  phonePublic: string;
}>;

export type FranchiseLocation = {
  id: string;

  owner: string;

  ownerId?: string;
  ownerName?: string | null;
  ownerEmail?: string | null;

  ownerUser: OwnerUser;

  licenseeFirstName: string;
  licenseeLastName: string;

  country: string;
  city: string;

  state: string;
  address: string;
  zip: string;

  website: string;
  emailPublic: string;
  phonePublic: string;

  status: LocationStatus;
  published: boolean;

  rejectionReason: string;

  approvedAt: string | null;
  liveUpdatedAt: string | null;
  draftUpdatedAt: string | null;
  rejectedAt: string | null;
  submittedAt: string | null;

  lastProviderEditAt: string | null;
  lastSuperEditAt: string | null;

  hasDraft: boolean;
  draft: FranchiseLocationDraft;

  createdAt: string;
  updatedAt: string;
};

export type LocationPayload = Partial<{
  country: string;
  city: string;
  state: string;
  address: string;
  zip: string;
  website: string;
  emailPublic: string;
  phonePublic: string;

  licenseeFirstName: string;
  licenseeLastName: string;

  submitForReview: boolean;

  published: boolean;

  status: LocationStatus;
  rejectionReason: string;

  owner: string;

  ownerName: string | null;
  ownerEmail: string | null;
  ownerId: string | null;
}>;
