import type { Feedback, FeedbackCategory, LocalizedText } from "./types";
import { EMPTY_FEEDBACK } from "./constants";

export type FeedbackCategoryFilter = FeedbackCategory | "all";


export type FeedbackSortKey = "newest" | "oldest" | "aToZ" | "zToA";

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
  return [...items].sort(compareFeedbacksByOrderAndAuthor);
}

export function filterFeedbacks(
  items: Feedback[],
  query: string,
  category: FeedbackCategoryFilter,
) {
  return items.filter((item) => matchesFeedback(item, query, category));
}

export function paginateFeedbacks(
  items: Feedback[],
  page: number,
  pageSize: number,
) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

function matchesFeedback(
  item: Feedback,
  query: string,
  category: FeedbackCategoryFilter,
) {
  const matchesCategory = category === "all" || item.category === category;
  const matchesQuery = matchesFeedbackQuery(item, query);
  return matchesCategory && matchesQuery;
}

function matchesFeedbackQuery(item: Feedback, query: string) {
  const term = query.trim().toLowerCase();
  if (!term) return true;
  return getFeedbackSearchText(item).includes(term);
}

function getFeedbackSearchText(item: Feedback) {
  return [
    item.author,
    item.category,
    item.quote.de,
    item.quote.en,
    item.quote.tr,
    item.meta.de,
    item.meta.en,
    item.meta.tr,
  ]
    .join(" ")
    .toLowerCase();
}

export function sortFilteredFeedbacks(
  items: Feedback[],
  sort: FeedbackSortKey,
) {
  return [...items].sort((a, b) => compareFilteredFeedbacks(a, b, sort));
}

function compareFilteredFeedbacks(
  a: Feedback,
  b: Feedback,
  sort: FeedbackSortKey,
) {
  if (sort === "aToZ") return compareAuthor(a, b);
  if (sort === "zToA") return compareAuthor(b, a);
  return compareFeedbackDates(a, b, sort);
}

function compareFeedbackDates(
  a: Feedback,
  b: Feedback,
  sort: FeedbackSortKey,
) {
  const diff = feedbackTimestamp(b) - feedbackTimestamp(a);
  return sort === "oldest" ? diff * -1 : diff;
}

function feedbackTimestamp(item: Feedback) {
  const value = item.updatedAt || item.createdAt || "";
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function compareFeedbacksByOrderAndAuthor(a: Feedback, b: Feedback) {
  const orderDiff = Number(a.sortOrder || 100) - Number(b.sortOrder || 100);
  return orderDiff || compareAuthor(a, b);
}

function compareAuthor(a: Feedback, b: Feedback) {
  return String(a.author || "").localeCompare(String(b.author || ""));
}

export function isDuplicateFeedback(items: Feedback[], draft: Feedback) {
  return items.some((item) => isSameFeedback(item, draft));
}

function isSameFeedback(item: Feedback, draft: Feedback) {
  const itemId = getFeedbackId(item);
  const draftId = getFeedbackId(draft);

  if (itemId && draftId && itemId === draftId) return false;

  return (
    normalizeFeedbackValue(item.author) === normalizeFeedbackValue(draft.author) &&
    item.category === draft.category &&
    normalizeFeedbackValue(item.quote.de) === normalizeFeedbackValue(draft.quote.de)
  );
}

function normalizeFeedbackValue(value?: string) {
  return String(value || "").trim().toLowerCase();
}