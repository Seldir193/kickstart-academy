import type { Feedback, FeedbackCategory, LocalizedText } from "./types";
import { EMPTY_FEEDBACK } from "./constants";

export function getFeedbackId(item: Feedback) {
  return String(item._id || "").trim();
}

export function cloneLocalizedText(value?: LocalizedText): LocalizedText {
  return {
    de: value?.de || "",
    en: value?.en || "",
    tr: value?.tr || "",
  };
}

export function cloneFeedback(item?: Feedback): Feedback {
  return {
    ...EMPTY_FEEDBACK,
    ...item,
    quote: cloneLocalizedText(item?.quote),
    meta: cloneLocalizedText(item?.meta),
  };
}

export function getFeedbackCategoryKey(category: FeedbackCategory) {
  return `admin.feedbacks.category.${category}`;
}

export function sortFeedbacks(items: Feedback[]) {
  return [...items].sort(compareFeedbacks);
}

function compareFeedbacks(a: Feedback, b: Feedback) {
  const order = Number(a.sortOrder || 100) - Number(b.sortOrder || 100);
  return order || String(a.author || "").localeCompare(String(b.author || ""));
}