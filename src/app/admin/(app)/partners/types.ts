export type Partner = {
  _id?: string;
  name: string;
  normalizedName?: string;
  logoUrl: string;
  url: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiResponse = {
  ok?: boolean;
  error?: string;
};

export type PartnerListResponse = ApiResponse & {
  items?: Partner[];
};
