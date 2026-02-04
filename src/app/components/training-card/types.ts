export type Offer = {
  _id: string;
  title?: string;
  type?: string;
  sub_type?: string;
  category?: string;
  legacy_type?: string;
  location?: string;
  price?: number;
  days?: string[];
  timeFrom?: string;
  timeTo?: string;
  ageFrom?: number | null;
  ageTo?: number | null;
  info?: string;
  onlineActive?: boolean;
  coachName?: string;
  coachEmail?: string;
  coachImage?: string;
  placeId?: string;
};

export type OffersResponse = { items: Offer[]; total: number };
