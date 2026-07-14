import type { Feedback, FeedbackCategory, LocalizedText } from "./types";

export const FEEDBACKS_API = "/api/admin/feedbacks";

export const UPLOAD_API = "/api/uploads/feedbacks";

export const FEEDBACK_CATEGORIES: FeedbackCategory[] = [
  "parents",
  "players",
  "coaches",
  "partners",
];

export const EMPTY_LOCALIZED_TEXT: LocalizedText = {
  de: "",
  en: "",
  tr: "",
};

export const EMPTY_FEEDBACK: Feedback = {
  category: "parents",
  imageUrl: "",
  quote: { ...EMPTY_LOCALIZED_TEXT },
  author: "",
  meta: { ...EMPTY_LOCALIZED_TEXT },
  isActive: true,
  sortOrder: 100,
};
