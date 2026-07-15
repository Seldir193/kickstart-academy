export type FeedbackCategory = "parents" | "players" | "coaches" | "partners";

export type LocalizedText = {
  de: string;
  en: string;
  tr: string;
};

export type Feedback = {
  _id?: string;
  category: FeedbackCategory;
  imageUrl: string;
  quote: LocalizedText;
  author: string;
  meta: LocalizedText;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiResponse = {
  ok?: boolean;
  error?: string;
};

export type FeedbackListResponse = ApiResponse & {
  items?: Feedback[];
};
