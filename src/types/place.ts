export type Place = {
  _id: string;
  name: string;
  address: string;
  zip: string;
  city: string;
  lat?: number | null;
  lng?: number | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PlaceListResponse = {
  items: Place[];
  total: number;
  page: number;
  pageSize: number;
};
