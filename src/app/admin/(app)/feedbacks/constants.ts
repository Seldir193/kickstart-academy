import type { FeedbackCategory } from "./types";

export const FEEDBACKS_API = "/api/admin/feedbacks";
export const UPLOAD_API = "/api/admin/upload";

export const FEEDBACK_CATEGORIES: FeedbackCategory[] = [
  "parents",
  "players",
  "coaches",
  "partners",
];

export const EMPTY_LOCALIZED_TEXT = {
  de: "",
  en: "",
  tr: "",
};

export const EMPTY_FEEDBACK = {
  category: "parents" as FeedbackCategory,
  imageUrl: "",
  quote: EMPTY_LOCALIZED_TEXT,
  author: "",
  meta: EMPTY_LOCALIZED_TEXT,
  isActive: true,
  sortOrder: 100,
};