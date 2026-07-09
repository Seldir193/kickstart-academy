export type Offer = {
  _id: string;
  title?: string;
  type?: string;
  sub_type?: string;
  category?: string;
  location?: string;
  price?: number;
  updatedAt?: string;
  coachImage?: string;
  coachName?: string;
};

export type OffersResponse = { items: Offer[]; total: number };

export type AdminHomeCounts = {
  onlineCount: number;
  placesCount: number;
  newsletterLeads: number;
  openBookingsCount: number;
};

export type RecentOffersState = {
  items: Offer[];
  total: number;
  loadingList: boolean;
};
